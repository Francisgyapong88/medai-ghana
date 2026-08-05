import {
  LayoutDashboard, Users, ClipboardList, Brain, History,
  BarChart2, UserCog, Settings, LogOut, Stethoscope, ChevronRight,
} from 'lucide-react'
import { isAdmin, canAccessClinicalFeatures } from '../utils/permissions'

type Page =
  | 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration'
  | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile'
  | 'user-management' | 'settings'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, requires: 'all' },
  { id: 'patients', label: 'Patients', icon: Users, requires: 'all' },
  { id: 'assessment', label: 'Assessment', icon: ClipboardList, requires: 'clinical' },
  { id: 'prediction', label: 'Prediction', icon: Brain, requires: 'clinical' },
  { id: 'history', label: 'History', icon: History, requires: 'clinical' },
  { id: 'analytics', label: 'Analytics', icon: BarChart2, requires: 'clinical' },
  { id: 'user-management', label: 'Users', icon: UserCog, requires: 'admin' },
  { id: 'settings', label: 'Settings', icon: Settings, requires: 'all' },
] as const

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

interface SidebarProps {
  current: Page
  onNavigate: (page: Page) => void
  collapsed?: boolean
  onToggle?: () => void
}

export default function Sidebar({ current, onNavigate, collapsed = false, onToggle }: SidebarProps) {

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = storedUser.firstName
    ? `${storedUser.firstName[0] ?? ''}${storedUser.lastName?.[0] ?? ''}`
    : '?'
  const fullName = storedUser.firstName ? `${storedUser.firstName} ${storedUser.lastName}` : 'Not signed in'
  const roleName = storedUser.roleId ? ROLE_NAMES[storedUser.roleId] ?? 'Staff' : ''

  const userIsAdmin = isAdmin()
  const userCanAccessClinical = canAccessClinicalFeatures()

  const canSeeNavItem = (requires: string) => {
    if (requires === 'admin') return userIsAdmin
    if (requires === 'clinical') return userCanAccessClinical
    return true
  }

  const handleLogout = () => {

    const confirmed = window.confirm('Are you sure you want to log out?')

    if (!confirmed) return

    localStorage.removeItem('medai_token')
    localStorage.removeItem('user')
    onNavigate('login')

  }

  return (
    <aside
      className="flex flex-col h-full bg-[#0F172A] text-white transition-all duration-200"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 bg-[#0F766E] rounded-xl flex items-center justify-center flex-shrink-0">
          <Stethoscope size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <p className="font-display font-700 text-sm leading-tight">MedAI Ghana</p>
            <p className="text-[10px] text-slate-400 font-medium">Clinical Decision Support</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems
          .filter(item => canSeeNavItem(item.requires))
          .map(({ id, label, icon: Icon }) => {
            const active = current === id
            return (
              <button
                key={id}
                onClick={() => onNavigate(id as Page)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 group
                  ${active
                    ? 'bg-[#0F766E] text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
                {!collapsed && active && <ChevronRight size={14} className="ml-auto" />}
              </button>
            )
          })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 py-3">
        <button
          onClick={() => onNavigate('profile')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all ${current === 'profile' ? 'bg-[#0F766E] text-white' : ''}`}
        >
          <div className="w-7 h-7 rounded-full bg-[#0F766E] flex items-center justify-center flex-shrink-0 text-xs font-bold text-white">
            {initials}
          </div>
          {!collapsed && (
            <div className="text-left">
              <p className="text-xs font-medium text-white">{fullName}</p>
              <p className="text-[10px] text-slate-500">{roleName}</p>
            </div>
          )}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
        {onToggle && (
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center px-4 py-2 text-slate-600 hover:text-slate-400 transition-all"
          >
            <ChevronRight size={14} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        )}
      </div>
    </aside>
  )
}