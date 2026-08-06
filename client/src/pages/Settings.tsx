import { useEffect, useState } from 'react'
import { User, Shield, Info, Sparkles } from 'lucide-react'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface SettingsProps {
  onNavigate: (page: Page) => void
}

interface MyProfile {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string | null
  roleId: number
}

const ROLE_NAMES: Record<number, string> = {
  1: 'Super Administrator',
  2: 'Administrator',
  3: 'Doctor',
  4: 'Nurse',
  5: 'Laboratory Scientist',
  6: 'Health Officer',
  7: 'Receptionist',
  8: 'Patient',
}

const upcomingFeatures = [
  { title: 'Appearance & Theme', desc: 'Light/dark mode and layout density preferences.' },
  { title: 'Language & Region', desc: 'Interface language (Twi, Ga, Hausa, French) and date/time formats.' },
  { title: 'Session Timeout Control', desc: 'Configure how long you stay signed in before requiring re-authentication.' },
  { title: 'Two-Factor Authentication', desc: 'Add an SMS-based second layer of login security.' },
  { title: 'Audit Log Viewer', desc: 'Browse a searchable history of account and record activity.' },
  { title: 'Notification Preferences', desc: 'Choose which events trigger alerts.' },
]

export default function Settings({ onNavigate }: SettingsProps) {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const token = localStorage.getItem('medai_token')

    axios.get('https://medai-ghana-backend.onrender.com//api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setProfile(res.data.user))
      .catch(err => console.error('Failed to load account info:', err))
      .finally(() => setLoading(false))

  }, [])

  return (
    <DashboardLayout current="settings" onNavigate={onNavigate} title="Settings">
      <div className="max-w-3xl space-y-6">

        {/* Account */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-[#0F766E]" />
            <h3 className="font-display font-700 text-[#0F172A]">Account</h3>
          </div>

          {loading ? (
            <p className="text-sm text-[#64748B]">Loading account info...</p>
          ) : profile ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Name', value: `${profile.firstName} ${profile.lastName}` },
                { label: 'Username', value: `@${profile.username}` },
                { label: 'Email', value: profile.email },
                { label: 'Phone', value: profile.phoneNumber ?? 'Not set' },
                { label: 'Role', value: ROLE_NAMES[profile.roleId] ?? 'Unknown' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-[#64748B] mb-1">{label}</p>
                  <p className="font-semibold text-[#0F172A] text-sm">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-red-600">Failed to load account info.</p>
          )}

          <button
            onClick={() => onNavigate('profile')}
            className="mt-5 text-sm font-semibold text-[#0F766E] hover:underline"
          >
            Edit phone number, or change password →
          </button>
        </div>

        {/* Security note */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={18} className="text-[#0F766E]" />
            <h3 className="font-display font-700 text-[#0F172A]">Security</h3>
          </div>
          <p className="text-sm text-[#64748B]">
            Password changes are handled from your <button onClick={() => onNavigate('profile')} className="text-[#0F766E] font-semibold hover:underline">Profile</button> page.
            Account access is controlled by an administrator based on your assigned role — see the badge above for your current permissions.
          </p>
        </div>

        {/* Coming soon */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#0F766E]" />
            <h3 className="font-display font-700 text-[#0F172A]">Planned Features</h3>
          </div>
          <p className="text-sm text-[#64748B] mb-5">These settings are planned for a future update and aren't functional yet.</p>
          <div className="space-y-3">
            {upcomingFeatures.map(f => (
              <div key={f.title} className="flex items-start justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{f.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{f.desc}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-500 flex-shrink-0">Coming Soon</span>
              </div>
            ))}
          </div>
        </div>

        {/* System info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-3">
            <Info size={18} className="text-[#0F766E]" />
            <h3 className="font-display font-700 text-[#0F172A]">About</h3>
          </div>
          <div className="text-sm text-[#64748B] space-y-1">
            <p><span className="font-medium text-[#0F172A]">MedAI Ghana</span> — Clinical Decision Support System</p>
            <p>A Final Year Project — AI-based diagnostic assistant for rural clinics in Ghana.</p>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}