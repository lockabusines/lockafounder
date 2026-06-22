import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { classifyCapture } from '@/lib/router/classifyCapture'
import { awardXP } from '@/lib/game/engine'
import { handleCommand } from '@/lib/telegram/commands'
import { sendTelegram } from '@/lib/telegram/send'
import OpenAI from 'openai'

const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET ?? ''
const ALLOWED_USER_ID = process.env.TELEGRAM_USER_ID ?? ''

function urgencyText(u: number): string {
  if (u >= 5) return 'today'
  if (u >= 4) return 'this_week'
  if (u >= 3) return 'this_month'
  return 'someday'
}

async function downloadVoice(fileId: string): Promise<ArrayBuffer> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const info = await (await fetch(`https://api.telegram.org/bot${token}/getFile`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  })).json() as { result: { file_path: string } }
  return (await fetch(`https://api.telegram.org/file/bot${token}/${info.result.file_path}`)).arrayBuffer()
}

async function transcribeVoice(buf: ArrayBuffer): Promise<string> {
  const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return (await oai.audio.transcriptions.create({ model: 'whisper-1', file: new File([buf], 'voice.ogg', { type: 'audio/ogg' }) })).text
}

async function embedText(text: string): Promise<number[]> {
  const oai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return (await oai.embeddings.create({ model: 'text-embedding-3-small', input: text })).data[0].embedding
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) return new Response('Unauthorized', { status: 401 })

  let update: TelegramUpdate
  try { update = await req.json() } catch { return new Response('Bad Request', { status: 400 }) }

  // ── Callback query (inline button press) ──
  if (update.callback_query) {
    const cb = update.callback_query
    const [prefix, captureId, urgencyStr] = (cb.data ?? '').split(':')
    if (prefix === 'urgency' && captureId && urgencyStr) {
      const db = createServiceClient()
      const { data: row } = await db.from('raw_captures').select('classification').eq('id', captureId).single()
      if (row) {
        await db.from('raw_captures')
          .update({ classification: { ...(row.classification as Record<string, unknown>), urgency: Number(urgencyStr) } })
          .eq('id', captureId)
      }
      const token = process.env.TELEGRAM_BOT_TOKEN
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id, text: `Urgency set to ${urgencyStr}` }),
      })
    }
    return Response.json({ ok: true })
  }

  const message = update.message
  if (!message) return Response.json({ ok: true })

  const senderId = String(message.from?.id ?? '')
  if (ALLOWED_USER_ID && senderId !== ALLOWED_USER_ID) return Response.json({ ok: true })

  const chatId = message.chat.id
  const userId = process.env.USER_ID ?? senderId

  // ── Voice transcription ──
  let rawText = message.text ?? ''
  if (message.voice) {
    try {
      rawText = await transcribeVoice(await downloadVoice(message.voice.file_id))
      await sendTelegram(chatId, `_Transcribed:_ ${rawText}`)
    } catch {
      await sendTelegram(chatId, '❌ Voice transcription failed.')
      return Response.json({ ok: true })
    }
  }

  if (!rawText.trim()) return Response.json({ ok: true })

  // ── Command handling ──
  const cmdMatch = rawText.match(/^(\/\w+)\s*([\s\S]*)$/)
  if (cmdMatch) {
    const [, cmd, args] = cmdMatch
    const handled = await handleCommand(cmd, args, chatId)
    // /add falls through with args as text to capture pipeline
    if (handled || (cmd !== '/add' || !args.trim())) return Response.json({ ok: true })
    rawText = args // treat /add <text> as a capture
  }

  // ── Capture pipeline ──
  const db = createServiceClient()
  const classification = await classifyCapture(rawText)

  const { data: capture, error: captureErr } = await db.from('raw_captures').insert({
    user_id: userId, source: 'telegram', raw_text: rawText,
    classification: classification,
    llm_source: 'anthropic', routed_to: classification.kind,
  }).select('id').single()

  if (captureErr || !capture) {
    await sendTelegram(chatId, '❌ Failed to save.')
    return Response.json({ ok: true })
  }

  const captureId: string = capture.id

  if (classification.kind === 'task') {
    const xpValue = classification.mission_roi >= 4 ? 60 : classification.mission_roi >= 3 ? 45 : 30
    await db.from('tasks').insert({
      user_id: userId, title: classification.summary,
      urgency: urgencyText(classification.urgency),
      tags: classification.tags,
      category: 'general',
      xp_value: xpValue,
      status: 'open',
      mission_roi: classification.mission_roi,
    })
  }

  // Embed
  try {
    const embedding = await embedText(rawText)
    await db.from('memory_chunks').insert({ user_id: userId, source_type: 'capture', source_id: captureId, text: rawText, embedding })
  } catch { /* non-fatal */ }

  // Award XP for the capture itself
  const { leveledUp, newLevel } = await awardXP(10, classification.kind)

  const roiLabels: Record<number, string> = { 5: '💰💰💰 MONEY MOVE', 4: '💰💰 High ROI', 3: '💰 Medium ROI', 2: '📋 Low ROI', 1: '📌 No ROI' }
  const urgencyLabels: Record<number, string> = { 1: '🟢 Low', 2: '🔵 Normal', 3: '🟡 Medium', 4: '🟠 High', 5: '🔴 Critical' }
  const xpGained = classification.mission_roi >= 4 ? 60 : classification.mission_roi >= 3 ? 45 : 30
  let replyText = `✅ *${classification.kind.toUpperCase()}* logged\n_${classification.summary}_\n${roiLabels[classification.mission_roi] ?? '📋'} · ⚡ +${xpGained} XP`
  if (leveledUp) replyText += `\n\n🎉 *LEVEL UP! Level ${newLevel}*`

  await sendTelegram(chatId, replyText, {
    reply_markup: {
      inline_keyboard: [[1, 2, 3, 4, 5].map((u) => ({
        text: urgencyLabels[u] + (u === classification.urgency ? ' ✓' : ''),
        callback_data: `urgency:${captureId}:${u}`,
      }))],
    },
  })

  return Response.json({ ok: true })
}

interface TelegramUpdate {
  message?: { from?: { id: number }; chat: { id: number }; text?: string; voice?: { file_id: string } }
  callback_query?: { id: string; data?: string; from: { id: number } }
}
