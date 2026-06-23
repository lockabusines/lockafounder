import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

export async function GET() {
  const db = createServiceClient()
  const { data } = await db
    .from('tasks')
    .select('id, title, urgency, xp_value, category, status, mission_roi, due_date')
    .eq('user_id', process.env.USER_ID ?? 'ernest')
    .eq('status', 'open')
    .order('mission_roi', { ascending: false })
    .order('urgency')
    .limit(50)
  return Response.json(data ?? [])
}

export async function PATCH(req: NextRequest) {
  const db = createServiceClient()
  const { id, ...updates } = await req.json()
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  const { data, error } = await db
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', process.env.USER_ID ?? 'ernest')
    .select('id, title, urgency, xp_value, category, status, mission_roi, due_date')
    .single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}
