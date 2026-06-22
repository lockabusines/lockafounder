import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  const checks: Record<string, string> = {
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'MISSING',
    service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'MISSING',
    anthropic: process.env.ANTHROPIC_API_KEY ? 'set' : 'MISSING',
    telegram: process.env.TELEGRAM_BOT_TOKEN ? 'set' : 'MISSING',
    user_id: process.env.USER_ID ?? 'MISSING',
  }

  try {
    const db = createServiceClient()
    const { data, error } = await db
      .from('habits')
      .select('id, name')
      .eq('user_id', process.env.USER_ID ?? 'ernest')
      .limit(20)

    checks.db = error ? `ERROR: ${error.message}` : `ok (${data?.length ?? 0} habit rows)`

    const seen = new Set<string>()
    for (const h of (data ?? [])) seen.add(h.name)
    checks.habits_unique = `${seen.size} unique`
  } catch (e) {
    checks.db = `EXCEPTION: ${e}`
  }

  return Response.json(checks)
}
