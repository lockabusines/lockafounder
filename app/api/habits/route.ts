import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const db = createServiceClient()
    const { data, error } = await db
      .from('habits')
      .select('*')
      .eq('user_id', process.env.USER_ID ?? 'ernest')
      .eq('active', true)
      .order('name')

    if (error) {
      console.error('[habits] Supabase error:', error)
      return Response.json([], { status: 200 })
    }

    // Deduplicate by name — migration may have run twice creating duplicate rows
    const seen = new Map<string, Record<string, unknown>>()
    for (const h of (data ?? [])) {
      const existing = seen.get(h.name as string)
      if (!existing || (h.current_streak as number) > (existing.current_streak as number)) {
        seen.set(h.name as string, h)
      }
    }

    return Response.json(Array.from(seen.values()))
  } catch (err) {
    console.error('[habits] Unexpected error:', err)
    return Response.json([], { status: 200 })
  }
}
