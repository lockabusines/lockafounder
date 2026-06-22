import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const db = createServiceClient()
  const { data } = await db
    .from('tasks')
    .select('id, title, urgency, xp_value, category, status, mission_roi')
    .eq('user_id', process.env.USER_ID ?? 'ernest')
    .eq('status', 'open')
    .order('mission_roi', { ascending: false })
    .order('urgency')
    .limit(20)
  return Response.json(data ?? [])
}
