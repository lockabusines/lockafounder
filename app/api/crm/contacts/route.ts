import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

const UID = () => process.env.USER_ID ?? 'ernest'

export async function GET() {
  const db = createServiceClient()
  const { data } = await db
    .from('crm_contacts')
    .select('*')
    .eq('user_id', UID())
    .order('created_at', { ascending: false })
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const db = createServiceClient()
  const body = await req.json()
  const { data, error } = await db.from('crm_contacts').insert({
    user_id: UID(),
    name: body.name,
    phone: body.phone ?? null,
    email: body.email ?? null,
    company: body.company ?? null,
    source: body.source ?? 'manual',
    skill: body.skill ?? 'other',
    notes: body.notes ?? null,
  }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const db = createServiceClient()
  const { id, ...updates } = await req.json()
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  const { data, error } = await db
    .from('crm_contacts')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', UID())
    .select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function DELETE(req: NextRequest) {
  const db = createServiceClient()
  const { id } = await req.json()
  await db.from('crm_contacts').delete().eq('id', id).eq('user_id', UID())
  return Response.json({ ok: true })
}
