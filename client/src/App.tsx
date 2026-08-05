import { useState } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import PatientRegistration from './pages/PatientRegistration'
import Assessment from './pages/Assessment'
import Prediction from './pages/Prediction'
import History from './pages/History'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import UserManagement from './pages/UserManagement'
import Settings from './pages/Settings'

type Page =
  | 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration'
  | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile'
  | 'user-management' | 'settings'

export default function App() {
  const hasToken = !!localStorage.getItem('medai_token')
  const [page, setPage] = useState<Page>(hasToken ? 'dashboard' : 'landing')
  const [navData, setNavData] = useState<any>(null)

  const navigate = (p: Page, data?: any) => {
    setNavData(data ?? null)
    setPage(p)
  }

  switch (page) {
    case 'landing': return <Landing onNavigate={navigate} />
    case 'login': return <Login onNavigate={navigate} />
    case 'dashboard': return <Dashboard onNavigate={navigate} />
    case 'patients': return <Patients onNavigate={navigate} />
    case 'patient-registration': return <PatientRegistration onNavigate={navigate} />
    case 'assessment': return <Assessment onNavigate={navigate} />
    case 'prediction': return <Prediction onNavigate={navigate} data={navData} />
    case 'history': return <History onNavigate={navigate} />
    case 'analytics': return <Analytics onNavigate={navigate} />
    case 'profile': return <Profile onNavigate={navigate} />
    case 'user-management': return <UserManagement onNavigate={navigate} />
    case 'settings': return <Settings onNavigate={navigate} />
    default: return <Landing onNavigate={navigate} />
  }
}