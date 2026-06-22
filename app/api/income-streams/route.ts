import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

const UID = () => process.env.USER_ID ?? 'ernest'

export async function GET() {
  const db = createServiceClient()
  const { data, error } = await db
    .from('income_streams')
    .select('*')
    .eq('user_id', UID())
    .eq('is_active', true)
    .order('type')
    .order('monthly_amount', { ascending: false })
  if (error) console.error('[income-streams]', error)
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const db = createServiceClient()
  const body = await req.json()
  const { data, error } = await db.from('income_streams').insert({
    user_id: UID(),
    name: body.name,
    type: body.type ?? 'active',
    skill: body.skill ?? 'other',
    monthly_amount: Number(body.monthly_amount) || 0,
    notes: body.notes ?? null,
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
    .from('income_streams')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', UID())
    .select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}
