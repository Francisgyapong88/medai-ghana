import { useEffect, useState } from 'react'
import {
  Users, ClipboardList, Brain, Plus, FileText,
  TrendingUp, ChevronRight, X, WifiOff
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'
import { canAccessClinicalFeatures } from '../utils/permissions'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface DashboardProps {
  onNavigate: (page: Page) => void
}

const diseaseColors: Record<string, string> = {
  'Malaria': '#EF4444',
  'Typhoid Fever': '#F59E0B',
  'Pneumonia': '#2563EB',
  'Diabetes Mellitus': '#8B5CF6',
  'Hypertension': '#0F766E',
}

interface DashboardCounts {
  totalPatients: number
  totalAssessments: number
  todaysAssessments: number
}

interface TrendPoint {
  date: string
  total: number
}

interface DiseaseSlice {
  name: string
  value: number
  color: string
}

interface RecentPatient {
  patient_id: number
  patient_number: string
  patient_name: string
  assessment_id: number
  assessment_date: string
  disease_name: string | null
  confidence_score: string | null
}

function buildLast7Days(trendData: TrendPoint[]) {

  const days: { day: string; assessments: number }[] = []

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  for (let i = 6; i >= 0; i--) {

    const date = new Date()
    date.setDate(date.getDate() - i)

    const isoDate = date.toISOString().split('T')[0]

    const match = trendData.find(t => t.date === isoDate)

    days.push({
      day: dayLabels[date.getDay()],
      assessments: match ? match.total : 0
    })

  }

  return days

}

export default function Dashboard({ onNavigate }: DashboardProps) {

  const [counts, setCounts] = useState<DashboardCounts | null>(null)
  const [totalPredictions, setTotalPredictions] = useState(0)
  const [trendData, setTrendData] = useState<{ day: string; assessments: number }[]>([])
  const [diseaseData, setDiseaseData] = useState<DiseaseSlice[]>([])
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([])
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [connectionError, setConnectionError] = useState(false)

  const userCanAccessClinical = canAccessClinicalFeatures()

  useEffect(() => {

    if (sessionStorage.getItem('justLoggedIn') === 'true') {
      setShowWelcome(true)
      sessionStorage.removeItem('justLoggedIn')
    }

    const token = localStorage.getItem('medai_token')

    const headers = { Authorization: `Bearer ${token}` }

    const fetchDashboardData = async () => {

      try {

        const requests = [
          axios.get('http://localhost:5000/api/dashboard/counts', { headers }),
          axios.get('http://localhost:5000/api/dashboard/disease-distribution', { headers }),
          axios.get('http://localhost:5000/api/dashboard/weekly-trend', { headers }),
        ]

        if (userCanAccessClinical) {
          requests.push(axios.get('http://localhost:5000/api/dashboard/recent-patients', { headers }))
        }

        const [countsRes, distributionRes, trendRes, recentPatientsRes] = await Promise.all(requests)

        setCounts(countsRes.data.data)

        const predictionTotal = distributionRes.data.data.reduce(
          (sum: number, item: any) => sum + item.total,
          0
        )

        setTotalPredictions(predictionTotal)

        const diseaseChartData: DiseaseSlice[] = distributionRes.data.data.map((item: any) => ({
          name: item.disease_name,
          value: item.total,
          color: diseaseColors[item.disease_name] ?? '#94A3B8'
        }))

        setDiseaseData(diseaseChartData)

        setTrendData(buildLast7Days(trendRes.data.data))

        if (recentPatientsRes) {
          setRecentPatients(recentPatientsRes.data.data)
        }

        setConnectionError(false)

      } catch (error) {

        console.error('Failed to load dashboard data:', error)
        setConnectionError(true)

      } finally {

        setLoading(false)

      }

    }

    fetchDashboardData()

  }, [])

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

  const statCards = [
    { label: "Today's Assessments", value: loading ? '—' : counts?.todaysAssessments ?? 0, icon: ClipboardList, color: '#0F766E', bg: '#F0FDF9' },
    { label: 'Total Patients', value: loading ? '—' : counts?.totalPatients ?? 0, icon: Users, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'AI Predictions', value: loading ? '—' : totalPredictions, icon: Brain, color: '#8B5CF6', bg: '#F5F3FF' },
  ]

  const quickActions = [
    { label: 'Register Patient', icon: Plus, color: '#0F766E', bg: '#F0FDF9', page: 'patient-registration', clinicalOnly: false },
    { label: 'New Assessment', icon: ClipboardList, color: '#2563EB', bg: '#EFF6FF', page: 'assessment', clinicalOnly: true },
    { label: 'Patient History', icon: FileText, color: '#06B6D4', bg: '#ECFEFF', page: 'history', clinicalOnly: true },
    { label: 'Analytics', icon: TrendingUp, color: '#8B5CF6', bg: '#F5F3FF', page: 'analytics', clinicalOnly: true },
  ].filter(action => !action.clinicalOnly || userCanAccessClinical)

  return (
    <DashboardLayout current="dashboard" onNavigate={onNavigate} title="Dashboard">

      {connectionError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <WifiOff size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">Connection failed.</span> Couldn't reach the server — the figures below may be out of date, not actually zero. Check that the backend and database are running, then refresh.
          </p>
        </div>
      )}

      {showWelcome && (
        <div className="mb-6 bg-gradient-to-r from-[#0F766E] to-[#0D5F58] rounded-2xl p-5 flex items-center justify-between text-white">
          <div>
            <p className="font-display font-700 text-lg">Welcome back, {storedUser.firstName ?? 'there'}!</p>
            <p className="text-sm text-teal-100">Here's what's happening across your clinic today.</p>
          </div>
          <button
            onClick={() => setShowWelcome(false)}
            title="Dismiss"
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.bg }}>
                <card.icon size={20} style={{ color: card.color }} />
              </div>
            </div>
            <p className="font-display font-800 text-2xl text-[#0F172A] mb-1">{card.value}</p>
            <p className="text-xs text-[#64748B] font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-700 text-[#0F172A] text-sm">Assessment Trends</h3>
              <p className="text-xs text-[#64748B]">Last 7 days</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0F766E] inline-block" />Assessments</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorAssess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0F766E" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Area type="monotone" dataKey="assessments" stroke="#0F766E" strokeWidth={2} fill="url(#colorAssess)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-display font-700 text-[#0F172A] text-sm mb-1">Disease Distribution</h3>
          <p className="text-xs text-[#64748B] mb-4">All time</p>
          {diseaseData.length === 0 ? (
            <p className="text-xs text-[#94A3B8] py-8 text-center">
              {connectionError ? 'Unable to load — connection failed.' : 'No predictions recorded yet.'}
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={diseaseData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {diseaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5">
                {diseaseData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-[#64748B]">{d.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-[#0F172A]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`grid gap-6 ${userCanAccessClinical ? 'lg:grid-cols-3' : 'lg:grid-cols-1'}`}>
        {/* Recent patients - clinical roles + admins only */}
        {userCanAccessClinical && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-display font-700 text-[#0F172A] text-sm">Recent Patients</h3>
              <button onClick={() => onNavigate('patients')} className="text-xs text-[#0F766E] font-semibold flex items-center gap-1 hover:underline">
                View All <ChevronRight size={12} />
              </button>
            </div>
            {recentPatients.length === 0 ? (
              <p className="text-xs text-[#94A3B8] px-5 py-8 text-center">
                {connectionError ? 'Unable to load — connection failed.' : 'No assessments recorded yet.'}
              </p>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentPatients.map(p => (
                  <div key={p.assessment_id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] text-xs font-bold flex-shrink-0">
                      {p.patient_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{p.patient_name}</p>
                      <p className="text-xs text-[#64748B]">{p.patient_number} · {p.assessment_date}</p>
                    </div>
                    <div className="text-right">
                      {p.disease_name ? (
                        <p className="text-xs font-semibold text-[#0F172A]">
                          {p.disease_name} <span className="text-[#0F766E]">{Number(p.confidence_score)}%</span>
                        </p>
                      ) : (
                        <p className="text-xs font-medium text-[#94A3B8]">No clear match</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm h-fit">
          <h3 className="font-display font-700 text-[#0F172A] text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map(action => (
              <button
                key={action.label}
                onClick={() => onNavigate(action.page as Page)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-[#0F766E]/30 hover:shadow-sm transition-all text-center"
                style={{ backgroundColor: action.bg }}
              >
                <action.icon size={18} style={{ color: action.color }} />
                <span className="text-[10px] font-semibold text-[#0F172A] leading-tight">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}