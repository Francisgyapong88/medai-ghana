import { useEffect, useState } from 'react'
import { Plus, Search, Edit, KeyRound, UserX, UserCheck, WifiOff } from 'lucide-react'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface UserManagementProps {
  onNavigate: (page: Page) => void
}

interface StaffUser {
  user_id: number
  first_name: string
  last_name: string
  username: string
  email: string
  phone_number: string | null
  role_id: number
  role_name: string
  facility_id: number | null
  facility_name: string | null
  is_active: number
  last_login: string | null
}

interface Facility {
  facility_id: number
  facility_name: string
}

const ROLE_OPTIONS = [
  { id: 1, label: 'Super Administrator' },
  { id: 2, label: 'Administrator' },
  { id: 3, label: 'Doctor' },
  { id: 4, label: 'Nurse' },
  { id: 5, label: 'Laboratory Scientist' },
  { id: 6, label: 'Health Officer' },
  { id: 7, label: 'Receptionist' },
]

const ROLE_COLORS: Record<string, string> = {
  'Super Administrator': 'bg-red-100 text-red-700',
  'Administrator': 'bg-purple-100 text-purple-700',
  'Doctor': 'bg-[#CCFBF1] text-[#0F766E]',
  'Nurse': 'bg-blue-100 text-blue-700',
  'Laboratory Scientist': 'bg-amber-100 text-amber-700',
  'Health Officer': 'bg-cyan-100 text-cyan-700',
  'Receptionist': 'bg-slate-200 text-slate-700',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function UserManagement({ onNavigate }: UserManagementProps) {
  const [users, setUsers] = useState<StaffUser[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [connectionError, setConnectionError] = useState(false)

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [roleId, setRoleId] = useState('4')
  const [facilityId, setFacilityId] = useState('')

  // Edit modal
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editRoleId, setEditRoleId] = useState('')
  const [editFacilityId, setEditFacilityId] = useState('')

  // Reset password modal
  const [resettingUser, setResettingUser] = useState<StaffUser | null>(null)
  const [resetPasswordValue, setResetPasswordValue] = useState('')
  const [resetConfirmValue, setResetConfirmValue] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetting, setResetting] = useState(false)

  const token = localStorage.getItem('medai_token')
  const headers = { Authorization: `Bearer ${token}` }

  const loadUsers = () => {
    setLoading(true)
    axios.get('https://medai-ghana-backend.onrender.com/api/users', { headers })
      .then(res => {
        setUsers(res.data.data)
        setConnectionError(false)
      })
      .catch(err => {
        console.error('Failed to load users:', err)
        setConnectionError(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
    axios.get('https://medai-ghana-backend.onrender.com/api/facilities', { headers })
      .then(res => setFacilities(res.data.data ?? res.data))
      .catch(() => setFacilities([]))
  }, [])

  const resetCreateForm = () => {
    setFirstName('')
    setLastName('')
    setUsername('')
    setEmail('')
    setPhoneNumber('')
    setPassword('')
    setConfirmPassword('')
    setRoleId('4')
    setFacilityId('')
    setCreateError('')
  }

  const handleCreate = async () => {

    setCreateError('')

    if (!firstName || !lastName || !username || !email || !password) {
      setCreateError('All fields except phone and facility are required.')
      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      setCreateError('Please enter a valid email address.')
      return
    }

    if (password.length < 8) {
      setCreateError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setCreateError('Passwords do not match.')
      return
    }

    setCreating(true)

    try {

      await axios.post(
        'https://medai-ghana-backend.onrender.com/api/users',
        {
          first_name: firstName,
          last_name: lastName,
          username,
          email,
          phone_number: phoneNumber || null,
          password,
          role_id: Number(roleId),
          facility_id: facilityId ? Number(facilityId) : null,
        },
        { headers }
      )

      setShowCreateModal(false)
      resetCreateForm()
      loadUsers()

    } catch (err: any) {

      setCreateError(err.response?.data?.message || 'Failed to create user.')

    } finally {

      setCreating(false)

    }

  }

  const openEdit = (u: StaffUser) => {
    setEditingUser(u)
    setEditFirstName(u.first_name)
    setEditLastName(u.last_name)
    setEditPhone(u.phone_number ?? '')
    setEditRoleId(String(u.role_id))
    setEditFacilityId(u.facility_id ? String(u.facility_id) : '')
    setEditError('')
  }

  const handleSaveEdit = async () => {

    if (!editingUser) return

    setEditError('')

    if (!editFirstName || !editLastName || !editRoleId) {
      setEditError('First name, last name, and role are required.')
      return
    }

    setSavingEdit(true)

    try {

      await axios.put(
        `https://medai-ghana-backend.onrender.com/api/users/${editingUser.user_id}`,
        {
          first_name: editFirstName,
          last_name: editLastName,
          phone_number: editPhone || null,
          role_id: Number(editRoleId),
          facility_id: editFacilityId ? Number(editFacilityId) : null,
        },
        { headers }
      )

      setEditingUser(null)
      loadUsers()

    } catch (err: any) {

      setEditError(err.response?.data?.message || 'Failed to update user.')

    } finally {

      setSavingEdit(false)

    }

  }

  const openResetPassword = (u: StaffUser) => {
    setResettingUser(u)
    setResetPasswordValue('')
    setResetConfirmValue('')
    setResetError('')
  }

  const handleConfirmReset = async () => {

    if (!resettingUser) return

    setResetError('')

    if (!resetPasswordValue || !resetConfirmValue) {
      setResetError('Both password fields are required.')
      return
    }

    if (resetPasswordValue.length < 8) {
      setResetError('Password must be at least 8 characters.')
      return
    }

    if (resetPasswordValue !== resetConfirmValue) {
      setResetError('Passwords do not match.')
      return
    }

    setResetting(true)

    try {

      await axios.post(
        `https://medai-ghana-backend.onrender.com/api/users/${resettingUser.user_id}/reset-password`,
        { newPassword: resetPasswordValue },
        { headers }
      )

      setResettingUser(null)

    } catch (err: any) {

      setResetError(err.response?.data?.message || 'Failed to reset password.')

    } finally {

      setResetting(false)

    }

  }

  const handleToggleStatus = async (u: StaffUser) => {

    const action = u.is_active ? 'deactivate' : 'activate'

    const confirmed = window.confirm(`Are you sure you want to ${action} ${u.first_name} ${u.last_name}?`)

    if (!confirmed) return

    try {

      await axios.patch(
        `https://medai-ghana-backend.onrender.com/api/users/${u.user_id}/status`,
        { isActive: !u.is_active },
        { headers }
      )

      loadUsers()

    } catch (err: any) {

      alert(err.response?.data?.message || `Failed to ${action} user.`)

    }

  }

  const filtered = users.filter(u =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout current="user-management" onNavigate={onNavigate} title="User Management">

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-700 text-[#0F172A] mb-5">Create New User</h3>

            {createError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-700">{createError}</p>
              </div>
            )}

            {/* Hidden dummy fields to absorb browser autofill before the real fields */}
            <input type="text" name="fake-username" autoComplete="username" className="hidden" />
            <input type="password" name="fake-password" autoComplete="new-password" className="hidden" />

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">First Name *</label>
                  <input autoComplete="off" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Kofi" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Last Name *</label>
                  <input autoComplete="off" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Mensah" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Username *</label>
                <input autoComplete="off" value={username} onChange={e => setUsername(e.target.value)} placeholder="kofi.mensah" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Email *</label>
                <input type="email" autoComplete="off" value={email} onChange={e => setEmail(e.target.value)} placeholder="kofi.mensah@ghanahealthservice.org" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Phone</label>
                <input autoComplete="off" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} placeholder="+233 24 000 0000" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Temporary Password *</label>
                <input type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Confirm Password *</label>
                <input type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Role *</label>
                  <select value={roleId} onChange={e => setRoleId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] bg-slate-50 outline-none focus:border-[#0F766E] transition-all">
                    {ROLE_OPTIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Facility</label>
                  <select value={facilityId} onChange={e => setFacilityId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] bg-slate-50 outline-none focus:border-[#0F766E] transition-all">
                    <option value="">Unassigned</option>
                    {facilities.map(f => <option key={f.facility_id} value={f.facility_id}>{f.facility_name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCreateModal(false); resetCreateForm() }} className="flex-1 border border-slate-200 text-sm font-semibold py-2.5 rounded-xl text-[#64748B] hover:border-slate-300 transition-all">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="flex-1 bg-[#0F766E] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#0D5F58] transition-all disabled:opacity-50">
                {creating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-700 text-[#0F172A] mb-5">Edit User</h3>

            {editError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-700">{editError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">First Name *</label>
                  <input autoComplete="off" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Last Name *</label>
                  <input autoComplete="off" value={editLastName} onChange={e => setEditLastName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Email (locked)</label>
                <input value={editingUser.email} readOnly className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-400 bg-slate-100 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Phone</label>
                <input autoComplete="off" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+233 24 000 0000" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Role *</label>
                  <select value={editRoleId} onChange={e => setEditRoleId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] bg-slate-50 outline-none focus:border-[#0F766E] transition-all">
                    {ROLE_OPTIONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Facility</label>
                  <select value={editFacilityId} onChange={e => setEditFacilityId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-[#0F172A] bg-slate-50 outline-none focus:border-[#0F766E] transition-all">
                    <option value="">Unassigned</option>
                    {facilities.map(f => <option key={f.facility_id} value={f.facility_id}>{f.facility_name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="flex-1 border border-slate-200 text-sm font-semibold py-2.5 rounded-xl text-[#64748B] hover:border-slate-300 transition-all">Cancel</button>
              <button onClick={handleSaveEdit} disabled={savingEdit} className="flex-1 bg-[#0F766E] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#0D5F58] transition-all disabled:opacity-50">
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setResettingUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-full max-w-md mx-4">
            <h3 className="font-display font-700 text-[#0F172A] mb-1">Reset Password</h3>
            <p className="text-xs text-[#64748B] mb-5">Setting a new temporary password for {resettingUser.first_name} {resettingUser.last_name}.</p>

            {resetError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-700">{resetError}</p>
              </div>
            )}

            {/* Hidden dummy field to absorb browser autofill */}
            <input type="password" name="fake-password" autoComplete="new-password" className="hidden" />

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">New Password *</label>
                <input type="password" autoComplete="new-password" value={resetPasswordValue} onChange={e => setResetPasswordValue(e.target.value)} placeholder="Min. 8 characters" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Confirm New Password *</label>
                <input type="password" autoComplete="new-password" value={resetConfirmValue} onChange={e => setResetConfirmValue(e.target.value)} placeholder="Re-enter password" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 bg-slate-50 outline-none focus:border-[#0F766E] transition-all" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setResettingUser(null)} className="flex-1 border border-slate-200 text-sm font-semibold py-2.5 rounded-xl text-[#64748B] hover:border-slate-300 transition-all">Cancel</button>
              <button onClick={handleConfirmReset} disabled={resetting} className="flex-1 bg-[#0F766E] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#0D5F58] transition-all disabled:opacity-50">
                {resetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {connectionError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <WifiOff size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">Connection failed.</span> Couldn't reach the server — existing users may still exist and simply couldn't be loaded. Check that the backend and database are running, then refresh.
          </p>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-48 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
          <Search size={15} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#0F172A] placeholder:text-slate-400 outline-none"
          />
        </div>
        <button onClick={() => setShowCreateModal(true)} className="bg-[#0F766E] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#0D5F58] transition-colors flex items-center gap-2">
          <Plus size={15} /> Create User
        </button>
      </div>

      {/* Roles summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Staff', value: users.length, color: '#0F766E', bg: '#F0FDF9' },
          { label: 'Clinical Staff', value: users.filter(u => [3, 4, 5, 6].includes(u.role_id)).length, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Administrators', value: users.filter(u => [1, 2].includes(u.role_id)).length, color: '#8B5CF6', bg: '#F5F3FF' },
          { label: 'Active', value: users.filter(u => u.is_active === 1).length, color: '#22C55E', bg: '#F0FDF4' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 border border-slate-100 shadow-sm" style={{ background: s.bg }}>
            <p className="font-display font-800 text-2xl mb-0.5" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs font-medium text-[#64748B]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center text-sm text-[#64748B] py-12">Loading users...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            {connectionError ? (
              <div className="flex flex-col items-center gap-3">
                <WifiOff size={24} className="text-red-400" />
                <p className="text-sm text-red-600 font-medium">Unable to load users — connection failed.</p>
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">
                {users.length === 0 ? 'No users found.' : 'No users match your search.'}
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['User', 'Role', 'Facility', 'Status', 'Last Login', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-[#64748B] px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u.user_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] text-[10px] font-bold flex-shrink-0">
                          {u.first_name[0]}{u.last_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#0F172A]">{u.first_name} {u.last_name}</p>
                          <p className="text-xs text-[#64748B]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${ROLE_COLORS[u.role_name] ?? 'bg-slate-100 text-slate-600'}`}>{u.role_name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{u.facility_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-slate-300'}`} />
                        <span className="text-sm text-[#64748B]">{u.is_active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(u)} title="Edit User" className="p-1.5 hover:bg-[#0F766E]/10 rounded-lg text-[#0F766E] transition-colors"><Edit size={14} /></button>
                        <button onClick={() => openResetPassword(u)} title="Reset Password" className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 transition-colors"><KeyRound size={14} /></button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.is_active ? 'Deactivate User' : 'Activate User'}
                          className={`p-1.5 rounded-lg transition-colors ${u.is_active ? 'hover:bg-red-50 text-red-500' : 'hover:bg-green-50 text-green-600'}`}
                        >
                          {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-[#64748B]">Showing {filtered.length} of {users.length} users</p>
        </div>
      </div>
    </DashboardLayout>
  )
}