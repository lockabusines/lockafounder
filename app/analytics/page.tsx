'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TopRail } from '@/components/dashboard/TopRail'

const G = { green:'#1aff8c', red:'#ff4455', gold:'#f5c842', blue:'#4db8ff', purple:'#a78bfa', muted:'rgba(255,255,255,0.35)', faint:'rgba(255,255,255,0.15)', border:'rgba(255,255,255,0.08)', card:'#161618', card2:'#1c1c1f' }
const fmt = (n:number) => n>=1000?`£${(n/1000).toFixed(1)}k`:`£${n.toFixed(0)}`

interface Analytics {
  tasks: { open:number; overdue:number; avgRoi:number; roiDist:{roi:number;count:number}[]; byCategory:{category:string;count:number}[] }
  habits: { avgStreak:number; completedToday:number; total:number }
  finance: { monthSpend:number; spendByCat:{category:string;total:number}[]; passiveIncome:number; activeIncome:number; netMonthly:number; pipelineValue:number; wonValue:number; conversionRate:number }
  goals: { active:number; avgProgress:number }
}

function Bar({ value, max, color }: { value:number; max:number; color:string }) {
  return (
    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
      <div className="h-full rounded-full transition-all duration-700" style={{width:`${max?Math.round((value/max)*100):0}%`,background:color}} />
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label:string; value:string|number; sub?:string; color:string }) {
  return (
    <div className="p-4 rounded flex flex-col gap-1" style={{background:G.card,border:`1px solid ${G.border}`,borderLeft:`2px solid ${color}`}}>
      <p style={{color:G.muted,fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em'}}>{label}</p>
      <p className="text-2xl font-black font-mono" style={{color}}>{value}</p>
      {sub&&<p style={{color:G.faint,fontSize:'0.65rem'}}>{sub}</p>}
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetch('/api/analytics').then(r=>r.ok?r.json():null).then(d=>{ setData(d); setLoading(false) })
  },[])

  if (loading) return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />
      <main className="flex-1 flex items-center justify-center">
        <p style={{color:G.muted,fontSize:'0.75rem',fontFamily:'var(--font-geist-mono)'}}>Loading analytics…</p>
      </main>
    </div>
  )

  if (!data) return null
  const { tasks, habits, finance, goals } = data

  const maxRoiCount = Math.max(...tasks.roiDist.map(r=>r.count),1)
  const maxCatCount = Math.max(...tasks.byCategory.map(c=>c.count),1)
  const maxSpend    = Math.max(...finance.spendByCat.map(c=>c.total),1)
  const roiColors   = {1:G.red,2:'#ff8844',3:G.blue,4:G.green,5:G.gold}

  return (
    <div className="flex flex-col min-h-dvh">
      <TopRail />
      <main className="flex-1 p-4 md:p-5">
        <div className="max-w-5xl mx-auto flex flex-col gap-5">
          <div className="flex items-center gap-2 text-xs" style={{color:G.muted}}>
            <Link href="/" className="hover:opacity-70">Dashboard</Link>
            <span style={{color:G.faint}}>/</span>
            <span style={{color:'#f0f0f0'}}>Analytics</span>
          </div>

          {/* Finance row */}
          <section>
            <p className="section-id mb-3">01 // Finance</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <StatCard label="Net this month"  value={fmt(finance.netMonthly)}  color={finance.netMonthly>=0?G.green:G.red} />
              <StatCard label="Spent this month" value={fmt(finance.monthSpend)} color={G.gold} />
              <StatCard label="Pipeline value"  value={fmt(finance.pipelineValue)} color={G.blue} />
              <StatCard label="Conversion rate" value={`${finance.conversionRate}%`} sub={`${fmt(finance.wonValue)} collected`} color={G.purple} />
            </div>
            {finance.spendByCat.length>0&&(
              <div className="p-4 rounded" style={{background:G.card,border:`1px solid ${G.border}`}}>
                <p style={{color:G.faint,fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>Spend by category</p>
                <div className="flex flex-col gap-2">
                  {finance.spendByCat.map(c=>(
                    <div key={c.category} className="flex items-center gap-3">
                      <span className="text-xs capitalize w-20 shrink-0" style={{color:G.muted}}>{c.category}</span>
                      <Bar value={c.total} max={maxSpend} color={G.gold} />
                      <span className="text-xs font-mono w-14 text-right shrink-0" style={{color:G.gold}}>£{c.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Tasks row */}
          <section>
            <p className="section-id mb-3">02 // Tasks</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
              <StatCard label="Open tasks"   value={tasks.open}   color={G.blue} />
              <StatCard label="Overdue"       value={tasks.overdue} color={tasks.overdue>0?G.red:G.green} />
              <StatCard label="Avg ROI"       value={tasks.avgRoi} color={G.gold} />
              <StatCard label="Goals active"  value={goals.active} sub={`${goals.avgProgress}% avg progress`} color={G.purple} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* ROI distribution */}
              <div className="p-4 rounded" style={{background:G.card,border:`1px solid ${G.border}`}}>
                <p style={{color:G.faint,fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>ROI distribution</p>
                <div className="flex flex-col gap-2">
                  {tasks.roiDist.map(r=>(
                    <div key={r.roi} className="flex items-center gap-3">
                      <span className="text-xs font-mono w-4 shrink-0" style={{color:roiColors[r.roi as keyof typeof roiColors]}}>{r.roi}</span>
                      <Bar value={r.count} max={maxRoiCount} color={roiColors[r.roi as keyof typeof roiColors]} />
                      <span className="text-xs font-mono w-4 text-right shrink-0" style={{color:G.muted}}>{r.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Category breakdown */}
              <div className="p-4 rounded" style={{background:G.card,border:`1px solid ${G.border}`}}>
                <p style={{color:G.faint,fontSize:'0.6rem',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:12}}>Tasks by category</p>
                {tasks.byCategory.length===0?(
                  <p style={{color:G.faint,fontSize:'0.75rem'}}>No categorised tasks</p>
                ):(
                  <div className="flex flex-col gap-2">
                    {tasks.byCategory.map(c=>(
                      <div key={c.category} className="flex items-center gap-3">
                        <span className="text-xs capitalize w-20 shrink-0" style={{color:G.muted}}>{c.category}</span>
                        <Bar value={c.count} max={maxCatCount} color={G.blue} />
                        <span className="text-xs font-mono w-4 text-right shrink-0" style={{color:G.muted}}>{c.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Habits row */}
          <section>
            <p className="section-id mb-3">03 // Habits</p>
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Active habits"   value={habits.total}          color={G.blue} />
              <StatCard label="Done today"      value={`${habits.completedToday}/${habits.total}`} color={habits.completedToday===habits.total&&habits.total>0?G.green:G.gold} />
              <StatCard label="Avg streak"      value={`${habits.avgStreak}d`} color={G.purple} />
            </div>
          </section>

          {/* Income summary */}
          <section>
            <p className="section-id mb-3">04 // Income</p>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Active income / mo"  value={fmt(finance.activeIncome)}  color={G.green} />
              <StatCard label="Passive income / mo" value={fmt(finance.passiveIncome)} sub="goal: cover all expenses" color={G.blue} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
