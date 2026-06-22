import { createServiceClient } from '@/lib/supabase'
import { statsFromCategory, calcLevel, xpForLevel } from './xp'

const USER_ID = process.env.USER_ID ?? 'ernest'

export async function awardXP(xp: number, category: string): Promise<{ newLevel: number; leveledUp: boolean; newXp: number }> {
  const db = createServiceClient()

  const { data: stats } = await db
    .from('user_stats')
    .select('*')
    .eq('user_id', USER_ID)
    .single()

  if (!stats) return { newLevel: 1, leveledUp: false, newXp: xp }

  const totalXpBefore = stats.xp + (stats.level - 1) * 0 // stored as current-level xp
  // Recalculate total XP across all levels
  let totalXp = stats.xp
  for (let l = 1; l < stats.level; l++) totalXp += xpForLevel(l)
  totalXp += xp

  const { level, xp: newXp, xpNextLevel } = calcLevel(totalXp)
  const leveledUp = level > stats.level

  const statDeltas = statsFromCategory(category, xp)
  const updates: Record<string, number> = {
    level,
    xp: newXp,
    xp_next_level: xpNextLevel,
    total_quests_completed: stats.total_quests_completed + 1,
  }
  for (const [key, val] of Object.entries(statDeltas)) {
    updates[key] = (stats[key as keyof typeof stats] as number) + val
  }

  await db.from('user_stats').update(updates).eq('user_id', USER_ID)

  return { newLevel: level, leveledUp, newXp }
}

export async function getStats() {
  const db = createServiceClient()
  const { data } = await db.from('user_stats').select('*').eq('user_id', USER_ID).single()
  return data
}

export async function completeHabit(habitId: string): Promise<{ xpGained: number; newStreak: number }> {
  const db = createServiceClient()
  const { data: habit } = await db.from('habits').select('*').eq('id', habitId).single()
  if (!habit) return { xpGained: 0, newStreak: 0 }

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  const lastDone = habit.last_completed
  const newStreak = lastDone === yesterday ? habit.current_streak + 1
    : lastDone === today ? habit.current_streak
    : 1

  await db.from('habits').update({
    last_completed: today,
    current_streak: newStreak,
    longest_streak: Math.max(newStreak, habit.longest_streak),
  }).eq('id', habitId)

  await db.from('audit_log').insert({
    user_id: USER_ID,
    action: 'habit_complete',
    resource_type: 'habits',
    resource_id: habitId,
    metadata: { streak: newStreak, xp: habit.xp_value },
  })

  const { leveledUp } = await awardXP(habit.xp_value, habit.category)
  return { xpGained: habit.xp_value, newStreak }
}
