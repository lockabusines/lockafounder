import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'
const UID = () => process.env.USER_ID ?? 'ernest'

export async function GET() {
  const db = createServiceClient()
  const { data } = await db.from('goals').select('*, key_results(*)').eq('user_id', UID()).order('created_at', { ascending: false })
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const db = createServiceClient()
  const body = await req.json()
  const { data, error } = await db.from('goals').insert({
    user_id: UID(), title: body.title, description: body.description ?? null,
    type: body.type ?? 'quarterly', quarter: body.quarter ?? null,
    target: body.target ?? null, current: body.current ?? 0,
    unit: body.unit ?? '%', mission_roi: body.mission_roi ?? 3,
    due_date: body.due_date ?? null,
  }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const db = createServiceClient()
  const { id, ...updates } = await req.json()
  const { data, error } = await db.from('goals').update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', UID()).select('*, key_results(*)').single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function DELETE(req: NextRequest) {
  const db = createServiceClient()
  const { id } = await req.json()
  await db.from('goals').delete().eq('id', id).eq('user_id', UID())
  return Response.json({ ok: true })
}
