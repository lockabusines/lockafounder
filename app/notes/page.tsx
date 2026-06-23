'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { TopRail } from '@/components/dashboard/TopRail'

const G = { green:'#1aff8c', red:'#ff4455', gold:'#f5c842', blue:'#4db8ff', purple:'#a78bfa', muted:'rgba(255,255,255,0.35)', faint:'rgba(255,255,255,0.15)', border:'rgba(255,255,255,0.08)', card:'#161618', card2:'#1c1c1f' }

interface Note { id:string; title:string; body:string; tags:string[]; pinned:boolean; updated_at:string }

export default function NotesPage() {
  const [notes, setNotes]       = useState<Note[]>([])
  const [selected, setSelected] = useState<Note | null>(null)
  const [search, setSearch]     = useState('')
  const [saving, setSaving]     = useState(false)
  const [dirty, setDirty]       = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async (q='') => {
    const data = await fetch(`/api/notes${q?`?q=${encodeURIComponent(q)}`:''}` ).then(r=>r.ok?r.json():[])
    setNotes(data)
  }, [])

  useEffect(() => { load() }, [load])

  async function createNote() {
    const res = await fetch('/api/notes', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({title:'Untitled', body:''}) })
    if (res.ok) { const n = await res.json(); setNotes(prev=>[n,...prev]); setSelected(n); setDirty(false) }
  }

  async function saveNote(n: Note) {
    setSaving(true)
    const res = await fetch('/api/notes', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify(n) })
    if (res.ok) { const updated = await res.json(); setNotes(prev=>prev.map(x=>x.id===n.id?updated:x)); setSelected(updated) }
    setSaving(false); setDirty(false)
  }

  function handleChange(field: 'title'|'body', value: string) {
    if (!selected) return
    const updated = { ...selected, [field]: value }
    setSelected(updated); setDirty(true)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveNote(updated), 1200)
  }

  async function togglePin(n: Note) {
    const res = await fetch('/api/notes', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:n.id, pinned:!n.pinned}) })
    if (res.ok) { const updated = await res.json(); setNotes(prev=>prev.map(x=>x.id===n.id?updated:x)); if (selected?.id===n.id) setSelected(updated) }
  }

  async function deleteNote(id: string) {
    await fetch('/api/notes', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
    setNotes(prev=>prev.filter(n=>n.id!==id))
    if (selected?.id===id) setSelected(null)
  }

  async function addTag(tag: string) {
    if (!selected || !tag.trim()) return
    const tags = [...new Set([...selected.tags, tag.trim().toLowerCase()])]
    const updated = { ...selected, tags }
    setSelected(updated)
    await fetch('/api/notes', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:selected.id, tags}) })
    setNotes(prev=>prev.map(x=>x.id===selected.id?updated:x))
  }

  async function removeTag(tag: string) {
    if (!selected) return
    const tags = selected.tags.filter(t=>t!==tag)
    const updated = { ...selected, tags }
    setSelected(updated)
    await fetch('/api/notes', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id:selected.id, tags}) })
    setNotes(prev=>prev.map(x=>x.id===selected.id?updated:x))
  }

  const allTags = [...new Set(notes.flatMap(n=>n.tags))]
  const [filterTag, setFilterTag] = useState<string|null>(null)
  const displayed = notes.filter(n => (!filterTag || n.tags.includes(filterTag)) && (!search || n.title.toLowerCase().includes(search.toLowerCase()) || n.body.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />
      <main className="flex-1 p-4 md:p-5 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col gap-3 h-full">
          <div className="flex items-center gap-2 text-xs" style={{color:G.muted}}>
            <Link href="/" className="hover:opacity-70">Dashboard</Link>
            <span style={{color:G.faint}}>/</span>
            <span style={{color:'#f0f0f0'}}>Notes</span>
            {saving && <span style={{color:G.faint,marginLeft:'auto'}}>Saving…</span>}
            {dirty && !saving && <span style={{color:G.gold,marginLeft:'auto'}}>Unsaved</span>}
          </div>

          <div className="flex gap-3 flex-1 min-h-0" style={{height:'calc(100vh - 140px)'}}>
            {/* Sidebar */}
            <div className="w-64 shrink-0 flex flex-col gap-2 overflow-y-auto">
              <div className="flex gap-2">
                <input placeholder="Search…" value={search} onChange={e=>{setSearch(e.target.value);load(e.target.value)}}
                  className="flex-1 px-3 py-2 rounded text-xs" />
                <button onClick={createNote} className="px-3 py-2 rounded text-xs font-bold"
                  style={{background:`${G.green}18`,color:G.green,border:`1px solid ${G.green}33`}}>+</button>
              </div>

              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {allTags.map(t=>(
                    <button key={t} onClick={()=>setFilterTag(filterTag===t?null:t)}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{background:filterTag===t?`${G.blue}25`:'rgba(255,255,255,0.05)',color:filterTag===t?G.blue:G.muted,border:`1px solid ${filterTag===t?G.blue+'44':'transparent'}`}}>
                      #{t}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-1">
                {displayed.length === 0 && <p className="text-xs px-2 py-4 text-center" style={{color:G.faint}}>No notes. Click + to create.</p>}
                {displayed.map(n=>(
                  <button key={n.id} onClick={()=>{setSelected(n);setDirty(false)}}
                    className="flex flex-col gap-0.5 px-3 py-2.5 rounded text-left transition-colors w-full"
                    style={{background:selected?.id===n.id?'rgba(255,255,255,0.07)':'rgba(255,255,255,0.02)',border:`1px solid ${selected?.id===n.id?G.border:'transparent'}`}}>
                    <div className="flex items-center gap-1.5">
                      {n.pinned && <span style={{color:G.gold,fontSize:'0.6rem'}}>📌</span>}
                      <span className="text-xs font-semibold truncate" style={{color:'#e8e8e8'}}>{n.title||'Untitled'}</span>
                    </div>
                    <span className="text-[10px] truncate" style={{color:G.muted}}>{n.body?.slice(0,60)||'Empty'}</span>
                    <span className="text-[10px]" style={{color:G.faint}}>{new Date(n.updated_at).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            {selected ? (
              <div className="flex-1 flex flex-col rounded overflow-hidden" style={{background:G.card,border:`1px solid ${G.border}`}}>
                {/* Toolbar */}
                <div className="flex items-center gap-3 px-4 py-2.5" style={{borderBottom:`1px solid ${G.border}`}}>
                  <button onClick={()=>togglePin(selected)} title={selected.pinned?'Unpin':'Pin'}
                    className="text-sm" style={{color:selected.pinned?G.gold:G.faint}}>📌</button>
                  <TagInput onAdd={addTag} />
                  <div className="flex flex-wrap gap-1 flex-1">
                    {selected.tags.map(t=>(
                      <span key={t} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                        style={{background:`${G.blue}18`,color:G.blue}}>
                        #{t}
                        <button onClick={()=>removeTag(t)} style={{color:G.muted,lineHeight:1}}>×</button>
                      </span>
                    ))}
                  </div>
                  <button onClick={()=>deleteNote(selected.id)} className="text-xs px-2 py-1 rounded"
                    style={{color:G.red,background:`${G.red}10`}}>Delete</button>
                </div>

                {/* Title */}
                <input
                  value={selected.title}
                  onChange={e=>handleChange('title',e.target.value)}
                  placeholder="Title…"
                  className="px-5 pt-5 pb-2 text-2xl font-bold w-full"
                  style={{background:'transparent',border:'none',outline:'none',color:'#f0f0f0'}}
                />

                {/* Body */}
                <textarea
                  value={selected.body}
                  onChange={e=>handleChange('body',e.target.value)}
                  placeholder="Start writing…  (autosaves)"
                  className="flex-1 px-5 py-2 text-sm w-full resize-none"
                  style={{background:'transparent',border:'none',outline:'none',color:'rgba(220,220,220,0.9)',lineHeight:1.8,fontFamily:'var(--font-geist-mono)'}}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center rounded" style={{background:G.card,border:`1px solid ${G.border}`}}>
                <div className="text-center">
                  <p style={{color:G.muted}}>Select a note or create one</p>
                  <button onClick={createNote} className="mt-3 px-4 py-2 rounded text-sm font-semibold"
                    style={{background:`${G.green}18`,color:G.green,border:`1px solid ${G.green}33`}}>
                    + New Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function TagInput({ onAdd }: { onAdd: (t: string) => void }) {
  const [val, setVal] = useState('')
  return (
    <input value={val} onChange={e=>setVal(e.target.value)}
      onKeyDown={e=>{ if (e.key==='Enter'&&val.trim()){onAdd(val.trim());setVal('')} }}
      placeholder="+ tag" className="w-20 px-2 py-0.5 rounded text-[10px]"
      style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#e0e0e0'}} />
  )
}
