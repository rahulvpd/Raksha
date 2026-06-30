import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { scanLicense, lookupQR, triggerEmergency } from '../services/api'
import VoiceRecorder from '../components/paramedic/VoiceRecorder'
import BloodBankMap from '../components/map/BloodBankMap'
import { sortByDistance } from '../services/maps'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'UNKNOWN']

export default function Emergency() {
  const navigate = useNavigate()
  const [mode, setMode] = useState(null) // 'qr' | 'license' | 'manual'
  const [step, setStep] = useState('scan') // 'scan' | 'confirm' | 'active'
  const [scanResult, setScanResult] = useState(null)
  const [emergency, setEmergency] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [manualBG, setManualBG] = useState('B+')
  const [timer, setTimer] = useState(3600) // 60 min golden hour
  const fileRef = useRef()
  const qrRef = useRef()

  // Golden Hour countdown
  useEffect(() => {
    if (step !== 'active') return
    const interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000)
    return () => clearInterval(interval)
  }, [step])

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  // QR Scanner
  useEffect(() => {
    if (mode !== 'qr' || step !== 'scan') return
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false)
    scanner.render(
      async (decoded) => {
        scanner.clear()
        try {
          const parsed = JSON.parse(decoded)
          const result = await lookupQR({ raksha_id: parsed.raksha_id, blood_group: parsed.blood_group, name: parsed.name })
          setScanResult(result.result)
          setStep('confirm')
        } catch {
          setError('Invalid QR code. Try license scan.')
        }
      },
      (err) => {}
    )
    qrRef.current = scanner
    return () => { try { scanner.clear() } catch {} }
  }, [mode, step])

  // License OCR
  const handleLicenseUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    setError(null)
    try {
      const res = await scanLicense(file)
      if (res.result.found) {
        setScanResult(res.result)
        setStep('confirm')
      } else {
        setError('Blood group not found on license. Try manual entry.')
      }
    } catch {
      setError('OCR failed. Try again or use manual entry.')
    }
    setLoading(false)
  }

  // Trigger emergency
  const handleTrigger = async () => {
    setLoading(true)
    setError(null)
    const bloodGroup = scanResult?.blood_group || manualBG

    const executeTrigger = async (lat, lng) => {
      try {
        const res = await triggerEmergency({
          blood_group: bloodGroup,
          patient_name: scanResult?.name || 'Unknown',
          location: { lat, lng },
          scan_type: mode,
          medical_alerts: scanResult?.medical_alerts || 'None',
          emergency_contact: scanResult?.emergency_contact || null
        })
        setEmergency(res)
        setStep('active')
      } catch (err) {
        console.error('Trigger Emergency Error:', err)
        setError(err.response?.data?.detail || err.message || 'Failed to trigger emergency. Server error.')
      } finally {
        setLoading(false)
      }
    }

    if (!navigator.geolocation) {
      await executeTrigger(13.0827, 80.2707)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await executeTrigger(pos.coords.latitude, pos.coords.longitude)
      },
      async (err) => {
        console.warn('Geolocation failed or timed out:', err)
        await executeTrigger(13.0827, 80.2707)
      },
      { timeout: 4000 }
    )
  }

  // ── ACTIVE EMERGENCY VIEW ──────────────────────────────
  if (step === 'active' && emergency) {
    const timeColor = timer < 600 ? '#CC0000' : timer < 1800 ? '#ffaa00' : '#00cc66'
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>←</button>
          <div>
            <div style={{ color: '#CC0000', fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em' }}>EMERGENCY ACTIVE</div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{emergency.emergency_id}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="badge badge-active pulse">● LIVE</span>
          </div>
        </div>

        {/* Golden Hour Timer */}
        <div style={{
          background: '#141414', border: `1px solid ${timeColor}33`,
          borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '16px'
        }}>
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Golden Hour Remaining</div>
          <div style={{ fontSize: '52px', fontWeight: '700', color: timeColor, fontVariantNumeric: 'tabular-nums' }}>
            {formatTime(timer)}
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>Every second counts</div>
        </div>

        {/* Blood group + Patient */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#141414', border: '1px solid #2a0000', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>Blood Group</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#CC0000' }}>{emergency.blood_group}</div>
          </div>
          <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>Banks Available</div>
            <div style={{ fontSize: '36px', fontWeight: '700', color: '#00cc66' }}>{emergency.available_banks_count}</div>
            <div style={{ fontSize: '11px', color: '#555' }}>with stock</div>
          </div>
        </div>

        {/* AI Coordination message */}
        {emergency.coordination?.message_to_paramedic && (
          <div style={{
            background: 'rgba(0,153,255,0.08)', border: '1px solid rgba(0,153,255,0.2)',
            borderRadius: '12px', padding: '14px', marginBottom: '16px'
          }}>
            <div style={{ fontSize: '11px', color: '#0099ff', marginBottom: '6px', fontWeight: '600' }}>🤖 RAKSHA AI — Coordination Update</div>
            <div style={{ fontSize: '13px', color: '#ddd', lineHeight: '1.5' }}>
              {emergency.coordination.message_to_paramedic}
            </div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>
              Urgency: <span style={{ color: emergency.coordination.urgency_level === 'CRITICAL' ? '#CC0000' : '#ffaa00' }}>
                {emergency.coordination.urgency_level}
              </span>
              {' · '}ETA to blood: {emergency.coordination.estimated_time_to_blood}
            </div>
          </div>
        )}

        {/* Action Plan */}
        {emergency.coordination?.action_plan?.length > 0 && (
          <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action Plan</div>
            {emergency.coordination.action_plan.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#CC000022', color: '#CC0000',
                  fontSize: '11px', fontWeight: '700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>{i + 1}</div>
                <div style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.4' }}>{step}</div>
              </div>
            ))}
          </div>
        )}

        {/* Real-time Map routing visualizer */}
        <div style={{ marginBottom: '16px' }}>
          <BloodBankMap
            banks={emergency.available_banks}
            bloodGroup={emergency.blood_group}
            userLocation={emergency.location || { lat: 13.0827, lng: 80.2707 }}
          />
        </div>

        {/* Nearby Blood Banks */}
        <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Nearby Blood Banks — {emergency.blood_group} Available
          </div>
          {sortByDistance(
            emergency.available_banks || [],
            emergency.location?.lat || 13.0827,
            emergency.location?.lng || 80.2707
          )?.slice(0, 3).map((bank) => (
            <div key={bank.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #1e1e1e'
            }}>
              <div>
                <div style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>{bank.name}</div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{bank.address}</div>
                {bank.distance !== undefined && (
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>📍 {bank.distance.toFixed(1)} km away</div>
                )}
                <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>📞 {bank.phone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#CC0000' }}>
                  {bank.inventory[emergency.blood_group] || 0}
                </div>
                <div style={{ fontSize: '10px', color: '#666' }}>units</div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{
          padding: '10px 12px', background: 'rgba(255,170,0,0.05)',
          border: '1px solid rgba(255,170,0,0.15)', borderRadius: '8px',
          fontSize: '11px', color: '#888', lineHeight: '1.5'
        }}>
          ⚠️ Cross-match verification mandatory before transfusion. RAKSHA coordinates logistics only.
        </div>
      </div>
    )
  }

  // ── CONFIRM VIEW ───────────────────────────────────────
  if (step === 'confirm' && scanResult) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
        <button onClick={() => { setScanResult(null); setStep('scan'); setMode(null) }}
          style={{ background: 'none', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer', marginBottom: '20px' }}>
          ← Back
        </button>
        <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Confirm & Trigger</h2>
        <p style={{ color: '#888', fontSize: '13px', marginBottom: '24px' }}>Verify patient details before triggering emergency</p>

        <div style={{ background: '#141414', border: '1px solid #CC000033', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px' }}>Blood Group Detected</div>
            <div style={{ fontSize: '52px', fontWeight: '700', color: '#CC0000' }}>{scanResult.blood_group}</div>
            <div style={{ fontSize: '11px', color: '#555' }}>Confidence: {scanResult.confidence} · Verified: {scanResult.verified ? '✓' : '—'}</div>
          </div>
          <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '12px' }}>
            <div style={{ fontSize: '13px', color: '#ccc' }}>Patient: <span style={{ color: '#fff', fontWeight: '500' }}>{scanResult.name || 'Unknown'}</span></div>
            {scanResult.emergency_contact && (
              <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>
                Emergency Contact: <span style={{ color: '#fff' }}>{scanResult.emergency_contact}</span>
              </div>
            )}
            {scanResult.medical_alerts && scanResult.medical_alerts !== 'None' && (
              <div style={{ fontSize: '13px', color: '#ffaa00', marginTop: '4px' }}>⚠️ {scanResult.medical_alerts}</div>
            )}
          </div>
        </div>

        {error && <div style={{ color: '#CC0000', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}

        <button className="btn-primary" onClick={handleTrigger} disabled={loading}>
          {loading ? 'Triggering Emergency...' : '🚨 TRIGGER EMERGENCY NOW'}
        </button>
      </div>
    )
  }

  // ── SCAN MODE VIEW ────────────────────────────────────
  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => mode ? setMode(null) : navigate('/')}
          style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontSize: '11px', color: '#CC0000', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Paramedic Console</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Emergency Scan</div>
        </div>
      </div>

      {/* Mode selection */}
      {!mode && (
        <>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>Select scan method to identify patient blood group</p>
          {[
            { key: 'qr', icon: '📱', title: 'RAKSHA QR Code', sub: 'Scan QR from helmet / wallet card / phone', color: '#00cc66', badge: 'PRIMARY' },
            { key: 'license', icon: '🪪', title: 'Driving License OCR', sub: 'Gemini Vision reads blood group from license', color: '#0099ff', badge: 'SECONDARY' },
            { key: 'voice', icon: '🎙️', title: 'Tamil Voice Input', sub: 'Speak in Tamil to report blood group/accident', color: '#ffaa00', badge: 'AI BETA' },
            { key: 'manual', icon: '✏️', title: 'Manual Entry', sub: 'Enter blood group manually or use O- protocol', color: '#888', badge: 'FALLBACK' },
          ].map(m => (
            <button key={m.key} onClick={() => setMode(m.key)} style={{
              width: '100%', background: '#141414', border: '1px solid #2a2a2a',
              borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center',
              gap: '14px', cursor: 'pointer', marginBottom: '10px', textAlign: 'left', transition: 'all 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = m.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${m.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#fff' }}>{m.title}</span>
                  <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px', background: `${m.color}22`, color: m.color }}>{m.badge}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>{m.sub}</div>
              </div>
              <div style={{ color: '#444', fontSize: '18px' }}>›</div>
            </button>
          ))}
        </>
      )}

      {/* QR Scanner */}
      {mode === 'qr' && (
        <div>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>Point camera at RAKSHA QR code on helmet, wallet card or phone screen</p>
          <div id="qr-reader" style={{ borderRadius: '12px', overflow: 'hidden' }}></div>
          {error && <div style={{ color: '#CC0000', fontSize: '13px', marginTop: '12px' }}>{error}</div>}
        </div>
      )}

      {/* License OCR */}
      {mode === 'license' && (
        <div>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>Take a clear photo of the victim's driving license. Gemini Vision will extract the blood group.</p>
          <div style={{
            border: '2px dashed #2a2a2a', borderRadius: '12px', padding: '40px 20px',
            textAlign: 'center', cursor: 'pointer', marginBottom: '16px'
          }} onClick={() => fileRef.current.click()}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
            <div style={{ color: '#888', fontSize: '14px' }}>Tap to capture / upload license photo</div>
            <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>JPEG, PNG, WEBP — max 10MB</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{ display: 'none' }} onChange={handleLicenseUpload} />
          {loading && <div style={{ textAlign: 'center', color: '#888', fontSize: '13px' }}>🤖 Gemini Vision analyzing license...</div>}
          {error && <div style={{ color: '#CC0000', fontSize: '13px' }}>{error}</div>}
        </div>
      )}

      {/* Manual */}
      {mode === 'manual' && (
        <div>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '20px' }}>Select blood group manually. If unknown, system activates O- universal donor protocol.</p>
          <label className="input-label">Select Blood Group</label>
          <select className="input-field" value={manualBG} onChange={e => setManualBG(e.target.value)} style={{ marginBottom: '20px' }}>
            {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
          </select>
          {error && <div style={{ color: '#CC0000', fontSize: '13px', marginBottom: '12px' }}>{error}</div>}
          <button className="btn-primary" onClick={() => {
            setScanResult({ blood_group: manualBG, name: 'Unknown', confidence: 'manual', verified: false, medical_alerts: 'None' })
            setStep('confirm')
          }}>
            Continue →
          </button>
        </div>
      )}

      {/* Tamil Voice Input */}
      {mode === 'voice' && (
        <div>
          <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>Speak clearly in Tamil. The AI will transcribe and detect the blood group.</p>
          <VoiceRecorder onResult={(res) => {
            if (res.success && res.blood_group_detected) {
              setScanResult({
                blood_group: res.blood_group_detected,
                name: 'Unknown (Voice Input)',
                confidence: 'medium',
                verified: false,
                medical_alerts: res.translation ? `Voice report: "${res.translation}"` : 'None'
              })
              setStep('confirm')
            } else {
              setError('Could not detect blood group from voice. Try again or enter manually.')
            }
          }} />
          {error && <div style={{ color: '#CC0000', fontSize: '13px', marginTop: '12px' }}>{error}</div>}
        </div>
      )}
    </div>
  )
}
