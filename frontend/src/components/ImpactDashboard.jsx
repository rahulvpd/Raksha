import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBloodBanks } from '../services/api'


const MOCK_IMPACT = {
  lives_saved: 142,
  emergencies_handled: 189,
  avg_time_saved_minutes: 27,
  registered_donors: 1847,
  registered_users: 4231,
  blood_banks_active: 6,
  top_blood_group_needed: 'O+',
  donations_this_month: 63
}

export default function ImpactDashboard() {
  const navigate = useNavigate()
  const [banks, setBanks]   = useState([])
  const [impact]            = useState(MOCK_IMPACT)

  useEffect(() => {
    getBloodBanks().then(r => setBanks(r.blood_banks || [])).catch(() => {})
  }, [])

  const StatCard = ({ icon, value, label, color = '#CC0000' }) => (
    <div style={{
      background: '#141414', border: '1px solid #2a2a2a',
      borderRadius: '12px', padding: '16px', textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '6px' }}>{icon}</div>
      <div style={{ fontSize: '28px', fontWeight: '700', color }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{label}</div>
    </div>
  )

  // Total inventory by blood group across all banks
  const totalInventory = {}
  banks.forEach(bank => {
    Object.entries(bank.inventory || {}).forEach(([bg, units]) => {
      totalInventory[bg] = (totalInventory[bg] || 0) + units
    })
  })

  const getColor = (units) => units === 0 ? '#CC0000' : units < 10 ? '#ffaa00' : '#00cc66'

  return (
    <div style={{ padding: '20px', background: '#0a0a0a', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>←</button>
        <div>
          <div style={{ fontSize: '11px', color: '#CC0000', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>RAKSHA</div>
          <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff' }}>Impact Dashboard</div>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>Real-time community blood coordination</div>
        </div>
      </div>

      {/* Key stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <StatCard icon="❤️" value={impact.lives_saved} label="Lives Saved" color="#CC0000" />
        <StatCard icon="⏱️" value={`${impact.avg_time_saved_minutes} min`} label="Avg Time Saved" color="#00cc66" />
        <StatCard icon="🩸" value={impact.registered_donors.toLocaleString()} label="Registered Donors" color="#ffaa00" />
        <StatCard icon="🚨" value={impact.emergencies_handled} label="Emergencies Handled" color="#0099ff" />
      </div>

      {/* City-wide blood inventory */}
      <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Chennai — Total Blood Inventory
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {Object.entries(totalInventory).map(([bg, units]) => (
            <div key={bg} style={{
              background: '#1a1a1a', borderRadius: '8px', padding: '10px',
              textAlign: 'center', border: `1px solid ${getColor(units)}33`
            }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#CC0000' }}>{bg}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: getColor(units), marginTop: '2px' }}>{units}</div>
              <div style={{ fontSize: '9px', color: '#555' }}>units</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank status */}
      <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
          Active Blood Banks ({banks.length})
        </div>
        {banks.map(bank => {
          const total = Object.values(bank.inventory || {}).reduce((a, b) => a + b, 0)
          const low   = Object.values(bank.inventory || {}).some(u => u < 3)
          return (
            <div key={bank.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid #1e1e1e'
            }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{bank.name}</div>
                <div style={{ fontSize: '11px', color: '#555', marginTop: '2px' }}>{bank.address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: low ? '#ffaa00' : '#00cc66' }}>{total} units</div>
                <div style={{ fontSize: '10px', color: low ? '#ffaa00' : '#555' }}>{low ? '⚠️ Low stock' : '● Active'}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mission */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0000, #0a0a0a)',
        border: '1px solid #CC000033', borderRadius: '12px', padding: '16px', textAlign: 'center'
      }}>
        <div style={{ fontSize: '20px', marginBottom: '6px' }}>🩸</div>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#CC0000', marginBottom: '4px' }}>RAKSHA Mission</div>
        <div style={{ fontSize: '12px', color: '#888', lineHeight: '1.6' }}>
          Every second in the Golden Hour matters. RAKSHA ensures blood reaches patients faster — through AI coordination, community heroes, and technology built for India.
        </div>
      </div>
    </div>
  )
}
