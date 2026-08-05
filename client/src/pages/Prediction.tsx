import { Printer, Plus, AlertTriangle } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import DashboardLayout from '../components/DashboardLayout'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface PredictionResult {
  disease_id: number | null
  ranking: number
  probability: number
  confidence_score: number
  explanation: string
  recommended_action: string
}

interface PredictionData {
  assessmentId?: number
  assessmentNumber?: string
  patientName?: string
  patientNumber?: string
  symptoms?: string[]
  prediction?: {
    sessionId: number
    predictionReference: string
    status: string
    results: PredictionResult[]
  }
}

interface PredictionProps {
  onNavigate: (page: Page, data?: any) => void
  data?: PredictionData
}

// Your rule engine only returns disease_id, not a name - map the 5 real
// disease IDs (per the `diseases` table) to display names here.
const DISEASE_NAMES: Record<number, string> = {
  1: 'Malaria',
  2: 'Typhoid Fever',
  3: 'Pneumonia',
  6: 'Hypertension',
  7: 'Diabetes Mellitus',
}

const DISEASE_COLORS: Record<number, string> = {
  1: '#EF4444',
  2: '#F59E0B',
  3: '#2563EB',
  6: '#0F766E',
  7: '#8B5CF6',
}

export default function Prediction({ onNavigate, data }: PredictionProps) {

  const results = data?.prediction?.results ?? []
  const top = results[0]

  if (!data || !data.prediction) {
    return (
      <DashboardLayout current="prediction" onNavigate={onNavigate} title="AI Prediction Result">
        <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
          <p className="text-[#64748B] mb-4">No assessment result to show yet.</p>
          <button
            onClick={() => onNavigate('assessment')}
            className="bg-[#0F766E] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#0D5F58] transition-all"
          >
            Start a New Assessment
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout current="prediction" onNavigate={onNavigate} title="AI Prediction Result">
      {/* Disclaimer banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex gap-4 items-start mb-6">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={20} className="text-amber-600" />
        </div>
        <div>
          <h4 className="font-display font-700 text-amber-900 mb-1">AI Decision-Support Notice</h4>
          <p className="text-sm text-amber-800 leading-relaxed">
            This prediction is a <strong>preliminary AI assessment only</strong>. It does <strong>NOT</strong> replace professional medical diagnosis. A qualified healthcare professional must verify all results before any clinical action is taken.
          </p>
        </div>
      </div>

      {!top ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center">
          <h2 className="font-display font-800 text-xl text-[#0F172A] mb-2">No Strong Disease Pattern Identified</h2>
          <p className="text-[#64748B] mb-1">The symptoms and vitals recorded didn't match any of the 5 conditions this system screens for with high confidence.</p>
          <p className="text-[#64748B]">Reference: {data.prediction?.predictionReference}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main prediction */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center">
            <p className="text-xs font-semibold text-[#64748B] mb-1">TOP PREDICTION</p>
            <h2 className="font-display font-800 text-2xl text-[#0F172A] mb-1">
              {top.disease_id ? DISEASE_NAMES[top.disease_id] ?? 'Unknown' : 'Unknown'}
            </h2>
            <p className="text-xs text-[#64748B] mb-6">
              Patient: {data.patientName} · {data.patientNumber}
            </p>

            {/* Gauge */}
            <div className="relative w-48 h-48 mx-auto mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="60%" outerRadius="80%"
                  startAngle={180} endAngle={0}
                  data={[{ value: 100, fill: '#F1F5F9' }, { value: top.confidence_score, fill: '#0F766E' }]}
                >
                  <RadialBar dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-800 text-4xl text-[#0F766E]">{Math.round(top.confidence_score)}%</span>
                <span className="text-xs text-[#64748B] font-medium">Confidence</span>
              </div>
            </div>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-6 ${
              top.confidence_score >= 80 ? 'bg-red-100 text-red-700' : top.confidence_score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
            }`}>
              {top.confidence_score >= 80 ? 'High Probability' : top.confidence_score >= 60 ? 'Moderate Probability' : 'Low Probability'}
            </div>

            {/* Symptoms considered */}
            {data.symptoms && data.symptoms.length > 0 && (
              <div className="text-left">
                <p className="text-xs font-semibold text-[#0F172A] mb-2">Symptoms Considered</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.symptoms.map(s => (
                    <span key={s} className="text-[10px] bg-[#F0FDF9] text-[#0F766E] border border-[#0F766E]/20 px-2 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Other predictions + explanation */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-display font-700 text-[#0F172A] text-sm mb-4">All Predictions</h3>
              <div className="space-y-3">
                {results.map((p, i) => {
                  const name = p.disease_id ? DISEASE_NAMES[p.disease_id] ?? 'Unknown' : 'Unknown'
                  const color = p.disease_id ? DISEASE_COLORS[p.disease_id] ?? '#64748B' : '#64748B'
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {i === 0 && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">TOP</span>}
                          <span className="text-sm font-medium text-[#0F172A]">{name}</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color }}>{Math.round(p.confidence_score)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all" style={{ width: `${p.confidence_score}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <h3 className="font-display font-700 text-[#0F172A] text-sm mb-4">Suggested Clinical Steps</h3>
              <div className="space-y-2">
                {results.map((p, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#0F766E]/10 text-[#0F766E] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-xs text-[#64748B] leading-relaxed">{p.recommended_action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Why this prediction */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h3 className="font-display font-700 text-[#0F172A] text-sm mb-1">Why This Prediction</h3>
            <p className="text-xs text-[#64748B] mb-4">Reasoning behind the top result</p>
            <p className="text-sm text-[#0F172A] leading-relaxed bg-slate-50 rounded-xl p-4">{top.explanation}</p>

            <div className="mt-5 pt-5 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Reference</span>
                <span className="font-semibold text-[#0F172A]">{data.prediction?.predictionReference}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#64748B]">Status</span>
                <span className="font-semibold text-[#0F172A]">{data.prediction?.status}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end mt-6">
        <button onClick={() => window.print()} className="flex items-center gap-2 text-sm font-semibold text-[#64748B] border border-slate-200 px-5 py-2.5 rounded-xl hover:border-slate-300 transition-all">
          <Printer size={15} /> Print Report
        </button>
        <button onClick={() => onNavigate('assessment')} className="flex items-center gap-2 bg-[#0F766E] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#0D5F58] transition-all hover:shadow-lg hover:shadow-[#0F766E]/25">
          <Plus size={15} /> Start New Assessment
        </button>
      </div>
    </DashboardLayout>
  )
}