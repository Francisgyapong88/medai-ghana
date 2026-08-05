import { useState } from 'react'
import {
  Brain, Shield, ClipboardList, BarChart2, History, Users,
  CheckCircle, ChevronDown, ArrowRight, Stethoscope, Activity,
  MapPin, Sparkles, HeartPulse, Layers
} from 'lucide-react'

type Page = 'landing' | 'login' | 'dashboard' | 'patients' | 'patient-registration' | 'assessment' | 'prediction' | 'history' | 'analytics' | 'profile' | 'user-management' | 'settings'

interface LandingProps {
  onNavigate: (page: Page) => void
}

const features = [
  { icon: Brain, title: 'AI Disease Prediction', desc: 'A clinical rule engine that weighs reported symptoms and vitals to suggest likely conditions among 5 supported diseases.', color: '#0F766E' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Every account is tied to a role and a facility — clinicians, lab staff, and front-desk workers each see only what their role needs.', color: '#2563EB' },
  { icon: ClipboardList, title: 'Assessment History', desc: 'A complete, timestamped record of every assessment, tied to the patient, the visit, and the staff member who ran it.', color: '#06B6D4' },
  { icon: BarChart2, title: 'Clinic Analytics', desc: 'Live dashboards showing assessment trends, disease distribution, and the most commonly reported symptoms.', color: '#F59E0B' },
  { icon: Sparkles, title: 'Explainable Results', desc: 'Every prediction comes with a plain-language explanation of which matched symptoms drove the result — nothing is a black box.', color: '#22C55E' },
  { icon: Users, title: 'Built for the Whole Team', desc: 'Designed around how rural facilities actually staff up — nurses and health officers can run assessments, not doctors only.', color: '#8B5CF6' },
]

const facilityTypes = [
  { icon: Layers, label: 'CHPS Compounds' },
  { icon: HeartPulse, label: 'Health Centres' },
  { icon: MapPin, label: 'District Hospitals' },
  { icon: Stethoscope, label: 'Regional & Teaching Hospitals' },
]

const valueProps = [
  { title: 'Faster preliminary triage', text: 'A structured symptom form and instant suggestion can help staff prioritize who needs urgent attention first.' },
  { title: 'Support where specialists are scarce', text: 'Most rural facilities have no doctor on-site — this tool is designed for the nurses and health officers who actually staff them.' },
  { title: 'Reasoning you can check', text: 'Every result shows exactly which symptoms matched and why, so the final call always stays with the clinician.' },
]

const faqs = [
  { q: 'Is this a replacement for a doctor?', a: 'No. MedAI Ghana is a clinical decision support tool only. Every AI prediction must be reviewed and verified by a qualified healthcare professional before any clinical action is taken.' },
  { q: 'Which diseases does the system cover?', a: 'The current version supports preliminary assessments for Malaria, Typhoid Fever, Pneumonia, Diabetes Mellitus, and Hypertension.' },
  { q: 'Is patient data secure?', a: 'Passwords are hashed, every account requires authentication, and access to features is restricted by role — a receptionist and a doctor see different parts of the system by design.' },
  { q: 'Does it work offline?', a: 'Not yet — offline support for areas with poor connectivity is a planned direction for future development.' },
]

export default function Landing({ onNavigate }: LandingProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0F766E] rounded-xl flex items-center justify-center">
              <Stethoscope size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display font-800 text-[#0F172A] text-sm">MedAI Ghana</span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2">Clinical Decision Support</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How It Works', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} className="text-sm font-medium text-slate-600 hover:text-[#0F766E] transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('login')} className="text-sm font-medium text-slate-700 hover:text-[#0F766E] px-4 py-2 transition-colors">
              Sign In
            </button>
            <button onClick={() => onNavigate('login')} className="bg-[#0F766E] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0D5F58] transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-br from-[#F0FDF9] via-white to-[#EFF6FF] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0F766E]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#CCFBF1] text-[#0F766E] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Activity size={12} />
              AI-Powered Clinical Decision Support
            </div>
            <h1 className="font-display font-800 text-4xl sm:text-5xl lg:text-[52px] leading-[1.1] text-[#0F172A] mb-6">
              An AI Diagnostic Assistant for{' '}
              <span className="text-[#0F766E]">Rural Clinics</span> in Ghana
            </h1>
            <p className="text-lg text-[#64748B] leading-relaxed mb-8 max-w-xl">
              Helping healthcare workers make faster preliminary assessments — designed for the CHPS compounds, health centres, and district hospitals that often work without a doctor on site.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => onNavigate('login')} className="bg-[#0F766E] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0D5F58] transition-all hover:shadow-lg hover:shadow-[#0F766E]/25 flex items-center gap-2">
                Get Started <ArrowRight size={16} />
              </button>
              <a href="#how-it-works" className="border border-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:border-[#0F766E] hover:text-[#0F766E] transition-all">
                Learn More
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              {facilityTypes.map(f => (
                <div key={f.label} className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3.5 py-2 text-xs font-medium text-slate-600">
                  <f.icon size={13} className="text-[#0F766E]" />
                  {f.label}
                </div>
              ))}
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200 p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-red-400 rounded-full" />
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-xs text-slate-400 ml-2">Assessment Preview</span>
              </div>
              <div className="bg-[#F0FDF9] rounded-xl p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#0F766E]">Top Suggested Condition</span>
                  <span className="text-sm font-display font-800 text-[#0F172A]">Malaria</span>
                </div>
                <div className="w-full bg-white rounded-full h-2.5 mb-1">
                  <div className="h-2.5 bg-[#0F766E] rounded-full" style={{ width: '90%' }} />
                </div>
                <p className="text-[10px] text-slate-400 mb-3">Illustrative example, not a real patient</p>
                <div className="flex flex-wrap gap-2">
                  {['Fever', 'Headache', 'Body Weakness'].map(s => (
                    <span key={s} className="text-[9px] bg-[#CCFBF1] text-[#0F766E] px-2 py-0.5 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[
                  { label: 'Diseases Covered', value: '5', color: '#0F766E' },
                  { label: 'Explained Results', value: '100%', color: '#2563EB' },
                ].map(card => (
                  <div key={card.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-lg font-display font-800" style={{ color: card.color }}>{card.value}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{card.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 items-start">
                <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-[8px] font-bold">!</span>
                </div>
                <p className="text-[9px] text-amber-800 font-medium leading-snug">AI Decision-Support Notice: This is a preliminary assessment only. Verification by a qualified healthcare professional is required.</p>
              </div>
            </div>
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#DBEAFE] rounded-lg flex items-center justify-center">
                <Brain size={16} className="text-[#2563EB]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">AI-Assisted</p>
                <p className="text-[10px] text-slate-500">Rule-based reasoning</p>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#CCFBF1] rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-[#0F766E]" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#0F172A]">Role-Based Access</p>
                <p className="text-[10px] text-slate-500">Built in from day one</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facts strip */}
      <section className="bg-[#0F766E] py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '5', label: 'Diseases Screened' },
            { value: '8', label: 'Staff Role Types Supported' },
            { value: '16', label: "Ghana's Regions, Reach Design Target" },
            { value: '6', label: 'Facility Types, from CHPS to Teaching Hospitals' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="font-display font-800 text-4xl text-white mb-1">{stat.value}</p>
              <p className="text-[#CCFBF1] text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0F766E] text-sm font-semibold mb-3">CAPABILITIES</p>
            <h2 className="font-display font-800 text-3xl sm:text-4xl text-[#0F172A] mb-4">Everything clinicians need</h2>
            <p className="text-[#64748B] text-lg max-w-xl mx-auto">A complete platform for AI-assisted clinical decision support, tailored for Ghana's rural healthcare system.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-[#0F766E]/30 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: color + '15' }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="font-display font-700 text-[#0F172A] mb-2">{title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#0F766E] text-sm font-semibold mb-3">WORKFLOW</p>
            <h2 className="font-display font-800 text-3xl sm:text-4xl text-[#0F172A] mb-4">How it works</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Patient Data', desc: 'Enter reported symptoms and clinical measurements into the structured assessment form.', icon: ClipboardList, color: '#0F766E' },
              { step: '02', title: 'AI Analysis', desc: 'The system weighs matched symptoms against known disease patterns and ranks likely conditions.', icon: Brain, color: '#2563EB' },
              { step: '03', title: 'Clinician Review', desc: 'Healthcare worker reviews the suggestion alongside a plain-language explanation of the match.', icon: Stethoscope, color: '#06B6D4' },
              { step: '04', title: 'Clinical Decision', desc: 'The healthcare worker makes the final call and documents the outcome for the record.', icon: CheckCircle, color: '#22C55E' },
            ].map(({ step, title, desc, icon: Icon, color }, i, arr) => (
              <div key={step} className="relative flex flex-col items-center text-center">
                {i < arr.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] right-[-calc(50%-28px)] h-0.5 bg-slate-200 z-0" />
                )}
                <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: color + '15', border: `2px solid ${color}25` }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mb-1">{step}</p>
                <h3 className="font-display font-700 text-[#0F172A] mb-2">{title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diseases */}
      <section className="py-20 px-4 sm:px-6 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#0F766E] text-sm font-semibold mb-3">SUPPORTED CONDITIONS</p>
            <h2 className="font-display font-800 text-3xl sm:text-4xl text-[#0F172A] mb-4">5 Diseases. One Platform.</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'Malaria', icon: '🦟', color: '#EF4444', bg: '#FEF2F2' },
              { name: 'Typhoid Fever', icon: '🌡️', color: '#F59E0B', bg: '#FFF7ED' },
              { name: 'Pneumonia', icon: '🫁', color: '#2563EB', bg: '#EFF6FF' },
              { name: 'Diabetes Mellitus', icon: '💉', color: '#8B5CF6', bg: '#F5F3FF' },
              { name: 'Hypertension', icon: '❤️', color: '#EF4444', bg: '#FFF1F2' },
            ].map(disease => (
              <div key={disease.name} className="flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all hover:scale-105" style={{ backgroundColor: disease.bg, borderColor: disease.color + '30' }}>
                <span className="text-2xl">{disease.icon}</span>
                <span className="font-display font-700 text-[#0F172A]">{disease.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value props (replaces fabricated testimonials) */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#0F766E] text-sm font-semibold mb-3">WHY IT MATTERS</p>
            <h2 className="font-display font-800 text-3xl sm:text-4xl text-[#0F172A]">Designed around rural realities</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {valueProps.map(v => (
              <div key={v.title} className="bg-[#F8FAFC] rounded-2xl p-6 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 flex items-center justify-center mb-4">
                  <CheckCircle size={18} className="text-[#0F766E]" />
                </div>
                <h3 className="font-display font-700 text-[#0F172A] mb-2">{v.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-[#F8FAFC]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#0F766E] text-sm font-semibold mb-3">FAQ</p>
            <h2 className="font-display font-800 text-3xl sm:text-4xl text-[#0F172A]">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-semibold text-[#0F172A] text-sm">{faq.q}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-[#64748B] text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#0F766E] to-[#2563EB] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-800 text-3xl sm:text-4xl mb-4">Ready to see it in action?</h2>
          <p className="text-teal-100 text-lg mb-8">Sign in to explore the assessment workflow, from patient intake to AI-assisted suggestion.</p>
          <button onClick={() => onNavigate('login')} className="bg-white text-[#0F766E] font-bold px-8 py-4 rounded-xl hover:bg-slate-50 transition-all hover:shadow-xl flex items-center gap-2 mx-auto">
            Get Started <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#0F766E] rounded-lg flex items-center justify-center">
                <Stethoscope size={15} className="text-white" />
              </div>
              <span className="font-display font-800 text-sm">MedAI Ghana</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">An AI-assisted clinical decision support system, built as a final year project for rural healthcare facilities in Ghana.</p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-4">Platform</p>
            <ul className="space-y-2">
              {['Dashboard', 'Assessments', 'Analytics', 'Patient Records'].map(l => (
                <li key={l}><a href="#" className="text-slate-400 text-xs hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-4">About This Project</p>
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <MapPin size={12} /> Built in and for Ghana
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
          © 2026 MedAI Ghana. This system does not replace professional medical diagnosis.
        </div>
      </footer>
    </div>
  )
}