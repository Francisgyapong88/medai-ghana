import { useEffect, useState } from 'react'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { WifiOff } from 'lucide-react'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface AnalyticsProps {
  onNavigate: (page: Page) => void
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

interface SymptomCount {
  symptom: string
  count: number
}

const diseaseColors: Record<string, string> = {
  'Malaria': '#EF4444',
  'Typhoid Fever': '#F59E0B',
  'Pneumonia': '#2563EB',
  'Diabetes Mellitus': '#8B5CF6',
  'Hypertension': '#0F766E',
}

const symptomBarColors = ['#0F766E', '#2563EB', '#06B6D4', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#F97316']

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

export default function Analytics({ onNavigate }: AnalyticsProps) {

  const [counts, setCounts] = useState<DashboardCounts | null>(null)
  const [totalPredictions, setTotalPredictions] = useState(0)
  const [trendData, setTrendData] = useState<{ day: string; assessments: number }[]>([])
  const [diseaseData, setDiseaseData] = useState<DiseaseSlice[]>([])
  const [symptomData, setSymptomData] = useState<SymptomCount[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionError, setConnectionError] = useState(false)

  useEffect(() => {

    const token = localStorage.getItem('medai_token')
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      axios.get('https://medai-ghana-backend.onrender.com//api/dashboard/counts', { headers }),
      axios.get('https://medai-ghana-backend.onrender.com//api/dashboard/disease-distribution', { headers }),
      axios.get('https://medai-ghana-backend.onrender.com//api/dashboard/weekly-trend', { headers }),
      axios.get('https://medai-ghana-backend.onrender.com//api/analytics/symptom-frequency', { headers }),
    ])
      .then(([countsRes, distributionRes, trendRes, symptomsRes]) => {

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

        setSymptomData(symptomsRes.data.data)

        setConnectionError(false)

      })
      .catch(err => {
        console.error('Failed to load analytics:', err)
        setConnectionError(true)
      })
      .finally(() => setLoading(false))

  }, [])

  const kpiCards = [
    { label: 'Total Patients', value: loading ? '—' : counts?.totalPatients ?? 0 },
    { label: 'Total Assessments', value: loading ? '—' : counts?.totalAssessments ?? 0 },
    { label: "Today's Assessments", value: loading ? '—' : counts?.todaysAssessments ?? 0 },
    { label: 'AI Predictions', value: loading ? '—' : totalPredictions },
  ]

  return (
    <DashboardLayout current="analytics" onNavigate={onNavigate} title="Analytics Dashboard">

      {connectionError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <WifiOff size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">Connection failed.</span> Couldn't reach the server — the figures below may be out of date, not actually zero. Check that the backend and database are running, then refresh.
          </p>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <span className="text-xs font-semibold text-[#64748B]">{kpi.label}</span>
            <p className="font-display font-800 text-2xl text-[#0F172A] mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Assessment trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-display font-700 text-[#0F172A] text-sm">Assessment Trend</h3>
          <p className="text-xs text-[#64748B] mb-4">Last 7 days</p>
          {trendData.every(d => d.assessments === 0) ? (
            <div className="h-[220px] flex items-center justify-center text-xs text-[#94A3B8]">
              {connectionError ? 'Unable to load — connection failed.' : 'No assessments in this period.'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gradAssess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                <Area type="monotone" dataKey="assessments" name="Assessments" stroke="#0F766E" strokeWidth={2} fill="url(#gradAssess)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Disease distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-display font-700 text-[#0F172A] text-sm mb-1">Disease Distribution</h3>
          <p className="text-xs text-[#64748B] mb-4">All time</p>
          {diseaseData.length === 0 ? (
            <p className="text-xs text-[#94A3B8] py-8 text-center">
              {connectionError ? 'Unable to load — connection failed.' : 'No predictions recorded yet.'}
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={diseaseData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {diseaseData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {diseaseData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-[#64748B]">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0F172A]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Most common symptoms */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <h3 className="font-display font-700 text-[#0F172A] text-sm mb-1">Most Common Symptoms</h3>
        <p className="text-xs text-[#64748B] mb-4">All time, top 8</p>
        {symptomData.length === 0 ? (
          <p className="text-xs text-[#94A3B8] py-8 text-center">
            {connectionError ? 'Unable to load — connection failed.' : 'No symptoms recorded yet.'}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={symptomData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="symptom" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {symptomData.map((_, i) => (
                  <Cell key={i} fill={symptomBarColors[i % symptomBarColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardLayout>
  )
}