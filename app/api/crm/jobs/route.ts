import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

const UID = () => process.env.USER_ID ?? 'ernest'

export async function GET() {
  const db = createServiceClient()
  const { data } = await db
    .from('opportunities')
    .select('*, crm_contacts(name, phone, company)')
    .eq('user_id', UID())
    .order('created_at', { ascending: false })
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
    description: body.description ?? null,
    contact_id: body.contact_id ?? null,
  }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const db = createServiceClient()
  const { id, ...updates } = await req.json()
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })

  // set timestamps based on status change
  if (updates.status === 'won') updates.completed_at = new Date().toISOString()
  if (updates.status === 'invoiced') updates.invoiced_at = new Date().toISOString()
  if (updates.status === 'paid') updates.paid_at = new Date().toISOString()

  const { data, error } = await db
    .from('opportunities')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', UID())
    .select('*, crm_contacts(name, phone, company)').single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}
