export type StatKey = 'discipline' | 'wealth' | 'health' | 'charisma' | 'business'

export const CATEGORY_STATS: Record<string, StatKey[]> = {
  health:     ['health', 'discipline'],
  discipline: ['discipline'],
  wealth:     ['wealth', 'business'],
  charisma:   ['charisma'],
  business:   ['business', 'wealth'],
  task:       ['discipline'],
  note:       ['discipline'],
  habit:      ['discipline'],
  finance:    ['wealth'],
  goal:       ['discipline', 'business'],
  reflection: ['charisma'],
  general:    ['discipline'],
}

export const DIFFICULTY_XP: Record<string, number> = {
  easy:   20,
  normal: 40,
  hard:   75,
  epic:   150,
}

export function xpForLevel(level: number): number {
  return Math.floor(150 * Math.pow(1.15, level - 1))
}

export function calcLevel(totalXp: number): { level: number; xp: number; xpNextLevel: number } {
  let level = 1
  let remaining = totalXp
  while (true) {
    const needed = xpForLevel(level)
    if (remaining < needed) return { level, xp: remaining, xpNextLevel: needed }
    remaining -= needed
    level++
  }
}

// Returns stat deltas to apply
export function statsFromCategory(category: string, xpGained: number): Partial<Record<StatKey, number>> {
  const stats = CATEGORY_STATS[category] ?? ['discipline']
  const perStat = Math.floor(xpGained / stats.length / 10)
  return Object.fromEntries(stats.map((s) => [s, perStat]))
}

export function rankTitle(level: number): string {
  if (level >= 50) return 'S-Rank Operator'
  if (level >= 40) return 'A-Rank Elite'
  if (level >= 30) return 'B-Rank Hunter'
  if (level >= 20) return 'C-Rank Climber'
  if (level >= 10) return 'D-Rank Initiate'
  return 'E-Rank Awakened'
}
