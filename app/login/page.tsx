'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    })
    setLoading(false)
    if (res.ok) {
      router.push(params.get('from') ?? '/')
    } else {
      setError('Wrong password.')
      setPw('')
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="glass w-full max-w-sm p-8 flex flex-col gap-4"
      >
        <h1 className="text-xl font-semibold tracking-tight text-[var(--color-ink-5)]">
          Personal OS
        </h1>
        <p className="text-sm text-[var(--color-ink-4)]">Enter your password to continue.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
          required
          placeholder="Password"
          className="bg-[var(--color-ink-1)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--color-ink-5)] outline-none focus:border-[var(--color-accent)] transition-colors"
        />
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--color-accent)] text-white rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
