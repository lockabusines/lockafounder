import { createServiceClient } from '@/lib/supabase'
import { NextRequest } from 'next/server'

const UID = () => process.env.USER_ID ?? 'ernest'

export async function GET(req: NextRequest) {
  const db = createServiceClient()
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month') // YYYY-MM

  let query = db
    .from('expenses')
    .select('*')
    .eq('user_id', UID())
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (month) {
    query = query
      .gte('date', `${month}-01`)
      .lte('date', `${month}-31`)
  } else {
    query = query.limit(90)
  }

  const { data } = await query
  return Response.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const db = createServiceClient()
  const body = await req.json()
  if (!body.amount || isNaN(Number(body.amount))) {
    return Response.json({ error: 'amount required' }, { status: 400 })
  }
  const { data, error } = await db.from('expenses').insert({
    user_id:     UID(),
    amount:      Number(body.amount),
    category:    body.category    ?? 'general',
    description: body.description ?? null,
    date:        body.date        ?? new Date().toISOString().split('T')[0],
  }).select().single()
  if (error) return Response.json({ error: error.message }, { status: 400 })
  return Response.json(data)
}

export async function DELETE(req: NextRequest) {
  const db = createServiceClient()
  const { id } = await req.json()
  await db.from('expenses').delete().eq('id', id).eq('user_id', UID())
  return Response.json({ ok: true })
}
