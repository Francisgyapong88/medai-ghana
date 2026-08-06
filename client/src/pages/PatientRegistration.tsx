import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, User, Heart, Phone } from 'lucide-react'
import axios from 'axios'
import DashboardLayout from '../components/DashboardLayout'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface PatientRegistrationProps {
  onNavigate: (page: Page) => void
}

const steps = [
  { id: 1, label: 'Personal Information', icon: User },
  { id: 2, label: 'Medical Details', icon: Heart },
  { id: 3, label: 'Emergency Contact', icon: Phone },
]

const genderOptions = [
  { id: 1, label: 'Male' },
  { id: 2, label: 'Female' },
  { id: 3, label: 'Other' },
]

const bloodGroupOptions = [
  { id: 1, label: 'A+' }, { id: 2, label: 'A-' },
  { id: 3, label: 'B+' }, { id: 4, label: 'B-' },
  { id: 5, label: 'AB+' }, { id: 6, label: 'AB-' },
  { id: 7, label: 'O+' }, { id: 8, label: 'O-' },
]

const maritalStatusOptions = [
  { id: 1, label: 'Single' }, { id: 2, label: 'Married' },
  { id: 3, label: 'Divorced' }, { id: 4, label: 'Widowed' },
  { id: 5, label: 'Separated' },
]

const regionOptions = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Northern', 'Volta',
  'Central', 'Bono', 'Bono East', 'Ahafo', 'Upper East', 'Upper West',
  'Savannah', 'North East', 'Oti', 'Western North',
]

const relationshipOptions = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other']

const initialForm = {
  first_name: '',
  last_name: '',
  other_names: '',
  date_of_birth: '',
  gender_id: '',
  phone_number: '',
  national_id: '',
  nhis_number: '',
  region: '',
  city: '',
  address: '',
  blood_group_id: '',
  marital_status_id: '',
  occupation: '',
  emergency_contact_name: '',
  emergency_contact_relationship: '',
  emergency_contact_phone: '',
}

export default function PatientRegistration({ onNavigate }: PatientRegistrationProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const update = (field: keyof typeof initialForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = async () => {

    setError('')

    if (step === 1) {
      if (!form.first_name || !form.last_name || !form.date_of_birth || !form.gender_id) {
        setError('First name, last name, date of birth, and gender are required.')
        return
      }
      setStep(2)
      return
    }

    if (step === 2) {
      setStep(3)
      return
    }

    // Step 3: actual submission
    setSubmitting(true)

    try {

      const token = localStorage.getItem('medai_token')

      await axios.post('https://medai-ghana-backend.onrender.com/api/patients', {
        first_name: form.first_name,
        last_name: form.last_name,
        other_names: form.other_names || null,
        date_of_birth: form.date_of_birth,
        gender_id: Number(form.gender_id),
        phone_number: form.phone_number || null,
        national_id: form.national_id || null,
        nhis_number: form.nhis_number || null,
        region: form.region || null,
        city: form.city || null,
        address: form.address || null,
        blood_group_id: form.blood_group_id ? Number(form.blood_group_id) : null,
        marital_status_id: form.marital_status_id ? Number(form.marital_status_id) : null,
        occupation: form.occupation || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_relationship: form.emergency_contact_relationship || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSubmitted(true)

      setTimeout(() => onNavigate('patients'), 2000)

    } catch (err: any) {

      setError(err.response?.data?.message || 'Failed to register patient. Please check the form and try again.')

    } finally {

      setSubmitting(false)

    }

  }

  if (submitted) {
    return (
      <DashboardLayout current="patients" onNavigate={onNavigate} title="Patient Registration">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={36} className="text-green-600" />
            </div>
            <h2 className="font-display font-800 text-2xl text-[#0F172A] mb-2">Patient Registered!</h2>
            <p className="text-[#64748B]">Redirecting to patient list...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout current="patient-registration" onNavigate={onNavigate} title="Register Patient">
      <div className="max-w-2xl mx-auto">
        {/* Progress steps */}
        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${step > s.id ? 'bg-[#0F766E] text-white' : step === s.id ? 'bg-[#0F766E] text-white shadow-lg shadow-[#0F766E]/30' : 'bg-slate-200 text-slate-500'}`}
                >
                  {step > s.id ? <Check size={16} /> : <s.icon size={16} />}
                </div>
                <p className={`text-[10px] font-semibold mt-1.5 text-center leading-tight max-w-16 ${step === s.id ? 'text-[#0F766E]' : 'text-slate-400'}`}>{s.label}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-6 transition-all ${step > s.id ? 'bg-[#0F766E]' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display font-700 text-lg text-[#0F172A] mb-6">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">First Name *</label>
                  <input value={form.first_name} onChange={e => update('first_name', e.target.value)} placeholder="Kofi" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Last Name *</label>
                  <input value={form.last_name} onChange={e => update('last_name', e.target.value)} placeholder="Mensah" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Other Names</label>
                  <input value={form.other_names} onChange={e => update('other_names', e.target.value)} placeholder="Optional" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Date of Birth *</label>
                  <input type="date" value={form.date_of_birth} onChange={e => update('date_of_birth', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Gender *</label>
                  <select value={form.gender_id} onChange={e => update('gender_id', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all">
                    <option value="">Select...</option>
                    {genderOptions.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Phone Number</label>
                  <input value={form.phone_number} onChange={e => update('phone_number', e.target.value)} placeholder="+233 24 000 0000" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">National ID</label>
                  <input value={form.national_id} onChange={e => update('national_id', e.target.value)} placeholder="GHA-000000000-0" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">NHIS Number</label>
                  <input value={form.nhis_number} onChange={e => update('nhis_number', e.target.value)} placeholder="Optional" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Region</label>
                  <select value={form.region} onChange={e => update('region', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all">
                    <option value="">Select...</option>
                    {regionOptions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">City / Town</label>
                  <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Enter city or town" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Address</label>
                <textarea rows={2} value={form.address} onChange={e => update('address', e.target.value)} placeholder="Patient's residential address" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all resize-none" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display font-700 text-lg text-[#0F172A] mb-6">Medical Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Blood Type</label>
                  <select value={form.blood_group_id} onChange={e => update('blood_group_id', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all">
                    <option value="">Unknown</option>
                    {bloodGroupOptions.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Marital Status</label>
                  <select value={form.marital_status_id} onChange={e => update('marital_status_id', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all">
                    <option value="">Select...</option>
                    {maritalStatusOptions.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Occupation</label>
                  <input value={form.occupation} onChange={e => update('occupation', e.target.value)} placeholder="e.g. Farmer, Teacher, Trader" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Allergies and detailed medical history can be added from the patient's profile in a future update.
              </p>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display font-700 text-lg text-[#0F172A] mb-6">Emergency Contact</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Contact Name</label>
                  <input value={form.emergency_contact_name} onChange={e => update('emergency_contact_name', e.target.value)} placeholder="Full name" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Relationship</label>
                  <select value={form.emergency_contact_relationship} onChange={e => update('emergency_contact_relationship', e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all">
                    <option value="">Select...</option>
                    {relationshipOptions.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">Phone Number</label>
                  <input value={form.emergency_contact_phone} onChange={e => update('emergency_contact_phone', e.target.value)} placeholder="+233 24 000 0000" className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition-all" />
                </div>
              </div>
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs text-amber-800 font-medium">Please confirm that all patient information is accurate. This data will be used for clinical decision support only and stored securely in compliance with Ghana Health Service data governance policies.</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : onNavigate('patients')}
              disabled={submitting}
              className="flex items-center gap-2 text-sm font-semibold text-[#64748B] hover:text-[#0F172A] border border-slate-200 px-5 py-2.5 rounded-xl hover:border-slate-300 transition-all disabled:opacity-50"
            >
              <ChevronLeft size={15} /> {step > 1 ? 'Previous' : 'Cancel'}
            </button>
            <button
              onClick={handleNext}
              disabled={submitting}
              className="flex items-center gap-2 bg-[#0F766E] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#0D5F58] transition-all hover:shadow-lg hover:shadow-[#0F766E]/25 disabled:opacity-70"
            >
              {submitting ? 'Submitting...' : step < 3 ? <><span>Next</span> <ChevronRight size={15} /></> : <><Check size={15} /> Submit</>}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}