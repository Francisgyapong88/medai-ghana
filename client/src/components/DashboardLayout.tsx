import { useState } from 'react'
import { Bell, Search, Menu } from 'lucide-react'
import Sidebar from './Sidebar'

type Page =
  | 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration'
  | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile'
  | 'user-management' | 'settings'

interface DashboardLayoutProps {
  current: Page
  onNavigate: (page: Page) => void
  children: React.ReactNode
  title?: string
}

export default function DashboardLayout({ current, onNavigate, children, title }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = storedUser.firstName
    ? `${storedUser.firstName[0] ?? ''}${storedUser.lastName?.[0] ?? ''}`
    : '?'

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar */}
      <div className={`hidden md:flex flex-col h-full flex-shrink-0`}>
        <Sidebar
          current={current}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar current={current} onNavigate={(p) => { onNavigate(p); setMobileOpen(false) }} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <button className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => setMobileOpen(true)}>
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex-1">
            {title && <h1 className="font-display font-700 text-lg text-[#0F172A]">{title}</h1>}
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 w-52">
            <Search size={15} className="text-slate-400 flex-shrink-0" />
            <input type="text" placeholder="Search..." className="bg-transparent text-sm text-slate-600 placeholder:text-slate-400 outline-none w-full" />
          </div>
         <div className="relative">
            <button title="Notifications (coming soon)" className="relative w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
              <Bell size={16} className="text-slate-600" />
            </button>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0F766E] flex items-center justify-center text-xs font-bold text-white cursor-pointer" onClick={() => onNavigate('profile')}>
            {initials}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}