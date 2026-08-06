import { useEffect, useState } from 'react'
import { Save, Shield, Lock } from 'lucide-react'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface ProfileProps {
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

export default function Profile({ onNavigate }: ProfileProps) {
  const [tab, setTab] = useState<'info' | 'password'>('info')
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoMessage, setInfoMessage] = useState('')
  const [infoError, setInfoError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const token = localStorage.getItem('medai_token')
  const headers = { Authorization: `Bearer ${token}` }

  const loadProfile = () => {
    axios.get('https://medai-ghana-backend.onrender.com/api/auth/me', { headers })
      .then(res => {
        setProfile(res.data.user)
        setFirstName(res.data.user.firstName)
        setLastName(res.data.user.lastName)
        setPhoneNumber(res.data.user.phoneNumber ?? '')
      })
      .catch(err => console.error('Failed to load profile:', err))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const initials = profile ? `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}` : '—'

  const handleSaveInfo = async () => {

    setInfoMessage('')
    setInfoError('')

    setSavingInfo(true)

    try {

      await axios.put(
        'https://medai-ghana-backend.onrender.com/api/auth/me',
        { firstName, lastName, phoneNumber: phoneNumber || null },
        { headers }
      )

      setInfoMessage('Phone number updated successfully.')

      loadProfile()

    } catch (err: any) {

      setInfoError(err.response?.data?.message || 'Failed to update profile.')

    } finally {

      setSavingInfo(false)

    }

  }

  const handleChangePassword = async () => {

    setPasswordMessage('')
    setPasswordError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    setSavingPassword(true)

    try {

      await axios.post(
        'https://medai-ghana-backend.onrender.com/api/auth/change-password',
        { currentPassword, newPassword },
        { headers }
      )

      setPasswordMessage('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

    } catch (err: any) {

      setPasswordError(err.response?.data?.message || 'Failed to update password.')

    } finally {

      setSavingPassword(false)

    }

  }

  if (loading) {
    return (
      <DashboardLayout current="profile" onNavigate={onNavigate} title="User Profile">
        <p className="text-center text-sm text-[#64748B] py-16">Loading profile...</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout current="profile" onNavigate={onNavigate} title="User Profile">
      <div className="max-w-3xl mx-auto">
        {/* Profile header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex flex-wrap items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#0F766E] flex items-center justify-center text-white text-2xl font-display font-800">
              {initials}
            </div>
            <div className="flex-1">
              <h2 className="font-display font-800 text-xl text-[#0F172A]">{profile?.firstName} {profile?.lastName}</h2>
              <p className="text-[#64748B] text-sm">@{profile?.username} · {profile?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs bg-[#F0FDF9] text-[#0F766E] border border-[#0F766E]/20 px-2.5 py-1 rounded-full font-medium">
                  {profile ? ROLE_NAMES[profile.roleId] ?? 'Unknown Role' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
          {[
            { id: 'info', label: 'Personal Info' },
            { id: 'password', label: 'Security' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${tab === t.id ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'info' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-display font-700 text-[#0F172A] mb-2">Personal Information</h3>

            {infoMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs text-green-700">{infoMessage}</p>
              </div>
            )}
            {infoError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-700">{infoError}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">First Name</label>
                <input
                  value={firstName}
                  readOnly
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 bg-slate-100 outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Last Name</label>
                <input
                  value={lastName}
                  readOnly
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 bg-slate-100 outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Email</label>
                <input
                  value={profile?.email ?? ''}
                  readOnly
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 bg-slate-100 outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Phone</label>
                <input
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+233 24 000 0000"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400">Name, email, and username cannot be changed here — contact an administrator if these need to be updated.</p>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveInfo}
                disabled={savingInfo}
                className="flex items-center gap-2 bg-[#0F766E] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0D5F58] transition-all disabled:opacity-50"
              >
                <Save size={14} /> {savingInfo ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {tab === 'password' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={18} className="text-[#0F766E]" />
              <h3 className="font-display font-700 text-[#0F172A]">Security Settings</h3>
            </div>

            {passwordMessage && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-xs text-green-700">{passwordMessage}</p>
              </div>
            )}
            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-700">{passwordError}</p>
              </div>
            )}

            {[
              { label: 'Current Password', value: currentPassword, set: setCurrentPassword },
              { label: 'New Password', value: newPassword, set: setNewPassword },
              { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">{f.label}</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all"
                  />
                </div>
              </div>
            ))}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs text-blue-800 font-medium">Password must be at least 8 characters.</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="flex items-center gap-2 bg-[#0F766E] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#0D5F58] transition-all disabled:opacity-50"
              >
                <Save size={14} /> {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}