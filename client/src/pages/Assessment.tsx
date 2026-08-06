import { useEffect, useState } from 'react'
import axios from 'axios'
import { RotateCcw, Brain } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface AssessmentProps {
  onNavigate: (page: Page, data?: any) => void
}

interface Patient {
  patient_id: number
  patient_number: string
  first_name: string
  last_name: string
  age: number | null
  gender_name: string | null
}

const symptomGroups = {
  'General Symptoms': ['Fever', 'Chills', 'Headache', 'Fatigue', 'Night Sweats', 'Loss of Appetite', 'Body Weakness', 'Muscle Pain'],
  'Respiratory Symptoms': ['Cough', 'Phlegm', 'Difficulty Breathing', 'Chest Pain', 'Sore Throat', 'Runny Nose'],
  'Gastrointestinal Symptoms': ['Abdominal Pain', 'Diarrhoea', 'Constipation', 'Nausea', 'Vomiting'],
  'Endocrine Symptoms': ['Frequent Urination', 'Excessive Thirst', 'Excessive Hunger', 'Weight Loss', 'Blurred Vision'],
  'Other Symptoms': ['Joint Pain'],
}

const API_URL = "https://medai-ghana-backend.onrender.com/api"

export default function Assessment({ onNavigate }: AssessmentProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [riskFactors, setRiskFactors] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  // Vitals - matching the real assessments table columns
  const [temperature, setTemperature] = useState('')
  const [bloodPressure, setBloodPressure] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [respiratoryRate, setRespiratoryRate] = useState('')
  const [oxygenSaturation, setOxygenSaturation] = useState('')
  const [bloodSugar, setBloodSugar] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')

  // Notes - combined into one clinical_notes narrative on submit
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [historyOfIllness, setHistoryOfIllness] = useState('')
  const [generalAppearance, setGeneralAppearance] = useState('')
  const [respiratoryExam, setRespiratoryExam] = useState('')
  const [cardioExam, setCardioExam] = useState('')
  const [abdomenExam, setAbdomenExam] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')

  const token = localStorage.getItem('medai_token')
  const headers = { Authorization: `Bearer ${token}` }
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    axios.get(`${API_URL}/patients`, { headers })
      .then(res => setPatients(res.data.data))
      .catch(err => console.error('Failed to load patients:', err))
  }, [])

  const toggleSymptom = (s: string) => {
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  const toggleRiskFactor = (r: string) => {
    setRiskFactors(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])
  }

  const resetForm = () => {
    setSelectedSymptoms([])
    setRiskFactors([])
    setTemperature('')
    setBloodPressure('')
    setHeartRate('')
    setRespiratoryRate('')
    setOxygenSaturation('')
    setBloodSugar('')
    setWeight('')
    setHeight('')
    setChiefComplaint('')
    setHistoryOfIllness('')
    setGeneralAppearance('')
    setRespiratoryExam('')
    setCardioExam('')
    setAbdomenExam('')
    setAdditionalNotes('')
    setError('')
  }

  const handleRun = async () => {

    setError('')

    if (!selectedPatientId) {
      setError('Please select a patient.')
      return
    }

    if (!chiefComplaint.trim()) {
      setError('Chief complaint is required.')
      return
    }

    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom.')
      return
    }

    const patient = patients.find(p => p.patient_id === Number(selectedPatientId))

    try {

      setRunning(true)

      // Step 1: create the visit (the "encounter") behind the scenes,
      // using this facility's real defaults
      const visitResponse = await axios.post(
        `${API_URL}/visits`,
        {
          patient_id: Number(selectedPatientId),
          facility_id: 1,
          department_id: 1,
          visit_type_id: 1,
          visit_status_id: 2,
          visit_date: new Date().toISOString(),
          chief_complaint: chiefComplaint,
        },
        { headers }
      )

      const visitId = visitResponse.data.visitId

      // Step 2: combine the free-text sections into one clinical note
      const clinicalNotes = [
        `Chief Complaint: ${chiefComplaint}`,
        historyOfIllness && `History of Present Illness: ${historyOfIllness}`,
        (generalAppearance || respiratoryExam || cardioExam || abdomenExam) &&
          `Physical Examination:\n- General: ${generalAppearance || 'Not documented'}\n- Respiratory: ${respiratoryExam || 'Not documented'}\n- Cardiovascular: ${cardioExam || 'Not documented'}\n- Abdomen: ${abdomenExam || 'Not documented'}`,
        `Risk Factors: ${riskFactors.length > 0 ? riskFactors.join(', ') : 'None reported'}`,
        additionalNotes && `Additional Notes: ${additionalNotes}`,
      ].filter(Boolean).join('\n\n')

      // Step 3: create the assessment + run the AI prediction
      const assessmentResponse = await axios.post(
        `${API_URL}/assessments`,
        {
          visit_id: visitId,
          assessment_status_id: 3,
          symptoms: selectedSymptoms,
          temperature: temperature || null,
          blood_pressure: bloodPressure || null,
          blood_sugar: bloodSugar || null,
          heart_rate: heartRate || null,
          respiratory_rate: respiratoryRate || null,
          oxygen_saturation: oxygenSaturation || null,
          weight: weight || null,
          height: height || null,
          gender: patient?.gender_name || null,
          age: patient?.age || null,
          clinical_notes: clinicalNotes,
        },
        { headers }
      )

      setRunning(false)

      onNavigate('prediction', {
        ...assessmentResponse.data,
        patientName: patient ? `${patient.first_name} ${patient.last_name}` : '',
        patientNumber: patient?.patient_number ?? '',
        symptoms: selectedSymptoms,
      })

    } catch (err: any) {

      setRunning(false)
      setError(err.response?.data?.message || 'Assessment failed. Please check the form and try again.')

    }

  }

  return (
    <DashboardLayout current="assessment" onNavigate={onNavigate} title="AI Assessment Form">
      <div className="max-w-4xl mx-auto space-y-6">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Patient Information */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Patient Information</h2>
              <p className="text-sm text-slate-500">Select the patient before beginning the clinical assessment.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">Patient *</label>
              <select
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3"
              >
                <option value="">Select Patient...</option>
                {patients.map(p => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.patient_number} - {p.first_name} {p.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Assessment Date</label>
              <input
                type="date"
                value={new Date().toISOString().split('T')[0]}
                readOnly
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Attending Clinician</label>
              <input
                type="text"
                value={storedUser.firstName ? `Dr. ${storedUser.firstName} ${storedUser.lastName}` : 'Not signed in'}
                readOnly
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-100"
              />
            </div>
          </div>
        </div>

        {/* Symptoms */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">Clinical Symptoms</h2>
              <p className="text-sm text-slate-500">Select every symptom reported by the patient.</p>
            </div>
            <span className="bg-[#0F766E]/10 text-[#0F766E] px-3 py-1 rounded-full text-sm font-semibold">
              {selectedSymptoms.length} Selected
            </span>
          </div>

          {Object.entries(symptomGroups).map(([groupName, groupSymptoms], i, arr) => (
            <div key={groupName} className={i < arr.length - 1 ? 'mb-8' : ''}>
              <h3 className="font-semibold text-[#0F172A] mb-3">{groupName}</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                {groupSymptoms.map(symptom => {
                  const active = selectedSymptoms.includes(symptom)
                  return (
                    <button
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`rounded-xl border px-4 py-3 text-left transition-all
                      ${active ? "bg-[#0F766E] text-white border-[#0F766E]" : "border-slate-200 hover:border-[#0F766E]"}`}
                    >
                      {symptom}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Vital Signs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#0F172A] mb-1">Vital Signs</h2>
          <p className="text-sm text-slate-500 mb-6">Record the patient's clinical measurements.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: "Temperature (°C)", placeholder: "37.5", value: temperature, set: setTemperature },
              { label: "Blood Pressure", placeholder: "120/80", value: bloodPressure, set: setBloodPressure },
              { label: "Heart Rate (bpm)", placeholder: "78", value: heartRate, set: setHeartRate },
              { label: "Respiratory Rate", placeholder: "18", value: respiratoryRate, set: setRespiratoryRate },
              { label: "Oxygen Saturation (%)", placeholder: "98", value: oxygenSaturation, set: setOxygenSaturation },
              { label: "Blood Sugar (mmol/L)", placeholder: "5.6", value: bloodSugar, set: setBloodSugar },
              { label: "Weight (kg)", placeholder: "72", value: weight, set: setWeight },
              { label: "Height (cm)", placeholder: "175", value: height, set: setHeight },
            ].map(field => (
              <div key={field.label}>
                <label className="block text-sm font-medium mb-2">{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={e => field.set(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:border-[#0F766E] outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Physical Examination */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-bold text-[#0F172A] mb-1">Physical Examination</h2>
          <p className="text-sm text-slate-500 mb-6">Document important examination findings.</p>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-2">General Appearance</label>
              <textarea rows={3} value={generalAppearance} onChange={e => setGeneralAppearance(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3" placeholder="Patient appears..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Respiratory Examination</label>
              <textarea rows={3} value={respiratoryExam} onChange={e => setRespiratoryExam(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3" placeholder="Normal breath sounds..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cardiovascular Examination</label>
              <textarea rows={3} value={cardioExam} onChange={e => setCardioExam(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3" placeholder="Heart sounds..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Abdomen Examination</label>
              <textarea rows={3} value={abdomenExam} onChange={e => setAbdomenExam(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3" placeholder="Tenderness..." />
            </div>
          </div>
        </div>

        {/* Clinical History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Clinical History</h2>
          <p className="text-sm leading-6 text-slate-500 mb-6">Record the patient's presenting complaints and relevant medical history.</p>
          <div className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">Chief Complaint *</label>
              <textarea
                rows={3}
                value={chiefComplaint}
                onChange={e => setChiefComplaint(e.target.value)}
                placeholder="Describe the patient's primary complaint..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10 outline-none"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-semibold text-slate-700">History of Present Illness</label>
              <textarea
                rows={4}
                value={historyOfIllness}
                onChange={e => setHistoryOfIllness(e.target.value)}
                placeholder="Describe symptom onset, duration, progression and associated complaints..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Risk Factors</h2>
          <p className="text-sm leading-6 text-slate-500 mb-6">Select all applicable risk factors.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Previous Malaria", "Recent Travel", "Family History of Diabetes",
              "Family History of Hypertension", "Smoking", "Alcohol Consumption",
              "Pregnancy", "Tuberculosis Exposure", "Obesity",
              "Immunocompromised", "Recent Hospital Admission", "Poor Sanitation Exposure"
            ].map(item => (
              <label key={item} className="flex items-center gap-3 border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-[#0F766E]">
                <input
                  type="checkbox"
                  checked={riskFactors.includes(item)}
                  onChange={() => toggleRiskFactor(item)}
                  className="w-4 h-4 accent-[#0F766E]"
                />
                <span className="text-sm font-medium">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-4">Additional Notes</h2>
          <textarea
            rows={5}
            value={additionalNotes}
            onChange={e => setAdditionalNotes(e.target.value)}
            placeholder="Additional observations, provisional diagnosis, clinician remarks..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10 outline-none"
          />
        </div>

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-[10px] font-bold">i</span>
          </div>
          <p className="text-sm text-blue-800">The AI model will analyze the symptoms and measurements to generate a preliminary assessment. This result <strong>must be reviewed</strong> by a qualified healthcare professional before any clinical action is taken.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 justify-end pb-6">
          <button
            onClick={resetForm}
            title="Reset Form"
            className="flex items-center gap-2 text-sm font-semibold text-[#64748B] border border-slate-200 px-4 py-2.5 rounded-xl hover:border-slate-300 transition-all"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button
            onClick={handleRun}
            disabled={running}
            title="Run AI Assessment"
            className="flex items-center gap-2 bg-[#0F766E] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#0D5F58] transition-all disabled:opacity-70 hover:shadow-lg hover:shadow-[#0F766E]/25"
          >
            {running ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running AI...</>
            ) : (
              <><Brain size={15} /> Run AI Assessment</>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}