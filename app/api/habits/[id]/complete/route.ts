import { NextRequest } from 'next/server'
import { completeHabit } from '@/lib/game/engine'
import { createServiceClient } from '@/lib/supabase'

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  await completeHabit(id)
  const db = createServiceClient()
  const { data } = await db.from('habits').select('*').eq('id', id).single()
  return Response.json(data)
}
