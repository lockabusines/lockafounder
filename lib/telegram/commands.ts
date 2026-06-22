import { createServiceClient } from '@/lib/supabase'
import { completeHabit, getStats } from '@/lib/game/engine'
import { rankTitle } from '@/lib/game/xp'
import { sendTelegram } from './send'

const USER_ID = process.env.USER_ID ?? 'ernest'

export async function handleCommand(command: string, args: string, chatId: number): Promise<boolean> {
  const db = createServiceClient()

  switch (command) {
    case '/today': {
      const today = new Date().toISOString().slice(0, 10)
      const todayDow = new Date().getDay()

      const [{ data: tasks }, { data: habits }, { data: stats }] = await Promise.all([
        db.from('tasks').select('id, title, urgency, xp_value').eq('user_id', USER_ID).eq('status', 'open').in('urgency', ['today', 'this_week']).limit(7),
        db.from('habits').select('*').eq('user_id', USER_ID).eq('active', true),
        db.from('user_stats').select('*').eq('user_id', USER_ID).single(),
      ])

      const dueHabits = (habits ?? []).filter((h) => {
        if (h.frequency === 'daily') return true
        if (h.frequency === 'weekdays') return todayDow >= 1 && todayDow <= 5
        if (h.frequency === 'custom' && h.frequency_days) return h.frequency_days.includes(todayDow)
        return false
      })

      const taskList = (tasks ?? []).map((t, i) => `${i + 1}. ${t.title}`).join('\n') || '_Clear queue_'
      const habitList = dueHabits.map((h) => {
        const done = h.last_completed === today ? '✅' : '⬜'
        return `${done} ${h.icon} ${h.name} (${h.current_streak}d streak)`
      }).join('\n')

      const xpPct = stats ? Math.round((stats.xp / stats.xp_next_level) * 100) : 0
      await sendTelegram(chatId, `*LEVEL ${stats?.level ?? 1} — ${rankTitle(stats?.level ?? 1)}*\n⚡ ${xpPct}% to next level\n\n*QUESTS*\n${taskList}\n\n*HABITS*\n${habitList}`)
      return true
    }

    case '/streak': {
      const { data: habits } = await db.from('habits').select('*').eq('user_id', USER_ID).eq('active', true)
      const lines = (habits ?? []).map((h) =>
        `${h.icon} *${h.name}*: ${h.current_streak}d current · ${h.longest_streak}d best`
      ).join('\n')
      await sendTelegram(chatId, `*HABIT STREAKS*\n━━━━━━━━━━━\n${lines}`)
      return true
    }

    case '/stats': {
      const { data: stats } = await db.from('user_stats').select('*').eq('user_id', USER_ID).single()
      if (!stats) { await sendTelegram(chatId, 'No stats yet.'); return true }
      await sendTelegram(chatId,
        `*LOCKA — ${rankTitle(stats.level)}*\n` +
        `Level ${stats.level} · ${stats.xp}/${stats.xp_next_level} XP\n\n` +
        `💪 Health: ${stats.health}\n` +
        `⚔️ Discipline: ${stats.discipline}\n` +
        `💰 Wealth: ${stats.wealth}\n` +
        `✨ Charisma: ${stats.charisma}\n` +
        `🏢 Business: ${stats.business}\n\n` +
        `Quests: ${stats.total_quests_completed} · Habits: ${stats.total_habits_completed}`
      )
      return true
    }

    case '/complete': {
      // /complete [task number or habit name]
      if (!args.trim()) {
        // Show completable items
        const [{ data: tasks }, { data: habits }] = await Promise.all([
          db.from('tasks').select('id, title').eq('user_id', USER_ID).eq('status', 'open').in('urgency', ['today', 'this_week']).limit(5),
          db.from('habits').select('id, name, icon').eq('user_id', USER_ID).eq('active', true),
        ])
        const taskLines = (tasks ?? []).map((t, i) => `T${i + 1}. ${t.title}`).join('\n')
        const habitLines = (habits ?? []).map((h, i) => `H${i + 1}. ${h.icon} ${h.name}`).join('\n')
        await sendTelegram(chatId, `*What did you complete?*\nReply: /complete T1 or /complete H2\n\n${taskLines}\n\n${habitLines}`)
        return true
      }

      const ref = args.trim().toUpperCase()

      if (ref.startsWith('H')) {
        const idx = parseInt(ref.slice(1)) - 1
        const { data: habits } = await db.from('habits').select('*').eq('user_id', USER_ID).eq('active', true)
        const habit = habits?.[idx]
        if (!habit) { await sendTelegram(chatId, 'Habit not found.'); return true }
        const { xpGained, newStreak } = await completeHabit(habit.id)
        await sendTelegram(chatId, `✅ *${habit.name}* logged\n🔥 Streak: ${newStreak} days\n⚡ +${xpGained} XP`)
        return true
      }

      if (ref.startsWith('T')) {
        const idx = parseInt(ref.slice(1)) - 1
        const { data: tasks } = await db.from('tasks').select('*').eq('user_id', USER_ID).eq('status', 'open').in('urgency', ['today', 'this_week']).limit(5)
        const task = tasks?.[idx]
        if (!task) { await sendTelegram(chatId, 'Quest not found.'); return true }
        await db.from('tasks').update({ status: 'complete', completed_at: new Date().toISOString() }).eq('id', task.id)
        const { awardXP } = await import('@/lib/game/engine')
        const { newLevel, leveledUp } = await awardXP(task.xp_value ?? 40, task.category ?? 'general')
        let reply = `✅ *Quest complete:* ${task.title}\n⚡ +${task.xp_value ?? 40} XP`
        if (leveledUp) reply += `\n\n🎉 *LEVEL UP! You are now Level ${newLevel}*`
        await sendTelegram(chatId, reply)
        return true
      }

      return false
    }

    case '/add': {
      if (!args.trim()) { await sendTelegram(chatId, 'Usage: /add [quest description]'); return true }
      return false
    }

    case '/week': {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const [{ data: done }, { data: habits }, { data: stats }] = await Promise.all([
        db.from('tasks').select('title, xp_value, category').eq('user_id', USER_ID).eq('status', 'complete').gte('completed_at', weekAgo),
        db.from('habits').select('name, icon, current_streak, longest_streak').eq('user_id', USER_ID).eq('active', true),
        db.from('user_stats').select('*').eq('user_id', USER_ID).single(),
      ])

      const totalXP = (done ?? []).reduce((sum: number, t: { xp_value?: number }) => sum + (t.xp_value ?? 0), 0)
      const taskLines = (done ?? []).slice(0, 10).map((t: { title: string }) => `✅ ${t.title}`).join('\n') || '_None yet_'

      // Deduplicate habits by name
      const seen = new Map<string, { name: string; icon: string; current_streak: number; longest_streak: number }>()
      for (const h of (habits ?? [])) {
        if (!seen.has(h.name)) seen.set(h.name, h)
      }
      const uniqueHabits = Array.from(seen.values())
      const habitLines = uniqueHabits.map(h => `${h.icon} ${h.name}: 🔥${h.current_streak}d`).join('\n')

      await sendTelegram(chatId,
        `*WEEK REVIEW*\n━━━━━━━━━━━\n` +
        `Level ${stats?.level ?? 1} · ${stats?.xp ?? 0} XP total\n` +
        `+${totalXP} XP earned this week · ${(done ?? []).length} quests done\n\n` +
        `*QUESTS COMPLETED*\n${taskLines}\n\n` +
        `*HABIT STREAKS*\n${habitLines}`
      )
      return true
    }

    case '/ask': {
      if (!args.trim()) { await sendTelegram(chatId, 'Usage: /ask [question about your life/goals]'); return true }
      const query = args.trim()

      // Search captures for relevant context
      const { data: captures } = await db
        .from('captures')
        .select('raw_text, created_at')
        .eq('user_id', USER_ID)
        .ilike('raw_text', `%${query.split(' ')[0]}%`)
        .order('created_at', { ascending: false })
        .limit(10)

      const context = (captures ?? []).map((c: { raw_text: string; created_at: string }) =>
        `[${c.created_at.slice(0, 10)}] ${c.raw_text}`
      ).join('\n')

      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const ai = new Anthropic()
      const response = await ai.messages.create({
        model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `You are Locka's personal AI. Answer his question based on his captured notes. Be direct, specific, motivating.\n\nHis recent notes:\n${context || 'No relevant notes found.'}\n\nQuestion: ${query}`,
        }],
      })
      const answer = response.content[0].type === 'text' ? response.content[0].text : 'Could not generate answer.'
      await sendTelegram(chatId, answer)
      return true
    }

    case '/help': {
      await sendTelegram(chatId,
        `*SOLO LIFE OS — COMMANDS*\n━━━━━━━━━━━\n` +
        `/today — daily brief (quests + habits + level)\n` +
        `/stats — your full stat sheet\n` +
        `/streak — all habit streaks\n` +
        `/week — weekly review\n` +
        `/complete — mark a quest or habit done\n` +
        `/ask [question] — search your notes with AI\n` +
        `/add [task] — add a quest\n\n` +
        `_Or just send any message to capture a task, thought, or voice note._`
      )
      return true
    }

    default:
      return false
  }
}
