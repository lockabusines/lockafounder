import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

const UID = () => process.env.USER_ID ?? 'ernest'

export async function GET() {
  const db = createServiceClient()
  const { data, error } = await db
    .from('opportunities')
    .select('*')
    .eq('user_id', UID())
    .neq('status', 'lost')
    .order('created_at', { ascending: false })
  if (error) console.error('[opportunities]', error)
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const db = createServiceClient()
  const body = await req.json()
  const { data, error } = await db.from('opportunities').insert({
    user_id: UID(),
    name: body.name,
    skill: body.skill ?? 'other',
    status: body.status ?? 'lead',
    value: body.value ? Number(body.value) : null,
    notes: body.notes ?? null,
    due_date: body.due_date ?? null,
  }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const db = createServiceClient()
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  const { data, error } = await db
    .from('opportunities')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', UID())
    .select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}
