import { useState, useEffect } from 'react'

export default function GoldenHourTimer({ startTime, onExpire }) {
  const [seconds, setSeconds] = useState(3600)

  useEffect(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
      setSeconds(Math.max(0, 3600 - elapsed))
    }
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) { clearInterval(interval); if (onExpire) onExpire(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  const pct  = (seconds / 3600) * 100
  const color = seconds < 600 ? '#CC0000' : seconds < 1800 ? '#ffaa00' : '#00cc66'
  const label = seconds < 600 ? 'CRITICAL' : seconds < 1800 ? 'URGENT' : 'ACTIVE'

  return (
    <div style={{
      background: '#141414',
      border: `1px solid ${color}33`,
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
        Golden Hour Remaining
      </div>

      {/* Progress arc */}
      <div style={{ position: 'relative', width: '120px', height: '60px', margin: '0 auto 12px' }}>
        <svg width="120" height="70" viewBox="0 0 120 70">
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="#2a2a2a" strokeWidth="8" strokeLinecap="round"/>
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 157} 157`}
            style={{ transition: 'stroke-dasharray 1s ease, stroke 0.5s ease' }}/>
        </svg>
        <div style={{
          position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)',
          fontSize: '10px', fontWeight: '600', color,
          animation: seconds < 600 ? 'pulse 1s ease-in-out infinite' : 'none'
        }}>
          {label}
        </div>
      </div>

      <div style={{
        fontSize: '52px', fontWeight: '700', color,
        fontVariantNumeric: 'tabular-nums', lineHeight: 1,
        animation: seconds < 600 ? 'pulse 1s ease-in-out infinite' : 'none'
      }}>
        {mins}:{secs}
      </div>

      <div style={{ fontSize: '11px', color: '#555', marginTop: '8px' }}>
        {seconds === 0
          ? '⚠️ Golden Hour expired — continue emergency protocol'
          : 'Every second counts — blood coordination active'}
      </div>
    </div>
  )
}
