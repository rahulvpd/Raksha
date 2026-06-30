import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerDonor, getDonorLeaderboard, getNearbyDonors } from '../services/api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function Donor() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('register') // 'register' | 'leaderboard' | 'alerts'
  const [form, setForm] = useState({ name: '', blood_group: 'B+', phone: '' })
  const [leaderboard, setLeaderboard] = useState([])
  const [registered, setRegistered] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (tab === 'leaderboard') {
      getDonorLeaderboard().then(res => setLeaderboard(res.leaderboard)).catch(() => {})
    }
  }, [tab])

  const handleRegister = async () => {
    if (!form.name || !form.phone) { setError('Fill all fields'); return }
    setLoading(true); setError(null)

    const executeRegister = async (lat, lng) => {
      try {
        const res = await registerDonor({
          ...form,
          location: { lat, lng }
        })
        setRegistered(res)
      } catch (err) {
        console.error('Donor registration failed:', err)
        setError(err.response?.data?.detail || err.message || 'Registration failed. Server error.')
      } finally {
        setLoading(false)
      }
    }

    if (!navigator.geolocation) {
      await executeRegister(13.0827, 80.2707)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await executeRegister(pos.coords.latitude, pos.coords.longitude)
      },
      async (err) => {
        console.warn('Donor geolocation failed or timed out:', err)
        await executeRegister(13.0827, 80.2707)
      },
      { timeout: 4000 }
    )
  }

  const tabs = [
    { key: 'register', label: '🩸 Register' },
    { key: 'leaderboard', label: '🏆 Heroes' },
    { key: 'alerts', label: '🔔 Alerts' },
  ]

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontSize: '11px', color: '#ffaa00', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Community Heroes</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Donor Dashboard</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: '#141414', borderRadius: '10px', padding: '4px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            background: tab === t.key ? '#CC0000' : 'transparent',
            color: tab === t.key ? '#fff' : '#888',
            fontSize: '12px', fontWeight: '600', transition: 'all 0.2s'
          }}>{t.label}</button>
        ))}
      </div>

      {/* Register Tab */}
      {tab === 'register' && (
        registered ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🦸</div>
            <h2 style={{ color: '#ffaa00', fontSize: '20px', fontWeight: '700' }}>You're a Community Hero!</h2>
            <p style={{ color: '#888', fontSize: '13px', marginTop: '6px' }}>Donor ID: {registered.donor_id}</p>
            <div style={{ background: '#141414', border: '1px solid #ffaa0033', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#CC0000' }}>{registered.donor.blood_group}</div>
              <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>Your blood group</div>
              <div style={{ marginTop: '12px', fontSize: '13px', color: '#ccc' }}>
                You will receive proximity alerts when someone nearby needs {registered.donor.blood_group} blood urgently.
              </div>
            </div>
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.15)', borderRadius: '8px', fontSize: '12px', color: '#888', lineHeight: '1.5' }}>
              ❤️ Every donation earns you Hero Points and saves a life. Thank you for being a RAKSHA Community Hero.
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
              Register as a blood donor. When someone nearby urgently needs your blood type, you'll get an alert. One act of courage saves a life.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Full Name *</label>
                <input className="input-field" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
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
            </div>
            {error && <div style={{ color: '#CC0000', fontSize: '13px', marginTop: '12px' }}>{error}</div>}
            <button className="btn-primary" onClick={handleRegister} disabled={loading} style={{ marginTop: '20px' }}>
              {loading ? '🔄 Registering...' : '❤️ Become a Community Hero'}
            </button>
          </div>
        )
      )}

      {/* Leaderboard Tab */}
      {tab === 'leaderboard' && (
        <div>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>Top Community Heroes — ranked by Hero Score</p>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
              No donors yet. Be the first hero!
            </div>
          ) : (
            leaderboard.map((donor, i) => (
              <div key={donor.donor_id} style={{
                background: '#141414', border: `1px solid ${i === 0 ? '#ffaa0033' : '#2a2a2a'}`,
                borderRadius: '10px', padding: '14px', marginBottom: '8px',
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: i === 0 ? '#ffaa0022' : '#1a1a1a',
                  color: i === 0 ? '#ffaa00' : '#555',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700', flexShrink: 0
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{donor.name}</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                    {donor.blood_group} · {donor.donations_count} donations
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: '#ffaa00' }}>{donor.hero_score}</div>
                  <div style={{ fontSize: '10px', color: '#555' }}>pts</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {tab === 'alerts' && (
        <div>
          <div style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Proximity Alerts</h3>
            <p style={{ color: '#888', fontSize: '13px', lineHeight: '1.6' }}>
              When someone near you urgently needs your blood type, RAKSHA will alert you here in real time. Register as a donor to activate alerts.
            </p>
            <div style={{ marginTop: '20px', background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px' }}>SAMPLE ALERT</div>
              <div style={{ background: '#CC000011', border: '1px solid #CC000033', borderRadius: '8px', padding: '12px', textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#CC0000' }}>🚨 URGENT — B+ needed nearby</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Apollo Hospital Blood Bank, 2.3km from you · ETA 8 min</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                  <div style={{ flex: 1, background: '#CC0000', borderRadius: '6px', padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#fff' }}>I Can Help</div>
                  <div style={{ flex: 1, background: '#1a1a1a', borderRadius: '6px', padding: '8px', textAlign: 'center', fontSize: '12px', color: '#888' }}>Not Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
