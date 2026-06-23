import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

const UID = () => process.env.USER_ID ?? 'ernest'

export async function GET() {
  const db = createServiceClient()
  const { data } = await db
    .from('tasks')
    .select('id, title, urgency, xp_value, category, status, mission_roi, due_date')
    .eq('user_id', UID())
    .eq('status', 'open')
    .order('mission_roi', { ascending: false })
    .order('urgency')
    .limit(50)
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const db = createServiceClient()
  const body = await req.json()
  if (!body.title?.trim()) return Response.json({ error: 'title required' }, { status: 400 })
  const { data, error } = await db.from('tasks').insert({
    user_id:    UID(),
    title:      body.title.trim(),
    urgency:    body.urgency    ?? 'medium',
    category:   body.category   ?? 'general',
    mission_roi: body.mission_roi ?? 3,
    xp_value:   body.xp_value   ?? 30,
    status:     'open',
    due_date:   body.due_date   ?? null,
  }).select('id, title, urgency, xp_value, category, status, mission_roi, due_date').single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function PATCH(req: NextRequest) {
  const db = createServiceClient()
  const { id, ...updates } = await req.json()
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  const { data, error } = await db
    .from('tasks')
    .update(updates)
    .eq('id', id).eq('user_id', UID())
    .select('id, title, urgency, xp_value, category, status, mission_roi, due_date')
    .single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}
