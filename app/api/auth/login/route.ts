import { NextRequest, NextResponse } from 'next/server'
import { makeAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.headers.set('Set-Cookie', makeAuthCookie())
  return response
}
