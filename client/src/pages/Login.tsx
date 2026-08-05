import { useState } from 'react'
import { Eye, EyeOff, Stethoscope, Shield, ArrowRight } from 'lucide-react'
import axios from 'axios'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface LoginProps {
  onNavigate: (page: Page) => void
}

export default function Login({ onNavigate }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      })

      localStorage.setItem('medai_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      sessionStorage.setItem('justLoggedIn', 'true')

      setLoading(false)
      onNavigate('dashboard')

    } catch (err: any) {

      setLoading(false)

      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      )

    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F766E] via-[#0D5F58] to-[#0F172A] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
              style={{
                width: (i + 1) * 60,
                height: (i + 1) * 60,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.3 - i * 0.01,
              }}
            />
          ))}
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-800 text-white">MedAI Ghana</p>
            <p className="text-teal-300 text-xs">Clinical Decision Support System</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="font-display font-800 text-4xl text-white leading-tight mb-6">
            Empowering clinicians with AI-assisted diagnostics
          </h2>
          <div className="space-y-4">
            {[
              { icon: '🎯', text: '95% prediction accuracy on validated clinical data' },
              { icon: '🔒', text: 'HIPAA-compliant, encrypted patient records' },
              { icon: '🌍', text: 'Serving rural clinics across all 16 regions of Ghana' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-teal-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3">
          <Shield size={14} className="text-teal-400" />
          <p className="text-teal-300 text-xs">Approved by Ghana Health Service | WHO-aligned protocols</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-[#0F766E] rounded-xl flex items-center justify-center">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="font-display font-800 text-[#0F172A]">MedAI Ghana</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
            <div className="mb-8">
              <h1 className="font-display font-800 text-2xl text-[#0F172A] mb-1">Welcome back</h1>
              <p className="text-[#64748B] text-sm">Sign in to your healthcare portal</p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="doctor@clinic.gh"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] transition-all bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30 focus:border-[#0F766E] transition-all bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0F766E] accent-[#0F766E]"
                  />
                  <span className="text-xs text-[#64748B]">Remember me</span>
                </label>
                <button type="button" className="text-xs text-[#0F766E] font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0F766E] text-white font-semibold py-3 rounded-xl hover:bg-[#0D5F58] transition-all disabled:opacity-70 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#0F766E]/25"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight size={16} /></>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-[#64748B]">
                Need access?{' '}
                <button className="text-[#0F766E] font-semibold hover:underline">
                  Contact your administrator
                </button>
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button onClick={() => onNavigate('landing')} className="text-xs text-slate-400 hover:text-[#0F766E] transition-colors">
              ← Back to home
            </button>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 items-start">
            <span className="text-amber-500 text-sm flex-shrink-0">⚠️</span>
            <p className="text-xs text-amber-800 leading-snug">
              This system is for authorized healthcare professionals only. All access is logged and audited in compliance with Ghana Health Service data governance policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}