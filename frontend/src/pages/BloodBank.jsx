import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBloodBanks, getShortagePrediction } from '../services/api'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

export default function BloodBank() {
  const navigate = useNavigate()
  const [banks, setBanks] = useState([])
  const [prediction, setPrediction] = useState(null)
  const [selectedBank, setSelectedBank] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getBloodBanks()
        setBanks(res.blood_banks)
        setSelectedBank(res.blood_banks[0])
        const pred = await getShortagePrediction()
        setPrediction(pred.prediction)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const getStockColor = (units) => {
    if (units === 0) return '#CC0000'
    if (units < 5) return '#ffaa00'
    return '#00cc66'
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontSize: '11px', color: '#0099ff', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Blood Bank Console</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Inventory & Alerts</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading blood bank data...</div>
      ) : (
        <>
          {/* AI Shortage Prediction */}
          {prediction && (
            <div style={{
              background: `rgba(${prediction.overall_risk === 'HIGH' ? '204,0,0' : '255,170,0'},0.08)`,
              border: `1px solid rgba(${prediction.overall_risk === 'HIGH' ? '204,0,0' : '255,170,0'},0.2)`,
              borderRadius: '12px', padding: '16px', marginBottom: '16px'
            }}>
              <div style={{ fontSize: '11px', color: prediction.overall_risk === 'HIGH' ? '#CC0000' : '#ffaa00', fontWeight: '600', marginBottom: '6px' }}>
                🤖 Gemini AI Shortage Prediction — Risk: {prediction.overall_risk}
              </div>
              <div style={{ fontSize: '13px', color: '#ddd', lineHeight: '1.5' }}>{prediction.shortage_prediction}</div>
              {prediction.at_risk_types?.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {prediction.at_risk_types.map(t => (
                    <span key={t} style={{ background: '#CC000022', color: '#CC0000', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '600' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bank selector */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '16px' }}>
            {banks.map(bank => (
              <button key={bank.id} onClick={() => setSelectedBank(bank)} style={{
                background: selectedBank?.id === bank.id ? '#CC000022' : '#141414',
                border: `1px solid ${selectedBank?.id === bank.id ? '#CC0000' : '#2a2a2a'}`,
                borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
                color: selectedBank?.id === bank.id ? '#CC0000' : '#888',
                fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', flexShrink: 0
              }}>
                {bank.id}
              </button>
            ))}
          </div>

          {/* Selected bank inventory */}
          {selectedBank && (
            <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{selectedBank.name}</div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>{selectedBank.address} · 📞 {selectedBank.phone}</div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {BLOOD_GROUPS.map(bg => (
                  <div key={bg} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#1a1a1a', borderRadius: '8px', padding: '10px 12px',
                    border: `1px solid ${getStockColor(selectedBank.inventory[bg] || 0)}33`
                  }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#CC0000' }}>{bg}</span>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: getStockColor(selectedBank.inventory[bg] || 0) }}>
                      {selectedBank.inventory[bg] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All banks summary */}
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>All Banks Summary</div>
          {banks.map(bank => (
            <div key={bank.id} style={{
              background: '#141414', border: '1px solid #2a2a2a', borderRadius: '10px',
              padding: '12px 14px', marginBottom: '8px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{bank.name}</div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{bank.address}</div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['O+', 'B+', 'A+'].map(bg => (
                  <div key={bg} style={{ textAlign: 'center', background: '#1a1a1a', borderRadius: '6px', padding: '4px 6px', minWidth: '32px' }}>
                    <div style={{ fontSize: '9px', color: '#666' }}>{bg}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: getStockColor(bank.inventory[bg] || 0) }}>{bank.inventory[bg] || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
