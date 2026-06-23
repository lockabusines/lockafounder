'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { TopRail } from '@/components/dashboard/TopRail'

const G = { green:'#1aff8c', red:'#ff4455', gold:'#f5c842', blue:'#4db8ff', purple:'#a78bfa', muted:'rgba(255,255,255,0.35)', faint:'rgba(255,255,255,0.15)', border:'rgba(255,255,255,0.08)', card:'#161618', card2:'#1c1c1f' }
const TYPES = ['quarterly','annual','lifetime']
const UNITS = ['%','£','tasks','hours','clients','kg','km','other']

function roiColor(r:number){ return r>=5?G.gold:r>=4?G.green:r>=3?G.blue:G.muted }
function currentQuarter(){ const d=new Date(); return `${d.getFullYear()}-Q${Math.ceil((d.getMonth()+1)/3)}` }

interface KR { id:string; title:string; target:number; current:number; unit:string; done:boolean }
interface Goal { id:string; title:string; description?:string; type:string; quarter?:string; status:string; target?:number; current:number; unit:string; mission_roi:number; due_date?:string; key_results:KR[] }

export default function GoalsPage() {
  const [goals, setGoals]       = useState<Goal[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)
  const [selected, setSelected] = useState<Goal | null>(null)
  const [form, setForm] = useState({ title:'', description:'', type:'quarterly', quarter:currentQuarter(), target:'', unit:'%', mission_roi:4, due_date:'' })
  const [krForm, setKrForm] = useState({ title:'', target:'100', unit:'%' })

  const load = useCallback(async () => {
    const data = await fetch('/api/goals').then(r=>r.ok?r.json():[])
    setGoals(data); setLoading(false)
  }, [])

  useEffect(()=>{ load() },[load])

  async function addGoal() {
    if (!form.title.trim()) return
    const res = await fetch('/api/goals',{ method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({...form,target:form.target?Number(form.target):null}) })
    if (res.ok){ await load(); setShowAdd(false); setForm({title:'',description:'',type:'quarterly',quarter:currentQuarter(),target:'',unit:'%',mission_roi:4,due_date:''}) }
  }

  async function updateProgress(id:string, current:number) {
    const res = await fetch('/api/goals',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,current})})
    if (res.ok){ const g=await res.json(); setGoals(prev=>prev.map(x=>x.id===id?g:x)); setSelected(g) }
  }

  async function setStatus(id:string, status:string) {
    const res = await fetch('/api/goals',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})})
    if (res.ok){ const g=await res.json(); setGoals(prev=>prev.map(x=>x.id===id?g:x)); setSelected(null) }
  }

  async function addKR(goal_id:string) {
    if (!krForm.title.trim()) return
    const res = await fetch('/api/goals/kr',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({goal_id,...krForm,target:Number(krForm.target)})})
    if (res.ok){ await load(); setKrForm({title:'',target:'100',unit:'%'}) }
  }

  async function updateKR(id:string, updates: Partial<KR>) {
    await fetch('/api/goals/kr',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...updates})})
    await load()
  }

  const active   = goals.filter(g=>g.status==='active')
  const achieved = goals.filter(g=>g.status==='achieved')
  const byType   = TYPES.map(t=>({ type:t, goals:active.filter(g=>g.type===t) })).filter(x=>x.goals.length>0)

  function pct(g:Goal){ return g.target?Math.min(100,Math.round((g.current/g.target)*100)):0 }

  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />
      <main className="flex-1 p-4 md:p-5">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs" style={{color:G.muted}}>
              <Link href="/" className="hover:opacity-70">Dashboard</Link>
              <span style={{color:G.faint}}>/</span>
              <span style={{color:'#f0f0f0'}}>Goals & OKRs</span>
            </div>
            <button onClick={()=>setShowAdd(!showAdd)} className="px-3 py-2 rounded text-xs font-semibold"
              style={{background:`${G.gold}18`,color:G.gold,border:`1px solid ${G.gold}33`}}>+ New Goal</button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {label:'Active goals', value:active.length, color:G.blue},
              {label:'Achieved',     value:achieved.length, color:G.green},
              {label:'Avg progress', value:`${active.length?Math.round(active.reduce((s,g)=>s+pct(g),0)/active.length):0}%`, color:G.gold},
            ].map(({label,value,color})=>(
              <div key={label} className="p-4 rounded flex flex-col gap-1" style={{background:G.card,border:`1px solid ${G.border}`,borderLeft:`2px solid ${color}`}}>
                <p style={{color:G.muted,fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em'}}>{label}</p>
                <p className="text-2xl font-black font-mono" style={{color}}>{value}</p>
              </div>
            ))}
          </div>

          {/* Add goal form */}
          {showAdd && (
            <div className="rounded p-5 flex flex-col gap-3" style={{background:G.card2,border:`1px solid ${G.gold}33`}}>
              <p style={{color:G.gold,fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em'}}>New Goal</p>
              <input placeholder="Goal title *" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} className="w-full px-3 py-2 rounded text-sm" />
              <input placeholder="Why? (description)" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="w-full px-3 py-2 rounded text-sm" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="px-2 py-2 rounded text-xs capitalize">
                  {TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                {form.type==='quarterly'&&<input placeholder="Quarter e.g. 2026-Q3" value={form.quarter} onChange={e=>setForm(f=>({...f,quarter:e.target.value}))} className="px-2 py-2 rounded text-xs" />}
                <input placeholder="Target number" type="number" value={form.target} onChange={e=>setForm(f=>({...f,target:e.target.value}))} className="px-2 py-2 rounded text-xs" />
                <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} className="px-2 py-2 rounded text-xs">
                  {UNITS.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
                <input type="date" value={form.due_date} onChange={e=>setForm(f=>({...f,due_date:e.target.value}))} className="px-2 py-2 rounded text-xs" />
              </div>
              <div className="flex flex-col gap-1">
                <p style={{color:G.faint,fontSize:'0.58rem',textTransform:'uppercase',letterSpacing:'0.08em'}}>Mission ROI (1–5)</p>
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
                <button onClick={addGoal} className="flex-1 py-2 rounded text-sm font-bold" style={{background:G.gold,color:'#000'}}>Add Goal</button>
                <button onClick={()=>setShowAdd(false)} className="px-4 py-2 rounded text-xs" style={{color:G.muted}}>Cancel</button>
              </div>
            </div>
          )}

          {/* Goals by type */}
          {loading ? (
            <div className="flex flex-col gap-2">{[1,2,3].map(i=><div key={i} className="h-20 rounded animate-pulse" style={{background:G.card}} />)}</div>
          ) : active.length===0 ? (
            <div className="rounded p-8 text-center" style={{background:G.card,border:`1px solid ${G.border}`}}>
              <p style={{color:G.muted}}>No active goals. Set your first quarterly goal.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {byType.map(({type,goals:tGoals})=>(
                <div key={type}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{color:G.muted}}>{type} goals</p>
                  <div className="flex flex-col gap-2">
                    {tGoals.map(g=>(
                      <div key={g.id}>
                        <button onClick={()=>setSelected(selected?.id===g.id?null:g)}
                          className="w-full rounded p-4 text-left transition-colors"
                          style={{background:selected?.id===g.id?G.card2:G.card, border:`1px solid ${selected?.id===g.id?roiColor(g.mission_roi)+'44':G.border}`, borderLeft:`2px solid ${roiColor(g.mission_roi)}`}}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold" style={{color:'#f0f0f0'}}>{g.title}</p>
                              {g.description&&<p className="text-xs mt-0.5" style={{color:G.muted}}>{g.description}</p>}
                              {g.quarter&&<p className="text-xs mt-0.5" style={{color:G.faint}}>{g.quarter}</p>}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-lg font-black font-mono" style={{color:roiColor(g.mission_roi)}}>{pct(g)}%</p>
                              {g.target&&<p className="text-xs font-mono" style={{color:G.muted}}>{g.current} / {g.target} {g.unit}</p>}
                            </div>
                          </div>
                          {/* Progress bar */}
                          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
                            <div className="h-full rounded-full transition-all duration-700" style={{width:`${pct(g)}%`,background:roiColor(g.mission_roi)}} />
                          </div>
                          {/* Key results mini */}
                          {g.key_results.length>0&&(
                            <div className="flex flex-wrap gap-1 mt-2">
                              {g.key_results.map(kr=>(
                                <span key={kr.id} className="text-[10px] px-1.5 py-0.5 rounded"
                                  style={{background:kr.done?`${G.green}18`:'rgba(255,255,255,0.05)',color:kr.done?G.green:G.muted,textDecoration:kr.done?'line-through':'none'}}>
                                  {kr.title}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>

                        {/* Expanded panel */}
                        {selected?.id===g.id&&(
                          <div className="rounded-b p-4 flex flex-col gap-4" style={{background:G.card2,border:`1px solid ${G.border}`,borderTop:'none'}}>
                            {/* Update progress */}
                            {g.target&&(
                              <div className="flex flex-col gap-2">
                                <p style={{color:G.faint,fontSize:'0.58rem',textTransform:'uppercase',letterSpacing:'0.08em'}}>Update progress</p>
                                <div className="flex items-center gap-2">
                                  <input type="number" defaultValue={g.current}
                                    onBlur={e=>updateProgress(g.id,Number(e.target.value))}
                                    className="w-28 px-3 py-1.5 rounded text-sm font-mono"
                                    style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'#f0f0f0'}} />
                                  <span style={{color:G.muted,fontSize:'0.8rem'}}>/ {g.target} {g.unit}</span>
                                </div>
                              </div>
                            )}

                            {/* Key Results */}
                            <div className="flex flex-col gap-2">
                              <p style={{color:G.faint,fontSize:'0.58rem',textTransform:'uppercase',letterSpacing:'0.08em'}}>Key Results</p>
                              {g.key_results.map(kr=>(
                                <div key={kr.id} className="flex items-center gap-3 py-1.5">
                                  <button onClick={()=>updateKR(kr.id,{done:!kr.done})}
                                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                                    style={{borderColor:kr.done?G.green:'rgba(255,255,255,0.2)',background:kr.done?`${G.green}20`:'transparent'}}>
                                    {kr.done&&<span style={{color:G.green,fontSize:'0.6rem'}}>✓</span>}
                                  </button>
                                  <span className="flex-1 text-xs" style={{color:kr.done?G.muted:'#e0e0e0',textDecoration:kr.done?'line-through':'none'}}>{kr.title}</span>
                                  <span className="text-xs font-mono" style={{color:G.muted}}>{kr.current}/{kr.target} {kr.unit}</span>
                                </div>
                              ))}
                              {/* Add KR */}
                              <div className="flex gap-2 mt-1">
                                <input placeholder="New key result…" value={krForm.title} onChange={e=>setKrForm(f=>({...f,title:e.target.value}))}
                                  onKeyDown={e=>e.key==='Enter'&&addKR(g.id)}
                                  className="flex-1 px-3 py-1.5 rounded text-xs" />
                                <input placeholder="Target" type="number" value={krForm.target} onChange={e=>setKrForm(f=>({...f,target:e.target.value}))} className="w-16 px-2 py-1.5 rounded text-xs" />
                                <button onClick={()=>addKR(g.id)} className="px-3 py-1.5 rounded text-xs font-bold" style={{background:`${G.blue}18`,color:G.blue,border:`1px solid ${G.blue}33`}}>Add</button>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-2" style={{borderTop:`1px solid ${G.border}`}}>
                              <button onClick={()=>setStatus(g.id,'achieved')} className="px-3 py-1.5 rounded text-xs font-semibold"
                                style={{background:`${G.green}18`,color:G.green,border:`1px solid ${G.green}33`}}>✓ Achieved</button>
                              <button onClick={()=>setStatus(g.id,'dropped')} className="px-3 py-1.5 rounded text-xs font-semibold"
                                style={{background:`${G.red}14`,color:G.red,border:`1px solid ${G.red}30`}}>Drop</button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {achieved.length>0&&(
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{color:G.green}}>✓ Achieved</p>
                  <div className="flex flex-col gap-1">
                    {achieved.map(g=>(
                      <div key={g.id} className="px-4 py-3 rounded flex items-center gap-3" style={{background:G.card,border:`1px solid ${G.border}`}}>
                        <span style={{color:G.green}}>✓</span>
                        <span className="text-sm" style={{color:G.muted,textDecoration:'line-through'}}>{g.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
