import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const db = createServiceClient()
    const { data, error } = await db.from('user_stats').select('*').eq('user_id', process.env.USER_ID ?? 'ernest').single()
    if (error) console.error('[stats]', error)
    return Response.json(data ?? {})
  } catch (e) {
    console.error('[stats] unexpected:', e)
    return Response.json({})
  }
}
