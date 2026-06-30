import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser, getQRImageUrl } from '../services/api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', blood_group: 'B+', emergency_contact: '', phone: '', medical_alerts: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.emergency_contact) {
      setError('Please fill all required fields')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await registerUser({ ...form, medical_alerts: form.medical_alerts || 'None' })
      setResult(res)
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed. Try again.')
    }
    setLoading(false)
  }

  if (result) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>✅</div>
          <h2 style={{ color: '#00cc66', fontSize: '22px', fontWeight: '700' }}>Registered Successfully!</h2>
          <p style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>Your RAKSHA Emergency ID is ready</p>
        </div>

        {/* RAKSHA ID */}
        <div style={{ background: '#141414', border: '1px solid #00cc6633', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>Your RAKSHA ID</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#CC0000', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            {result.raksha_id}
          </div>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#CC0000', marginTop: '8px' }}>
            {result.user.blood_group}
          </div>
        </div>

        {/* QR Code */}
        <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your RAKSHA Emergency QR Card</div>
          <img src={getQRImageUrl(result.raksha_id)} alt="RAKSHA QR" style={{ width: '180px', height: '180px', borderRadius: '8px' }} />
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
            📲 Save this QR to your phone lock screen<br />
            🖨️ Print and stick on your helmet<br />
            👛 Carry in your wallet
          </div>
        </div>

        <a href={getQRImageUrl(result.raksha_id)} download={`raksha-${result.raksha_id}.png`}>
          <button className="btn-primary" style={{ marginBottom: '10px' }}>⬇️ Download QR Card</button>
        </a>
        <button className="btn-secondary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    )
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontSize: '11px', color: '#00cc66', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>One-time setup</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Get Your RAKSHA QR Card</div>
        </div>
      </div>

      <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px', lineHeight: '1.5' }}>
        Register once. Get your unique QR card. Stick it on your helmet. In an emergency, one scan is all it takes.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="input-label">Full Name *</label>
          <input className="input-field" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Blood Group *</label>
          <select className="input-field" value={form.blood_group} onChange={e => setForm({ ...form, blood_group: e.target.value })}>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
        </div>
        <div>
          <label className="input-label">Phone Number *</label>
          <input className="input-field" placeholder="+91 98XXX XXXXX" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Emergency Contact *</label>
          <input className="input-field" placeholder="Family member phone number" type="tel" value={form.emergency_contact} onChange={e => setForm({ ...form, emergency_contact: e.target.value })} />
        </div>
        <div>
          <label className="input-label">Medical Alerts (optional)</label>
          <input className="input-field" placeholder="e.g. Allergic to Penicillin, Diabetic" value={form.medical_alerts} onChange={e => setForm({ ...form, medical_alerts: e.target.value })} />
        </div>
      </div>

      {error && <div style={{ color: '#CC0000', fontSize: '13px', marginTop: '12px' }}>{error}</div>}

      <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ marginTop: '24px' }}>
        {loading ? '🔄 Generating your QR Card...' : '🩸 Generate My RAKSHA QR Card'}
      </button>

      <div style={{ marginTop: '16px', padding: '10px 12px', background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.15)', borderRadius: '8px', fontSize: '11px', color: '#888', lineHeight: '1.5' }}>
        ⚠️ Cross-match verification mandatory before transfusion. RAKSHA coordinates logistics only.
      </div>
    </div>
  )
}
