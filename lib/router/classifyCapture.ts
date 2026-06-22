import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export type CaptureKind = 'task' | 'note' | 'habit' | 'finance' | 'health' | 'goal' | 'reflection'

export interface ClassifyResult {
  kind: CaptureKind
  urgency: 1 | 2 | 3 | 4 | 5
  entity_id: string | null
  tags: string[]
  summary: string
}

const SYSTEM_PROMPT = `You are a personal assistant classifier. Given a voice or text capture from the user, extract:
- kind: one of task|note|habit|finance|health|goal|reflection
- urgency: 1 (low) to 5 (critical)
- entity_id: relevant entity slug or null
- tags: array of lowercase keyword tags (max 5)
- summary: one concise sentence summary

Respond ONLY with valid JSON matching this shape:
{"kind":"task","urgency":3,"entity_id":null,"tags":["work"],"summary":"..."}`

function parseResult(text: string): ClassifyResult {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  const obj = JSON.parse(match[0])
  return {
    kind: obj.kind ?? 'note',
    urgency: Math.min(5, Math.max(1, Number(obj.urgency) || 3)) as ClassifyResult['urgency'],
    entity_id: obj.entity_id ?? null,
    tags: Array.isArray(obj.tags) ? obj.tags.slice(0, 5) : [],
    summary: String(obj.summary ?? ''),
  }
}

function regexFallback(text: string): ClassifyResult {
  const lower = text.toLowerCase()
  let kind: CaptureKind = 'note'
  if (/\b(task|todo|do|remind|need to|finish|complete)\b/.test(lower)) kind = 'task'
  else if (/\b(buy|spent|cost|paid|invoice|expense)\b/.test(lower)) kind = 'finance'
  else if (/\b(feel|health|sleep|weight|workout|exercise|run|gym)\b/.test(lower)) kind = 'health'
  else if (/\b(goal|want to|plan to|aim|target)\b/.test(lower)) kind = 'goal'
  else if (/\b(habit|daily|every day|routine)\b/.test(lower)) kind = 'habit'
  const urgency = /\b(urgent|asap|critical|emergency|immediately)\b/.test(lower) ? 5 : 3
  return { kind, urgency: urgency as ClassifyResult['urgency'], entity_id: null, tags: [], summary: text.slice(0, 120) }
}

export async function classifyCapture(text: string): Promise<ClassifyResult> {
  // Primary: Claude Opus 4.8
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8'
    const stream = await client.messages.stream({
      model,
      max_tokens: 256,
      thinking: { type: 'adaptive' },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    })
    const msg = await stream.finalMessage()
    const content = msg.content.find((b) => b.type === 'text')
    if (content && content.type === 'text') return parseResult(content.text)
  } catch (err) {
    console.error('[classifyCapture] Claude failed:', err)
  }

  // Fallback: gpt-4o-mini
  try {
    const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const model = process.env.OPENAI_CLASSIFIER_MODEL ?? 'gpt-4o-mini'
    const resp = await oai.chat.completions.create({
      model,
      max_tokens: 256,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    })
    const raw = resp.choices[0]?.message?.content ?? ''
    return parseResult(raw)
  } catch (err) {
    console.error('[classifyCapture] OpenAI fallback failed:', err)
  }

  // Last resort: regex
  return regexFallback(text)
}
