import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { awardXP } from '@/lib/game/engine'

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const db = createServiceClient()
  const { data: task } = await db.from('tasks').select('xp_value, category').eq('id', id).single()
  await db.from('tasks').update({ status: 'complete', completed_at: new Date().toISOString() }).eq('id', id)
  if (task) await awardXP(task.xp_value ?? 40, task.category ?? 'general')
  return Response.json({ ok: true })
}
