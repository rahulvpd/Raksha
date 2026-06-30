import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  const roles = [
    {
      icon: '🚑',
      title: 'Paramedic',
      subtitle: 'Trigger emergency & scan victim ID',
      route: '/emergency',
      color: '#CC0000'
    },
    {
      icon: '🩸',
      title: 'Blood Bank',
      subtitle: 'Manage inventory & respond to alerts',
      route: '/bloodbank',
      color: '#0099ff'
    },
    {
      icon: '🏥',
      title: 'Hospital',
      subtitle: 'Pre-arrival dashboard & preparation',
      route: '/hospital',
      color: '#aa00ff'
    },
    {
      icon: '❤️',
      title: 'Register / Get QR Card',
      subtitle: 'Get your RAKSHA Emergency QR Card',
      route: '/register',
      color: '#00cc66'
    },
    {
      icon: '💉',
      title: 'Donor Dashboard',
      subtitle: 'View alerts & track your impact',
      route: '/donor',
      color: '#ffaa00'
    },
    {
      icon: '📊',
      title: 'Impact Dashboard',
      subtitle: 'City-wide blood analytics & stats',
      route: '/impact',
      color: '#888'
    }
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: '0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0000 0%, #0a0a0a 100%)',
        borderBottom: '1px solid #2a0000',
        padding: '32px 24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🩸</div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#CC0000', letterSpacing: '0.05em' }}>
          RAKSHA
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginTop: '6px' }}>
          Emergency Blood Coordination Platform
        </p>
        <p style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>
          Saving lives in the Golden Hour — Powered by Gemini AI
        </p>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        background: '#141414', borderBottom: '1px solid #2a2a2a',
        padding: '16px 24px', gap: '16px', textAlign: 'center'
      }}>
        {[
          { num: '6', label: 'Blood Banks' },
          { num: '60 min', label: 'Golden Hour' },
          { num: '6', label: 'User Roles' }
        ].map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: '#CC0000' }}>{s.num}</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Role cards */}
      <div style={{ padding: '24px', maxWidth: '480px', margin: '0 auto' }}>
        <p style={{ color: '#888', fontSize: '12px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Select your role
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {roles.map((role) => (
            <button
              key={role.route}
              onClick={() => navigate(role.route)}
              style={{
                background: '#141414',
                border: '1px solid #2a2a2a',
                borderRadius: '12px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = role.color
                e.currentTarget.style.background = '#1e1e1e'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2a2a2a'
                e.currentTarget.style.background = '#141414'
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${role.color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', flexShrink: 0
              }}>
                {role.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>{role.title}</div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{role.subtitle}</div>
              </div>
              <div style={{ color: '#444', fontSize: '18px' }}>›</div>
            </button>
          ))}
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: '24px', padding: '12px 14px',
          background: 'rgba(255,170,0,0.05)',
          border: '1px solid rgba(255,170,0,0.15)',
          borderRadius: '8px', fontSize: '11px', color: '#888', lineHeight: '1.5'
        }}>
          ⚠️ RAKSHA coordinates logistics only. Cross-match verification is mandatory before transfusion. This platform does not replace medical judgment.
        </div>
      </div>
    </div>
  )
}
