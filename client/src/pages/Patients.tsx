import { useEffect, useState } from 'react'
import { Search, Plus, Eye, Edit, Trash2, ChevronLeft, ChevronRight, X, Save, WifiOff } from 'lucide-react'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'
import { isAdmin, canAccessClinicalFeatures } from '../utils/permissions'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface PatientsProps {
  onNavigate: (page: Page) => void
}

interface Patient {
  patient_id: number
  patient_number: string
  first_name: string
  last_name: string
  phone_number: string | null
  email: string | null
  is_active: number
  age: number | null
  gender_name: string | null
  blood_type: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  emergency_contact_relationship?: string | null
}

interface AllergyOption {
  allergy_id: number
  allergy_name: string
  allergy_type: string
  severity_level: string
}

interface PatientAllergy {
  patient_allergy_id: number
  allergy_id: number
  allergy_name: string
  allergy_type: string
  severity_level: string
  reaction: string | null
  diagnosed_date: string | null
  notes: string | null
}

interface MedicalHistoryEntry {
  history_id: number
  condition_name: string
  diagnosis_date: string | null
  status: string | null
  notes: string | null
}

interface EditForm {
  first_name: string
  last_name: string
  other_names: string
  gender_id: string
  date_of_birth: string
  phone_number: string
  email: string
}

const severityColor: Record<string, string> = {
  High: 'bg-red-100 text-red-700',
  Moderate: 'bg-amber-100 text-amber-700',
  Low: 'bg-slate-100 text-slate-600',
}

const conditionStatusOptions = ['Ongoing', 'Resolved', 'Managed', 'Chronic']

const genderOptions = [
  { id: 1, label: 'Male' },
  { id: 2, label: 'Female' },
  { id: 3, label: 'Other' },
]

const emptyEditForm: EditForm = {
  first_name: '',
  last_name: '',
  other_names: '',
  gender_id: '',
  date_of_birth: '',
  phone_number: '',
  email: '',
}

export default function Patients({ onNavigate }: PatientsProps) {
  const userIsAdmin = isAdmin()
  const canViewClinicalDetail = canAccessClinicalFeatures()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [connectionError, setConnectionError] = useState(false)

  // Allergies
  const [allergyOptions, setAllergyOptions] = useState<AllergyOption[]>([])
  const [patientAllergies, setPatientAllergies] = useState<PatientAllergy[]>([])
  const [showAddAllergy, setShowAddAllergy] = useState(false)
  const [newAllergyId, setNewAllergyId] = useState('')
  const [newAllergyReaction, setNewAllergyReaction] = useState('')
  const [savingAllergy, setSavingAllergy] = useState(false)

  // Medical History
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEntry[]>([])
  const [showAddCondition, setShowAddCondition] = useState(false)
  const [newConditionName, setNewConditionName] = useState('')
  const [newConditionStatus, setNewConditionStatus] = useState('Ongoing')
  const [newConditionNotes, setNewConditionNotes] = useState('')
  const [savingCondition, setSavingCondition] = useState(false)

  // Edit
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>(emptyEditForm)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')

  const token = localStorage.getItem('medai_token')
  const headers = { Authorization: `Bearer ${token}` }

  const loadPatients = () => {
    setLoading(true)
    axios.get('https://medai-ghana-backend.onrender.com//api/patients', { headers })
      .then(res => {
        setPatients(res.data.data)
        setConnectionError(false)
      })
      .catch(err => {
        console.error('Failed to load patients:', err)
        setConnectionError(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatientDetails = (patientId: number) => {

    axios.get('https://medai-ghana-backend.onrender.com//api/allergies/options', { headers })
      .then(res => setAllergyOptions(res.data.data))
      .catch(err => console.error('Failed to load allergy options:', err))

    axios.get(`https://medai-ghana-backend.onrender.com//api/allergies/patient/${patientId}`, { headers })
      .then(res => setPatientAllergies(res.data.data))
      .catch(err => console.error('Failed to load patient allergies:', err))

    axios.get(`https://medai-ghana-backend.onrender.com//api/medical-history/patient/${patientId}`, { headers })
      .then(res => setMedicalHistory(res.data.data))
      .catch(err => console.error('Failed to load medical history:', err))

  }

  const openPatient = async (patient: Patient) => {
    setShowAddAllergy(false)
    setShowAddCondition(false)
    setIsEditing(false)

    try {

      const res = await axios.get(`https://medai-ghana-backend.onrender.com//api/patients/${patient.patient_id}`, { headers })
      const full = res.data.data

      setSelectedPatient({
        ...patient,
        emergency_contact_name: full.emergency_contact_name,
        emergency_contact_phone: full.emergency_contact_phone,
        emergency_contact_relationship: full.emergency_contact_relationship,
      })

    } catch (err) {

      console.error('Failed to load full patient detail:', err)
      setSelectedPatient(patient)

    }

    loadPatientDetails(patient.patient_id)
  }

  const startEdit = async (patient: Patient) => {

    setSelectedPatient(patient)
    setShowAddAllergy(false)
    setShowAddCondition(false)
    setEditError('')
    loadPatientDetails(patient.patient_id)

    try {

      const res = await axios.get(`https://medai-ghana-backend.onrender.com//api/patients/${patient.patient_id}`, { headers })
      const full = res.data.data

      setEditForm({
        first_name: full.first_name ?? '',
        last_name: full.last_name ?? '',
        other_names: full.other_names ?? '',
        gender_id: full.gender_id ? String(full.gender_id) : '',
        date_of_birth: full.date_of_birth ? full.date_of_birth.split('T')[0] : '',
        phone_number: full.phone_number ?? '',
        email: full.email ?? '',
      })

      setIsEditing(true)

    } catch (err) {

      console.error('Failed to load patient for editing:', err)

    }

  }

  const handleSaveEdit = async () => {

    if (!selectedPatient) return

    setEditError('')

    if (!editForm.first_name || !editForm.last_name || !editForm.date_of_birth || !editForm.gender_id) {
      setEditError('First name, last name, date of birth, and gender are required.')
      return
    }

    setSavingEdit(true)

    try {

      await axios.put(
        `https://medai-ghana-backend.onrender.com//api/patients/${selectedPatient.patient_id}`,
        {
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          other_names: editForm.other_names || null,
          gender_id: Number(editForm.gender_id),
          date_of_birth: editForm.date_of_birth,
          phone_number: editForm.phone_number || null,
          email: editForm.email || null,
        },
        { headers }
      )

      setIsEditing(false)
      loadPatients()

      // refresh the currently viewed patient's summary card with the new values
      setSelectedPatient(prev => prev ? {
        ...prev,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone_number: editForm.phone_number || null,
        email: editForm.email || null,
        gender_name: genderOptions.find(g => String(g.id) === editForm.gender_id)?.label ?? prev.gender_name,
      } : prev)

    } catch (err: any) {

      setEditError(err.response?.data?.message || 'Failed to update patient.')

    } finally {

      setSavingEdit(false)

    }

  }

  const handleDelete = async (patient: Patient) => {

    const confirmed = window.confirm(`Are you sure you want to delete ${patient.first_name} ${patient.last_name}? This can only be undone by a database administrator.`)

    if (!confirmed) return

    try {

      await axios.delete(`https://medai-ghana-backend.onrender.com//api/patients/${patient.patient_id}`, { headers })

      loadPatients()

      if (selectedPatient?.patient_id === patient.patient_id) {
        setSelectedPatient(null)
      }

    } catch (err) {

      console.error('Failed to delete patient:', err)
      alert('Failed to delete patient. Please try again.')

    }

  }

  const handleAddAllergy = async () => {

    if (!selectedPatient || !newAllergyId) return

    setSavingAllergy(true)

    try {

      await axios.post(
        `https://medai-ghana-backend.onrender.com//api/allergies/patient/${selectedPatient.patient_id}`,
        {
          allergy_id: Number(newAllergyId),
          reaction: newAllergyReaction || null,
        },
        { headers }
      )

      setNewAllergyId('')
      setNewAllergyReaction('')
      setShowAddAllergy(false)

      loadPatientDetails(selectedPatient.patient_id)

    } catch (err) {

      console.error('Failed to add allergy:', err)

    } finally {

      setSavingAllergy(false)

    }

  }

  const handleAddCondition = async () => {

    if (!selectedPatient || !newConditionName.trim()) return

    setSavingCondition(true)

    try {

      await axios.post(
        `https://medai-ghana-backend.onrender.com//api/medical-history/patient/${selectedPatient.patient_id}`,
        {
          condition_name: newConditionName,
          status: newConditionStatus,
          notes: newConditionNotes || null,
        },
        { headers }
      )

      setNewConditionName('')
      setNewConditionStatus('Ongoing')
      setNewConditionNotes('')
      setShowAddCondition(false)

      loadPatientDetails(selectedPatient.patient_id)

    } catch (err) {

      console.error('Failed to add condition:', err)

    } finally {

      setSavingCondition(false)

    }

  }

  const filtered = patients.filter(p => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase()
    const matchSearch = fullName.includes(search.toLowerCase()) || p.patient_number.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Active' && p.is_active === 1) ||
      (filterStatus === 'Inactive' && p.is_active === 0)
    return matchSearch && matchStatus
  })

  if (selectedPatient) {
    return (
      <DashboardLayout current="patients" onNavigate={onNavigate} title="Patient Profile">
        <button onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 text-sm text-[#0F766E] font-semibold mb-6 hover:underline">
          <ChevronLeft size={16} /> Back to Patients
        </button>
        <div className="grid lg:grid-cols-3 gap-6">

          {isEditing ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-700 text-[#0F172A]">Edit Patient</h3>
                <button onClick={() => setIsEditing(false)} title="Cancel" className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>

              {editError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-2.5">
                  <p className="text-xs text-red-700">{editError}</p>
                </div>
              )}

              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">First Name *</label>
                  <input value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none focus:border-[#0F766E]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Last Name *</label>
                  <input value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none focus:border-[#0F766E]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Other Names</label>
                  <input value={editForm.other_names} onChange={e => setEditForm({ ...editForm, other_names: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none focus:border-[#0F766E]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Date of Birth *</label>
                  <input type="date" value={editForm.date_of_birth} onChange={e => setEditForm({ ...editForm, date_of_birth: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none focus:border-[#0F766E]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Gender *</label>
                  <select value={editForm.gender_id} onChange={e => setEditForm({ ...editForm, gender_id: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none focus:border-[#0F766E]">
                    <option value="">Select...</option>
                    {genderOptions.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Phone Number</label>
                  <input value={editForm.phone_number} onChange={e => setEditForm({ ...editForm, phone_number: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none focus:border-[#0F766E]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">Email</label>
                  <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 outline-none focus:border-[#0F766E]" />
                </div>
              </div>

              <button
                onClick={handleSaveEdit}
                disabled={savingEdit}
                title="Save Changes"
                className="w-full mt-5 bg-[#0F766E] text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-[#0D5F58] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={14} /> {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>

              <p className="text-xs text-slate-400 mt-3">
                Blood type, marital status, and other extended fields can only be set during registration for now.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center h-fit">
              <div className="w-20 h-20 rounded-2xl bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] text-2xl font-bold mx-auto mb-4">
                {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
              </div>
              <h2 className="font-display font-800 text-lg text-[#0F172A] mb-1">{selectedPatient.first_name} {selectedPatient.last_name}</h2>
              <p className="text-sm text-[#64748B] mb-3">{selectedPatient.patient_number}</p>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${selectedPatient.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                {selectedPatient.is_active ? 'Active' : 'Inactive'}
              </span>
              <div className="mt-6 space-y-3 text-left">
                {[
                  { label: 'Age', value: selectedPatient.age != null ? `${selectedPatient.age} years` : '—' },
                  { label: 'Gender', value: selectedPatient.gender_name ?? '—' },
                  { label: 'Phone', value: selectedPatient.phone_number ?? '—' },
                  { label: 'Email', value: selectedPatient.email ?? '—' },
                  { label: 'Blood Type', value: selectedPatient.blood_type ?? 'Not recorded' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-[#64748B]">{label}</span>
                    <span className="font-medium text-[#0F172A]">{value}</span>
                  </div>
                ))}
              </div>

              {(selectedPatient.emergency_contact_name || selectedPatient.emergency_contact_phone) && (
                <div className="mt-6 pt-6 border-t border-slate-100 text-left">
                  <p className="text-xs font-semibold text-[#0F172A] mb-3">Emergency Contact</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Name', value: selectedPatient.emergency_contact_name ?? '—' },
                      { label: 'Relationship', value: selectedPatient.emergency_contact_relationship ?? '—' },
                      { label: 'Phone', value: selectedPatient.emergency_contact_phone ?? '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm">
                        <span className="text-[#64748B]">{label}</span>
                        <span className="font-medium text-[#0F172A]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <button onClick={() => onNavigate('assessment')} title="Start New Assessment" className="flex-1 bg-[#0F766E] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#0D5F58] transition-colors">
                  New Assessment
                </button>
                <button onClick={() => startEdit(selectedPatient)} title="Edit Patient" className="flex-1 border border-slate-200 text-[#64748B] text-xs font-semibold py-2 rounded-lg hover:border-[#0F766E] hover:text-[#0F766E] transition-colors">
                  Edit
                </button>
              </div>
              {userIsAdmin && (
                <button
                  onClick={() => handleDelete(selectedPatient)}
                  title="Delete Patient"
                  className="w-full mt-2 border border-red-200 text-red-500 text-xs font-semibold py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={12} /> Delete Patient
                </button>
              )}
            </div>
          )}

          <div className="lg:col-span-2 space-y-4">

            {/* Allergies */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-700 text-[#0F172A]">Allergies</h3>
                <button
                  onClick={() => setShowAddAllergy(!showAddAllergy)}
                  title={showAddAllergy ? 'Cancel' : 'Add Allergy'}
                  className="text-xs font-semibold text-[#0F766E] flex items-center gap-1 hover:underline"
                >
                  {showAddAllergy ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Allergy</>}
                </button>
              </div>

              {showAddAllergy && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Allergy</label>
                    <select
                      value={newAllergyId}
                      onChange={e => setNewAllergyId(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#0F766E]"
                    >
                      <option value="">Select an allergy...</option>
                      {allergyOptions.map(a => (
                        <option key={a.allergy_id} value={a.allergy_id}>
                          {a.allergy_name} ({a.allergy_type}, {a.severity_level})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Reaction (optional)</label>
                    <input
                      value={newAllergyReaction}
                      onChange={e => setNewAllergyReaction(e.target.value)}
                      placeholder="e.g. Skin rash, swelling"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <button
                    onClick={handleAddAllergy}
                    disabled={!newAllergyId || savingAllergy}
                    title="Save Allergy"
                    className="bg-[#0F766E] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#0D5F58] transition-colors disabled:opacity-50"
                  >
                    {savingAllergy ? 'Saving...' : 'Save Allergy'}
                  </button>
                </div>
              )}

              {patientAllergies.length === 0 ? (
                <p className="text-sm text-[#64748B]">No allergies recorded.</p>
              ) : (
                <div className="space-y-3">
                  {patientAllergies.map(a => (
                    <div key={a.patient_allergy_id} className="flex items-start justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[#0F172A]">{a.allergy_name}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${severityColor[a.severity_level] ?? 'bg-slate-100 text-slate-600'}`}>
                            {a.severity_level}
                          </span>
                        </div>
                        {a.reaction && <p className="text-xs text-[#64748B]">Reaction: {a.reaction}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medical History */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-700 text-[#0F172A]">Medical History</h3>
                <button
                  onClick={() => setShowAddCondition(!showAddCondition)}
                  title={showAddCondition ? 'Cancel' : 'Add Condition'}
                  className="text-xs font-semibold text-[#0F766E] flex items-center gap-1 hover:underline"
                >
                  {showAddCondition ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Add Condition</>}
                </button>
              </div>

              {showAddCondition && (
                <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Condition Name</label>
                    <input
                      value={newConditionName}
                      onChange={e => setNewConditionName(e.target.value)}
                      placeholder="e.g. Hypertension"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#0F766E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Status</label>
                    <select
                      value={newConditionStatus}
                      onChange={e => setNewConditionStatus(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#0F766E]"
                    >
                      {conditionStatusOptions.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Notes (optional)</label>
                    <textarea
                      rows={2}
                      value={newConditionNotes}
                      onChange={e => setNewConditionNotes(e.target.value)}
                      placeholder="Additional details..."
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white outline-none focus:border-[#0F766E] resize-none"
                    />
                  </div>
                  <button
                    onClick={handleAddCondition}
                    disabled={!newConditionName.trim() || savingCondition}
                    title="Save Condition"
                    className="bg-[#0F766E] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#0D5F58] transition-colors disabled:opacity-50"
                  >
                    {savingCondition ? 'Saving...' : 'Save Condition'}
                  </button>
                </div>
              )}

              {medicalHistory.length === 0 ? (
                <p className="text-sm text-[#64748B]">No conditions recorded.</p>
              ) : (
                <div className="space-y-3">
                  {medicalHistory.map(m => (
                    <div key={m.history_id} className="flex items-start justify-between border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-[#0F172A]">{m.condition_name}</span>
                          {m.status && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF9] text-[#0F766E]">{m.status}</span>}
                        </div>
                        {m.notes && <p className="text-xs text-[#64748B]">{m.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assessment History (still placeholder) */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-display font-700 text-[#0F172A] mb-4">Assessment History</h3>
              <p className="text-sm text-[#64748B]">
                Per-patient assessment history is coming in a future update.
                In the meantime, check the <button onClick={() => onNavigate('history')} className="text-[#0F766E] font-semibold hover:underline">History</button> page for all recent assessments.
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout current="patients" onNavigate={onNavigate} title="Patient Management">

      {connectionError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <WifiOff size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">Connection failed.</span> Couldn't reach the server — existing patients may still exist and simply couldn't be loaded. Check that the backend and database are running, then refresh.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-sm text-slate-500">Total Patients</p>
          <h2 className="text-4xl font-bold mt-2 text-[#0F172A]">{patients.length}</h2>
          <p className="text-green-600 text-sm mt-3">Registered in system</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <p className="text-sm text-slate-500">Active Patients</p>
          <h2 className="text-4xl font-bold mt-2 text-[#0F766E]">{patients.filter(p => p.is_active === 1).length}</h2>
          <p className="text-sm mt-3 text-slate-500">Currently in the system</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="flex-1 flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search by Patient Number, Name or Phone Number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm"
              />
            </div>
          </div>
          <button
            onClick={() => onNavigate("patient-registration")}
            title="Register New Patient"
            className="bg-[#0F766E] hover:bg-[#0D5F58] text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Register Patient
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mt-5">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-3"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <button
            onClick={() => { setSearch(''); setFilterStatus('All') }}
            title="Reset Filters"
            className="border border-slate-200 rounded-xl hover:border-[#0F766E] text-[#0F766E] font-semibold"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center text-sm text-[#64748B] py-12">Loading patients...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            {connectionError ? (
              <div className="flex flex-col items-center gap-3">
                <WifiOff size={24} className="text-red-400" />
                <p className="text-sm text-red-600 font-medium">Unable to load patients — connection failed.</p>
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">
                {patients.length === 0 ? 'No patients registered yet.' : 'No patients match your filters.'}
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Patient ID', 'Patient', 'Age', 'Gender', 'Phone', 'Blood Type', 'Status', 'Actions'].map(h => (
                    <th
                      key={h}
                      className={`text-left text-xs font-semibold text-[#64748B] px-4 py-3 whitespace-nowrap
                        ${h === "Phone" ? "min-w-[170px]" : h === "Patient ID" ? "min-w-[120px]" : ""}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(p => (
                  <tr key={p.patient_id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 text-xs font-mono text-[#0F766E] font-semibold whitespace-nowrap min-w-[120px]">
                      {p.patient_number}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] text-[10px] font-bold">
                          {p.first_name[0]}{p.last_name[0]}
                        </div>
                        <span className="text-sm font-medium text-[#0F172A]">{p.first_name} {p.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{p.age ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{p.gender_name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B] whitespace-nowrap min-w-[170px]">{p.phone_number ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-[#64748B]">{p.blood_type ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canViewClinicalDetail && (
                          <>
                            <button onClick={() => openPatient(p)} title="View Patient" className="p-1.5 hover:bg-[#0F766E]/10 rounded-lg transition-colors text-[#0F766E]"><Eye size={14} /></button>
                            <button onClick={() => startEdit(p)} title="Edit Patient" className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"><Edit size={14} /></button>
                          </>
                        )}
                        {userIsAdmin && (
                          <button onClick={() => handleDelete(p)} title="Delete Patient" className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500"><Trash2 size={14} /></button>
                        )}
                        {!canViewClinicalDetail && !userIsAdmin && (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-[#64748B]">Showing {filtered.length} of {patients.length} patients</p>
        </div>
      </div>
    </DashboardLayout>
  )
}