import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEmergencyStatus } from '../services/api'
import GoldenHourTimer from '../components/paramedic/GoldenHourTimer'

export default function Hospital() {
  const navigate = useNavigate()
  const [emergencyId, setEmergencyId] = useState('')
  const [emergency, setEmergency]     = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)

  const fetchEmergency = async () => {
    if (!emergencyId.trim()) { setError('Enter emergency ID'); return }
    setLoading(true); setError(null)
    try {
      const res = await getEmergencyStatus(emergencyId.trim().toUpperCase())
      setEmergency(res)
    } catch {
      setError('Emergency not found. Check the ID.')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontSize: '11px', color: '#0099ff', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hospital Console</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Pre-arrival Dashboard</div>
        </div>
      </div>

      {!emergency ? (
        <div>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
            Enter the Emergency ID received from RAKSHA alert to view incoming patient details and prepare blood supply.
          </p>
          <label className="input-label">Emergency ID</label>
          <input
            className="input-field"
            placeholder="e.g. EMR-A1B2C3D4"
            value={emergencyId}
            onChange={e => setEmergencyId(e.target.value)}
            style={{ marginBottom: '12px', textTransform: 'uppercase', fontFamily: 'monospace' }}
            onKeyDown={e => e.key === 'Enter' && fetchEmergency()}
          />
          {error && <div style={{ color: '#CC0000', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <button className="btn-primary" onClick={fetchEmergency} disabled={loading}>
            {loading ? 'Loading...' : 'Load Emergency Details'}
          </button>

          {/* Sample alert card */}
          <div style={{ marginTop: '24px', background: '#141414', border: '1px solid #0099ff33', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#0099ff', fontWeight: '600', marginBottom: '8px' }}>📋 SAMPLE INCOMING ALERT</div>
            <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.7' }}>
              🚨 <strong style={{ color: '#fff' }}>Emergency EMR-A1B2C3D4</strong><br />
              Blood Group: <strong style={{ color: '#CC0000' }}>B+</strong><br />
              Patient: Unknown | Scan: License OCR<br />
              ETA: <strong style={{ color: '#fff' }}>12 minutes</strong><br />
              Medical Alerts: None<br />
              Action: Prepare 2 units B+ for cross-match
            </div>
          </div>
        </div>
      ) : (
        <div>
          <GoldenHourTimer startTime={emergency.golden_hour_start} />

          <div style={{ background: '#141414', border: '1px solid #CC000033', borderRadius: '12px', padding: '16px', marginTop: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Blood Group</div>
                <div style={{ fontSize: '40px', fontWeight: '700', color: '#CC0000' }}>{emergency.blood_group}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Patient</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>{emergency.patient_name || 'Unknown'}</div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>via {emergency.scan_type}</div>
              </div>
            </div>
            {emergency.medical_alerts && emergency.medical_alerts !== 'None' && (
              <div style={{ marginTop: '12px', padding: '8px 12px', background: '#ffaa0011', border: '1px solid #ffaa0033', borderRadius: '8px', fontSize: '12px', color: '#ffaa00' }}>
                ⚠️ Medical Alert: {emergency.medical_alerts}
              </div>
            )}
          </div>

          <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Preparation Checklist</div>
            {[
              `Prepare ${emergency.blood_group} blood units for cross-match`,
              'Alert trauma team — incoming accident patient',
              'Set up emergency transfusion equipment',
              'Notify blood bank to send units to trauma bay',
              'Cross-match verification mandatory before transfusion'
            ].map((item, i) => (
              <CheckItem key={i} text={item} />
            ))}
          </div>

          <div style={{ padding: '10px 12px', background: 'rgba(255,170,0,0.05)', border: '1px solid rgba(255,170,0,0.15)', borderRadius: '8px', fontSize: '11px', color: '#888', lineHeight: '1.5' }}>
            ⚠️ Cross-match verification mandatory before transfusion. RAKSHA coordinates logistics only.
          </div>

          <button className="btn-secondary" onClick={() => { setEmergency(null); setEmergencyId('') }} style={{ marginTop: '12px' }}>
            ← Load Different Emergency
          </button>
        </div>
      )}
    </div>
  )
}

function CheckItem({ text }) {
  const [checked, setChecked] = useState(false)
  return (
    <div onClick={() => setChecked(!checked)} style={{
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      padding: '8px 0', borderBottom: '1px solid #1e1e1e', cursor: 'pointer'
    }}>
      <div style={{
        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, marginTop: '1px',
        background: checked ? '#00cc66' : 'transparent',
        border: `2px solid ${checked ? '#00cc66' : '#2a2a2a'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
      }}>
        {checked && <span style={{ color: '#fff', fontSize: '10px', fontWeight: '700' }}>✓</span>}
      </div>
      <div style={{ fontSize: '12px', color: checked ? '#555' : '#ccc', textDecoration: checked ? 'line-through' : 'none', lineHeight: '1.4', transition: 'all 0.2s' }}>
        {text}
      </div>
    </div>
  )
}
