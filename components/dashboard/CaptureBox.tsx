'use client'

import { useState, useRef, KeyboardEvent } from 'react'

interface ClassifyResult {
  kind: string
  urgency: number
  summary: string
  tags: string[]
}

const KIND_EMOJI: Record<string, string> = {
  task: '✅', note: '📝', habit: '🔄', finance: '💰', health: '💪', goal: '🎯', reflection: '💭',
}

export function CaptureBox() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ClassifyResult | null>(null)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function submit() {
    if (!text.trim() || loading) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Unknown error')
      setResult(data.classification)
      setText('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
  }

  function openBox() {
    setOpen(true)
    setResult(null)
    setError('')
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={openBox}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-2xl shadow-lg hover:bg-white/20 transition-all"
        aria-label="Quick capture"
        title="Quick capture (or send via Telegram)"
      >
        ⚡
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="glass w-full max-w-lg rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white/70">Quick Capture</span>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white text-lg leading-none">✕</button>
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              rows={3}
              placeholder="What's on your mind? (⌘↵ to save)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/30"
            />

            {error && <p className="text-red-400 text-xs">{error}</p>}

            {result && (
              <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 rounded-lg px-3 py-2">
                <span>{KIND_EMOJI[result.kind] ?? '📝'}</span>
                <span className="capitalize font-medium text-white/80">{result.kind}</span>
                <span>·</span>
                <span>urgency {result.urgency}</span>
                <span>·</span>
                <span>{result.summary}</span>
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading || !text.trim()}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Save capture'}
            </button>

            <p className="text-center text-xs text-white/30">Or send a voice/text message to your Telegram bot</p>
          </div>
        </div>
      )}
    </>
  )
}
