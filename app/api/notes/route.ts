import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'
const UID = () => process.env.USER_ID ?? 'ernest'

export async function GET(req: NextRequest) {
  const db = createServiceClient()
  const q = new URL(req.url).searchParams.get('q')
  let query = db.from('notes').select('*').eq('user_id', UID()).order('pinned', { ascending: false }).order('updated_at', { ascending: false })
  if (q) query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`)
  const { data } = await query
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const db = createServiceClient()
  const body = await req.json()
  const { data, error } = await db.from('notes').insert({
    user_id: UID(), title: body.title ?? 'Untitled', body: body.body ?? '',
    tags: body.tags ?? [], pinned: body.pinned ?? false, contact_id: body.contact_id ?? null,
  }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const db = createServiceClient()
  const { id, ...updates } = await req.json()
  const { data, error } = await db.from('notes').update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', UID()).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function DELETE(req: NextRequest) {
  const db = createServiceClient()
  const { id } = await req.json()
  await db.from('notes').delete().eq('id', id).eq('user_id', UID())
  return Response.json({ ok: true })
}
