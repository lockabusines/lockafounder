import { NextRequest } from 'next/server'
import { sendMorningSummary } from '@/lib/telegram/morning-summary'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  const isVercelCron = req.headers.get('x-vercel-cron') === '1'
  if (!isVercelCron && secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  await sendMorningSummary()
  return Response.json({ ok: true })
}
