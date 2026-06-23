'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopRail } from '@/components/dashboard/TopRail'

const G = { green:'#1aff8c', red:'#ff4455', gold:'#f5c842', blue:'#4db8ff', purple:'#a78bfa', muted:'rgba(255,255,255,0.35)', faint:'rgba(255,255,255,0.15)', border:'rgba(255,255,255,0.08)', card:'#161618', card2:'#1c1c1f' }
const STATUSES = [
  {key:'active',    label:'Active',    color:G.blue },
  {key:'paused',    label:'Paused',    color:G.gold },
  {key:'completed', label:'Done',      color:G.green},
]
const SKILLS = ['solar','electrical','renovations','training','ai','other']
function roiColor(r:number){ return r>=5?G.gold:r>=4?G.green:r>=3?G.blue:G.muted }

interface Task { id:string; title:string; status:string; due_date?:string; mission_roi:number }
interface Project { id:string; title:string; description?:string; status:string; skill:string; mission_roi:number; due_date?:string; crm_contacts?:{name:string;company?:string}|null; tasks:Task[] }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Project | null>(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [form, setForm] = useState({ title:'', description:'', skill:'other', mission_roi:3, due_date:'' })

  const load = useCallback(async () => {
    const data = await fetch('/api/projects').then(r=>r.ok?r.json():[])
    setProjects(data); setLoading(false)
  }, [])

  useEffect(()=>{ load() },[load])

  async function addProject() {
    if (!form.title.trim()) return
    const res = await fetch('/api/projects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    if (res.ok){ await load(); setShowAdd(false); setForm({title:'',description:'',skill:'other',mission_roi:3,due_date:''}) }
  }

  async function updateStatus(id:string, status:string) {
    const res = await fetch('/api/projects',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})})
    if (res.ok){ const p=await res.json(); setProjects(prev=>prev.map(x=>x.id===id?p:x)); if(selected?.id===id) setSelected(p) }
  }

  // Group by status for kanban
  const columns = STATUSES.map(s=>({ ...s, items: projects.filter(p=>p.status===s.key) }))

  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />
      <main className="flex-1 p-4 md:p-5">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs" style={{color:G.muted}}>
              <Link href="/" className="hover:opacity-70">Dashboard</Link>
              <span style={{color:G.faint}}>/</span>
              <span style={{color:'#f0f0f0'}}>Projects</span>
            </div>
            <button onClick={()=>setShowAdd(!showAdd)} className="px-3 py-2 rounded text-xs font-semibold"
              style={{background:`${G.purple}18`,color:G.purple,border:`1px solid ${G.purple}33`}}>+ New Project</button>
          </div>

          {/* Add form */}
          {showAdd&&(
            <div className="rounded p-5 flex flex-col gap-3" style={{background:G.card2,border:`1px solid ${G.purple}33`}}>
              <p style={{color:G.purple,fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em'}}>New Project</p>
              <input placeholder="Project name *" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className="w-full px-3 py-2 rounded text-sm" />
              <input placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="w-full px-3 py-2 rounded text-sm" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <select value={form.skill} onChange={e=>setForm(f=>({...f,skill:e.target.value}))} className="px-2 py-2 rounded text-xs capitalize">
                  {SKILLS.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} className="px-2 py-2 rounded text-xs" />
              </div>
              <div className="flex flex-col gap-1">
                <p style={{color:G.faint,fontSize:'0.58rem',textTransform:'uppercase',letterSpacing:'0.08em'}}>Mission ROI</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setForm(f=>({...f,mission_roi:n}))}
                      className="flex-1 py-1.5 rounded text-xs font-bold"
                      style={{background:form.mission_roi===n?`${roiColor(n)}25`:'rgba(255,255,255,0.04)',color:form.mission_roi===n?roiColor(n):G.muted,border:`1px solid ${form.mission_roi===n?roiColor(n)+'44':'transparent'}`}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addProject} className="flex-1 py-2 rounded text-sm font-bold" style={{background:G.purple,color:'#fff'}}>Create Project</button>
                <button onClick={()=>setShowAdd(false)} className="px-4 py-2 rounded text-xs" style={{color:G.muted}}>Cancel</button>
              </div>
            </div>
          )}

          {/* Kanban */}
          {loading ? (
            <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i=><div key={i} className="h-48 rounded animate-pulse" style={{background:G.card}} />)}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {columns.map(col=>(
                <div key={col.key} className="flex flex-col rounded overflow-hidden" style={{background:G.card,border:`1px solid ${G.border}`}}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{borderBottom:`1px solid ${G.border}`,borderLeft:`2px solid ${col.color}`}}>
                    <span style={{color:col.color,fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600}}>{col.label}</span>
                    <span className="font-mono text-xs font-bold" style={{color:col.color}}>{col.items.length}</span>
                  </div>
                  <div className="flex flex-col divide-y" style={{borderColor:G.border}}>
                    {col.items.length===0?(
                      <p className="p-4 text-xs text-center" style={{color:'rgba(255,255,255,0.1)'}}>—</p>
                    ):col.items.map(p=>(
                      <button key={p.id} onClick={()=>setSelected(selected?.id===p.id?null:p)}
                        className="flex flex-col gap-2 p-4 text-left w-full transition-colors"
                        style={{background:selected?.id===p.id?'rgba(255,255,255,0.04)':'transparent'}}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-snug" style={{color:'#e8e8e8'}}>{p.title}</p>
                          <span className="text-xs font-bold shrink-0" style={{color:roiColor(p.mission_roi)}}>R{p.mission_roi}</span>
                        </div>
                        {p.description&&<p className="text-xs" style={{color:G.muted}}>{p.description}</p>}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{background:'rgba(255,255,255,0.06)',color:G.muted}}>{p.skill}</span>
                          {p.crm_contacts?.name&&<span className="text-[10px]" style={{color:G.blue}}>· {p.crm_contacts.name}</span>}
                          {p.due_date&&<span className="text-[10px]" style={{color:new Date(p.due_date)<new Date()?G.red:G.muted}}>Due {p.due_date}</span>}
                        </div>
                        {/* Task progress bar */}
                        {p.tasks.length>0&&(
                          <div className="w-full flex flex-col gap-1">
                            <div className="h-1 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
                              <div className="h-full rounded-full" style={{width:`${Math.round((p.tasks.filter(t=>t.status==='done').length/p.tasks.length)*100)}%`,background:G.green}} />
                            </div>
                            <p style={{color:G.faint,fontSize:'0.58rem'}}>{p.tasks.filter(t=>t.status==='done').length}/{p.tasks.length} tasks</p>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Project detail */}
          {selected&&(
            <div className="rounded p-5 flex flex-col gap-4" style={{background:G.card2,border:`1px solid ${roiColor(selected.mission_roi)}33`}}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold" style={{color:'#f0f0f0'}}>{selected.title}</p>
                  {selected.description&&<p className="text-xs mt-0.5" style={{color:G.muted}}>{selected.description}</p>}
                  {selected.crm_contacts&&<p className="text-xs mt-0.5" style={{color:G.blue}}>Client: {selected.crm_contacts.name}{selected.crm_contacts.company?` · ${selected.crm_contacts.company}`:''}</p>}
                </div>
                <button onClick={()=>setSelected(null)} style={{color:G.muted,fontSize:'1.2rem',lineHeight:1}}>×</button>
              </div>

              {/* Tasks */}
              {selected.tasks.length>0&&(
                <div>
                  <p style={{color:G.faint,fontSize:'0.58rem',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>Tasks</p>
                  <div className="flex flex-col gap-1">
                    {selected.tasks.map(t=>(
                      <div key={t.id} className="flex items-center gap-3 py-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{background:roiColor(t.mission_roi)}} />
                        <span className="flex-1 text-xs" style={{color:t.status==='done'?G.muted:'#e0e0e0',textDecoration:t.status==='done'?'line-through':'none'}}>{t.title}</span>
                        {t.due_date&&<span className="text-[10px]" style={{color:G.faint}}>{t.due_date}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Move actions */}
              <div className="flex gap-2 pt-2" style={{borderTop:`1px solid ${G.border}`}}>
                <p style={{color:G.faint,fontSize:'0.58rem',textTransform:'uppercase',letterSpacing:'0.08em',width:'100%'}}>Move to</p>
                {STATUSES.filter(s=>s.key!==selected.status).map(s=>(
                  <button key={s.key} onClick={()=>updateStatus(selected.id,s.key)}
                    className="px-3 py-1.5 rounded text-xs font-semibold"
                    style={{background:`${s.color}14`,color:s.color,border:`1px solid ${s.color}30`}}>
                    → {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
