import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const db = createServiceClient()
  const { data } = await db
    .from('habits')
    .select('*')
    .eq('user_id', process.env.USER_ID ?? 'ernest')
    .eq('active', true)
    .order('name')
  return Response.json(data ?? [])
}
