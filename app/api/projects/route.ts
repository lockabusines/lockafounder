import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'
const UID = () => process.env.USER_ID ?? 'ernest'

export async function GET() {
  const db = createServiceClient()
  const { data } = await db.from('projects')
    .select('*, crm_contacts(name, company), tasks(id, title, status, due_date, mission_roi)')
    .eq('user_id', UID()).neq('status', 'archived').order('created_at', { ascending: false })
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const db = createServiceClient()
  const body = await req.json()
  const { data, error } = await db.from('projects').insert({
    user_id: UID(), title: body.title, description: body.description ?? null,
    skill: body.skill ?? 'other', mission_roi: body.mission_roi ?? 3,
    contact_id: body.contact_id ?? null, due_date: body.due_date ?? null,
    status: 'active',
  }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const db = createServiceClient()
  const { id, ...updates } = await req.json()
  const { data, error } = await db.from('projects').update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id).eq('user_id', UID())
    .select('*, crm_contacts(name, company), tasks(id, title, status, due_date, mission_roi)').single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}
