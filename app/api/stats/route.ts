import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const db = createServiceClient()
  const { data } = await db.from('user_stats').select('*').eq('user_id', process.env.USER_ID ?? 'ernest').single()
  return Response.json(data ?? {})
}
