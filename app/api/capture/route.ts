import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { classifyCapture } from '@/lib/router/classifyCapture'
import OpenAI from 'openai'

function urgencyText(u: number): string {
  if (u >= 5) return 'today'
  if (u >= 4) return 'this_week'
  if (u >= 3) return 'this_month'
  return 'someday'
}

async function embedText(text: string): Promise<number[]> {
  const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const res = await oai.embeddings.create({ model: 'text-embedding-3-small', input: text })
  return res.data[0].embedding
}

export async function POST(req: NextRequest) {
  let body: { text?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const rawText = (body.text ?? '').trim()
  if (!rawText) return Response.json({ error: 'text is required' }, { status: 400 })

  const db = createServiceClient()
  const userId = process.env.USER_ID ?? 'ernest'
  const classification = await classifyCapture(rawText)

  const { data: capture, error: captureErr } = await db
    .from('raw_captures')
    .insert({
      user_id: userId,
      source: 'web',
      raw_text: rawText,
      classification: {
        kind: classification.kind,
        urgency: classification.urgency,
        entity_id: classification.entity_id,
        tags: classification.tags,
        summary: classification.summary,
      },
      llm_source: 'anthropic',
      routed_to: classification.kind,
    })
    .select('id')
    .single()

  if (captureErr || !capture) {
    return Response.json({ error: 'Failed to save capture' }, { status: 500 })
  }

  const captureId: string = capture.id

  if (classification.kind === 'task') {
    await db.from('tasks').insert({
      user_id: userId,
      title: classification.summary,
      urgency: urgencyText(classification.urgency),
      tags: classification.tags,
      entity_id: classification.entity_id ?? null,
    })
  }

  try {
    const embedding = await embedText(rawText)
    await db.from('memory_chunks').insert({
      user_id: userId,
      source_type: 'capture',
      source_id: captureId,
      text: rawText,
      embedding,
    })
  } catch (err) {
    console.error('[capture] embedding failed:', err)
  }

  await db.from('audit_log').insert({
    user_id: userId,
    action: 'web_capture',
    resource_type: 'raw_captures',
    resource_id: captureId,
    metadata: { kind: classification.kind, urgency: classification.urgency },
  })

  return Response.json({ ok: true, captureId, classification })
}
