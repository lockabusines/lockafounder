import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

export type CaptureKind = 'task' | 'note' | 'habit' | 'finance' | 'health' | 'goal' | 'reflection'

export interface ClassifyResult {
  kind: CaptureKind
  urgency: 1 | 2 | 3 | 4 | 5
  entity_id: string | null
  tags: string[]
  summary: string
  mission_roi: 1 | 2 | 3 | 4 | 5  // how directly this contributes to making money / retiring mum
}

const SYSTEM_PROMPT = `You are a personal assistant classifier for Locka, a young entrepreneur whose #1 mission is to make enough money to retire his mum. Every task should be scored on how directly it contributes to that mission.

Given a voice or text capture, extract:
- kind: one of task|note|habit|finance|health|goal|reflection
- urgency: 1 (low) to 5 (critical)
- entity_id: relevant entity slug or null
- tags: array of lowercase keyword tags (max 5)
- summary: one concise sentence summary
- mission_roi: 1-5 score for how directly this helps make money / retire mum:
  5 = direct revenue action (sales call, closing deal, invoicing, launching product)
  4 = high-leverage money activity (client outreach, building income stream, pitch prep)
  3 = skill/growth that increases earning (learning, networking, content creation)
  2 = health/discipline that enables peak performance (gym, sleep, meal prep)
  1 = admin, errands, personal tasks with no direct money link

Respond ONLY with valid JSON:
{"kind":"task","urgency":3,"entity_id":null,"tags":["sales"],"summary":"...","mission_roi":4}`

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
    mission_roi: Math.min(5, Math.max(1, Number(obj.mission_roi) || 3)) as ClassifyResult['mission_roi'],
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
  const mission_roi = /\b(sale|client|money|revenue|invoice|business|deal|customer|earn|income)\b/.test(lower) ? 4 : 2
  return { kind, urgency: urgency as ClassifyResult['urgency'], entity_id: null, tags: [], summary: text.slice(0, 120), mission_roi: mission_roi as ClassifyResult['mission_roi'] }
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
