import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase'
import { rankTitle } from '@/lib/game/xp'
import { sendTelegram } from './send'

const USER_ID = process.env.USER_ID ?? 'ernest'
const CHAT_ID = process.env.TELEGRAM_USER_ID ?? ''

export async function sendMorningSummary() {
  const db = createServiceClient()
  const today = new Date().toISOString().slice(0, 10)
  const dayName = new Date().toLocaleDateString('en-GB', { weekday: 'long' })

  const [{ data: stats }, { data: tasks }, { data: habits }] = await Promise.all([
    db.from('user_stats').select('*').eq('user_id', USER_ID).single(),
    db.from('tasks').select('*').eq('user_id', USER_ID).eq('status', 'open').in('urgency', ['today', 'this_week']).order('urgency').limit(5),
    db.from('habits').select('*').eq('user_id', USER_ID).eq('active', true),
  ])

  // Figure out which habits are due today
  const todayDow = new Date().getDay() // 0=sun
  const dueHabits = (habits ?? []).filter((h) => {
    if (h.frequency === 'daily') return true
    if (h.frequency === 'weekdays') return todayDow >= 1 && todayDow <= 5
    if (h.frequency === 'custom' && h.frequency_days) return h.frequency_days.includes(todayDow)
    return false
  })

  const questLines = (tasks ?? []).map((t, i) =>
    `${i + 1}. ${t.title} *(${t.urgency.replace('_', ' ')})*`
  ).join('\n') || '_No open quests — add some._'

  const habitLines = dueHabits.map((h) =>
    `${h.icon} ${h.name} — streak: *${h.current_streak}d* (+${h.xp_value} XP)`
  ).join('\n')

  const rank = rankTitle(stats?.level ?? 1)
  const xpPct = stats ? Math.round((stats.xp / stats.xp_next_level) * 100) : 0
  const xpBar = '█'.repeat(Math.floor(xpPct / 10)) + '░'.repeat(10 - Math.floor(xpPct / 10))

  // Generate motivational line with Claude
  let motivLine = 'Stay locked in. The work compounds.'
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const resp = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8',
      max_tokens: 60,
      messages: [{
        role: 'user',
        content: `Write one single short motivational line (max 12 words) for a disciplined entrepreneur named Locka starting his ${dayName}. Calm, composed, elite tone. No emojis. No quotes.`,
      }],
    })
    const block = resp.content.find(b => b.type === 'text')
    if (block && block.type === 'text') motivLine = block.text.trim()
  } catch { /* use default */ }

  const message = `*SOLO LIFE OS — ${dayName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━
🎯 *Rank:* ${rank}
⚡ *Level ${stats?.level ?? 1}* — ${xpBar} ${xpPct}%

*TODAY'S QUESTS*
${questLines}

*HABITS DUE*
${habitLines}

━━━━━━━━━━━━━━━━━━━
_${motivLine}_

/today · /streak · /complete`

  await sendTelegram(CHAT_ID, message)
}
