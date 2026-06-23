import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'
const UID = () => process.env.USER_ID ?? 'ernest'

export async function POST(req: NextRequest) {
  const db = createServiceClient()
  const body = await req.json()
  const { data, error } = await db.from('key_results').insert({
    user_id: UID(), goal_id: body.goal_id, title: body.title,
    target: body.target ?? 100, current: body.current ?? 0, unit: body.unit ?? '%',
  }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const db = createServiceClient()
  const { id, ...updates } = await req.json()
  const { data, error } = await db.from('key_results').update(updates)
    .eq('id', id).eq('user_id', UID()).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function DELETE(req: NextRequest) {
  const db = createServiceClient()
  const { id } = await req.json()
  await db.from('key_results').delete().eq('id', id).eq('user_id', UID())
  return Response.json({ ok: true })
}
