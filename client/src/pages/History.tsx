import { useEffect, useState } from 'react'
import { Search, Filter, Eye, WifiOff } from 'lucide-react'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface HistoryProps {
  onNavigate: (page: Page, data?: any) => void
}

interface HistoryEntry {
  assessment_id: number
  assessment_number: string
  patient_id: number
  patient_number: string
  patient_name: string
  assessment_date: string
  prediction_reference: string | null
  overall_confidence: string | null
  prediction_status: string | null
  disease_id: number | null
  disease_name: string | null
  confidence_score: string | null
  explanation: string | null
  predicted_by_name: string | null
}

const DISEASE_COLORS: Record<string, string> = {
  'Malaria': 'bg-red-100 text-red-700',
  'Typhoid Fever': 'bg-amber-100 text-amber-700',
  'Pneumonia': 'bg-blue-100 text-blue-700',
  'Hypertension': 'bg-teal-100 text-teal-700',
  'Diabetes Mellitus': 'bg-purple-100 text-purple-700',
}

export default function History({ onNavigate }: HistoryProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [diseaseFilter, setDiseaseFilter] = useState('All')
  const [openingId, setOpeningId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [connectionError, setConnectionError] = useState(false)

  const token = localStorage.getItem('medai_token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {

    axios.get('https://medai-ghana-backend.onrender.com//api/history', { headers })
      .then(res => {
        setEntries(res.data.data)
        setConnectionError(false)
      })
      .catch(err => {
        console.error('Failed to load history:', err)
        setConnectionError(true)
      })
      .finally(() => setLoading(false))

  }, [])

  const diseaseOptions = ['All', ...Array.from(new Set(entries.map(e => e.disease_name).filter(Boolean) as string[]))]

  const filtered = entries.filter(e => {
    const matchSearch =
      e.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      e.patient_number.toLowerCase().includes(search.toLowerCase())
    const matchDisease = diseaseFilter === 'All' || e.disease_name === diseaseFilter
    return matchSearch && matchDisease
  })

  const handleViewDetails = async (assessmentId: number) => {

    setError('')
    setOpeningId(assessmentId)

    try {

      const res = await axios.get(`https://medai-ghana-backend.onrender.com//api/history/${assessmentId}`, { headers })

      onNavigate('prediction', res.data.data)

    } catch (err) {

      console.error('Failed to load assessment detail:', err)
      setError('Failed to load that assessment. Please try again.')

    } finally {

      setOpeningId(null)

    }

  }

  return (
    <DashboardLayout current="history" onNavigate={onNavigate} title="Assessment History">

      {connectionError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <WifiOff size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">Connection failed.</span> Couldn't reach the server — existing records may still exist and simply couldn't be loaded. Check that the backend and database are running, then refresh.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name or number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#0F172A] placeholder:text-slate-400 outline-none"
          />
        </div>
        <select
          value={diseaseFilter}
          onChange={e => setDiseaseFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-[#0F172A] outline-none focus:border-[#0F766E] cursor-pointer"
        >
          {diseaseOptions.map(d => <option key={d}>{d}</option>)}
        </select>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-[#64748B] py-16">Loading history...</p>
      ) : (
        <>
          {/* Timeline */}
          <div className="space-y-3">
            {filtered.map((e, i) => (
              <div key={e.assessment_id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-[#0F766E]/30 transition-all">
                <div className="flex items-start gap-4">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-3 h-3 rounded-full bg-[#0F766E] flex-shrink-0" />
                    {i < filtered.length - 1 && <div className="w-0.5 bg-slate-200 flex-1 mt-2 min-h-8" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-display font-700 text-[#0F172A] text-sm">{e.patient_name}</h3>
                          <span className="text-xs text-[#64748B] font-mono">{e.patient_number}</span>
                          {e.disease_name ? (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${DISEASE_COLORS[e.disease_name] ?? 'bg-slate-100 text-slate-600'}`}>
                              {e.disease_name}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                              No clear match
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">{e.assessment_date} · {e.predicted_by_name ?? 'Unknown clinician'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(e.assessment_id)}
                          disabled={openingId === e.assessment_id}
                          title="View Details"
                          className="p-1.5 hover:bg-[#0F766E]/10 rounded-lg text-[#0F766E] transition-colors disabled:opacity-50"
                        >
                          {openingId === e.assessment_id ? (
                            <div className="w-[15px] h-[15px] border-2 border-[#0F766E]/30 border-t-[#0F766E] rounded-full animate-spin" />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      {e.confidence_score && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#64748B]">Confidence:</span>
                          <span className="text-sm font-bold text-[#0F766E]">{Math.round(Number(e.confidence_score))}%</span>
                          <div className="w-20 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 bg-[#0F766E] rounded-full" style={{ width: `${e.confidence_score}%` }} />
                          </div>
                        </div>
                      )}
                      <span className="text-xs font-mono text-slate-300">{e.assessment_number}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {connectionError ? <WifiOff size={24} className="text-red-400" /> : <Filter size={24} className="text-slate-400" />}
              </div>
              <p className="text-[#64748B] font-medium">
                {connectionError
                  ? 'Unable to load history — connection failed.'
                  : entries.length === 0
                    ? 'No assessments have been recorded yet.'
                    : 'No assessments match your filters'}
              </p>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}