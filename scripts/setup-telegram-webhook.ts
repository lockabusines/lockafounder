import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.vercel.app'

  if (!token) { console.error('TELEGRAM_BOT_TOKEN not set'); process.exit(1) }

  const webhookUrl = `${siteUrl}/api/telegram/webhook`
  console.log('Registering webhook:', webhookUrl)

  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret ?? '',
      allowed_updates: ['message', 'callback_query'],
    }),
  })

  const data = await res.json()
  console.log('Result:', JSON.stringify(data, null, 2))
}

main().catch(console.error)
