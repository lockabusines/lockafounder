import { createServiceClient } from '@/lib/supabase'
const UID = () => process.env.USER_ID ?? 'ernest'

export async function GET() {
  const db = createServiceClient()
  const uid = UID()

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]
  const monthStart = today.slice(0, 7) + '-01'

  const [tasks, habits, expenses, jobs, streams, goals] = await Promise.all([
    db.from('tasks').select('id,status,mission_roi,xp_value,due_date,created_at,category').eq('user_id', uid),
    db.from('habits').select('name,current_streak,longest_streak,completed_today').eq('user_id', uid).eq('active', true),
    db.from('expenses').select('amount,category,date').eq('user_id', uid).gte('date', monthStart),
    db.from('opportunities').select('status,value,skill,created_at').eq('user_id', uid),
    db.from('income_streams').select('monthly_amount,type,is_active').eq('user_id', uid),
    db.from('goals').select('id,title,status,current,target,mission_roi').eq('user_id', uid),
  ])

  const taskData    = tasks.data ?? []
  const habitData   = habits.data ?? []
  const expenseData = expenses.data ?? []
  const jobData     = jobs.data ?? []
  const streamData  = streams.data ?? []
  const goalData    = goals.data ?? []

  // Task stats
  const openTasks      = taskData.filter(t => t.status === 'open')
  const overdueTasks   = openTasks.filter(t => t.due_date && t.due_date < today)
  const avgRoi         = openTasks.length ? openTasks.reduce((s, t) => s + t.mission_roi, 0) / openTasks.length : 0
  const roiDist        = [1,2,3,4,5].map(r => ({ roi: r, count: openTasks.filter(t => t.mission_roi === r).length }))
  const tasksByCategory = Object.entries(
    openTasks.reduce((acc: Record<string,number>, t) => { acc[t.category] = (acc[t.category]??0)+1; return acc }, {})
  ).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count)

  // Habit stats
  const habitStreak    = habitData.length ? Math.round(habitData.reduce((s,h) => s+h.current_streak,0)/habitData.length) : 0
  const completedToday = habitData.filter(h => h.completed_today).length

  // Finance
  const monthSpend     = expenseData.reduce((s,e) => s+e.amount, 0)
  const spendByCat     = Object.entries(
    expenseData.reduce((acc: Record<string,number>, e) => { acc[e.category]=(acc[e.category]??0)+e.amount; return acc }, {})
  ).map(([category, total]) => ({ category, total: Number(total.toFixed(2)) })).sort((a,b)=>b.total-a.total)

  const passiveIncome  = streamData.filter(s=>s.is_active && s.type==='passive').reduce((s,x)=>s+x.monthly_amount,0)
  const activeIncome   = streamData.filter(s=>s.is_active && s.type==='active').reduce((s,x)=>s+x.monthly_amount,0)
  const netMonthly     = passiveIncome + activeIncome - monthSpend

  // CRM pipeline
  const pipelineValue  = jobData.filter(j=>!['lost','paid'].includes(j.status)).reduce((s,j)=>s+(j.value??0),0)
  const wonValue       = jobData.filter(j=>j.status==='paid').reduce((s,j)=>s+(j.value??0),0)
  const conversionRate = jobData.length ? Math.round((jobData.filter(j=>j.status==='paid').length/jobData.length)*100) : 0

  // Goals
  const activeGoals    = goalData.filter(g=>g.status==='active')
  const avgGoalPct     = activeGoals.length
    ? Math.round(activeGoals.reduce((s,g)=>s+(g.target?Math.min(100,(g.current/g.target)*100):0),0)/activeGoals.length)
    : 0

  return Response.json({
    tasks: { open: openTasks.length, overdue: overdueTasks.length, avgRoi: Number(avgRoi.toFixed(1)), roiDist, byCategory: tasksByCategory },
    habits: { avgStreak: habitStreak, completedToday, total: habitData.length },
    finance: { monthSpend: Number(monthSpend.toFixed(2)), spendByCat, passiveIncome, activeIncome, netMonthly: Number(netMonthly.toFixed(2)), pipelineValue, wonValue, conversionRate },
    goals: { active: activeGoals.length, avgProgress: avgGoalPct },
  })
}
