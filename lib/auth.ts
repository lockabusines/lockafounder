import { createHmac, timingSafeEqual } from 'crypto'

const SECRET = process.env.AUTH_SECRET ?? ''
const COOKIE_NAME = 'pos_auth'

export function signToken(payload: string): string {
  const hmac = createHmac('sha256', SECRET)
  hmac.update(payload)
  const sig = hmac.digest('hex')
  return `${payload}.${sig}`
}

export function verifyToken(token: string): boolean {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const payload = token.slice(0, dot)
  const expected = signToken(payload)
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

export function makeAuthCookie(maxAgeSec = 60 * 60 * 24 * 30): string {
  const token = signToken(`pos.${Date.now()}`)
  const opts = [
    `${COOKIE_NAME}=${token}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${maxAgeSec}`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ].filter(Boolean).join('; ')
  return opts
}

export { COOKIE_NAME }
