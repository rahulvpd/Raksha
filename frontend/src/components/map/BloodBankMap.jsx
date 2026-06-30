import { useEffect, useRef, useState } from 'react'
import { loadMapmyIndia, sortByDistance } from '../../services/maps'

export default function BloodBankMap({ banks = [], bloodGroup = null, userLocation = null, onBankSelect }) {
  const mapRef  = useRef(null)
  const mapObj  = useRef(null)
  const markers = useRef([])
  const [loaded, setLoaded] = useState(false)
  const [noKey,  setNoKey]  = useState(false)

  // Load MapmyIndia SDK
  useEffect(() => {
    loadMapmyIndia().then(sdk => {
      if (sdk) setLoaded(true)
      else setNoKey(true)
    })
  }, [])

  // Init map
  useEffect(() => {
    if (!loaded || !mapRef.current || mapObj.current || noKey) return
    const center = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [13.0827, 80.2707] // Chennai default

    try {
      mapObj.current = window.mappls.Map('mmi-map', {
        center,
        zoom: 12,
        search: false,
      })
    } catch (err) {
      console.warn('MapmyIndia Map initialization failed, falling back:', err)
      setNoKey(true)
    }
  }, [loaded, noKey])

  // Place markers
  useEffect(() => {
    if (!loaded || !mapObj.current || noKey) return

    try {
      // Clear old markers
      markers.current.forEach(m => m.remove())
      markers.current = []

      const sorted = userLocation
        ? sortByDistance(banks, userLocation.lat, userLocation.lng)
        : banks

      // Accident location marker
      if (userLocation) {
        const accMarker = window.mappls.Marker({
          map: mapObj.current,
          position: { lat: userLocation.lat, lng: userLocation.lng },
          icon: 'https://apis.mappls.com/map_v3/images/red_circle.png',
          popupHtml: `<div style="color:#CC0000;font-weight:700;">🚨 Accident Location</div>`
        })
        markers.current.push(accMarker)
      }

      sorted.forEach((bank, idx) => {
        const stock    = bank.inventory?.[bloodGroup] ?? 0
        const hasStock = typeof stock === 'number' && stock > 0
        const color    = hasStock ? '#00cc66' : '#CC0000'

        const marker = window.mappls.Marker({
          map: mapObj.current,
          position: { lat: bank.location.lat, lng: bank.location.lng },
          popupHtml: `
            <div style="min-width:200px;padding:8px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;">${bank.name}</div>
              <div style="font-size:11px;color:#666;">${bank.address}</div>
              <div style="font-size:11px;color:#666;margin-top:2px;">📞 ${bank.phone}</div>
              ${bloodGroup ? `
                <div style="margin-top:8px;padding:6px;background:${hasStock ? '#e6fff2' : '#fff0f0'};
                  border-radius:4px;text-align:center;">
                  <span style="font-size:15px;font-weight:700;color:${color};">
                    ${bloodGroup}: ${stock} units
                  </span>
                </div>` : ''}
              ${bank.distance ? `<div style="font-size:11px;color:#888;margin-top:6px;">📍 ${bank.distance.toFixed(1)} km away</div>` : ''}
            </div>
          `,
          popupOptions: { openPopup: false }
        })

        marker.addListener('click', () => {
          if (onBankSelect) onBankSelect(bank)
        })

        markers.current.push(marker)
      })
    } catch (err) {
      console.warn('MapmyIndia Marker placement failed, falling back:', err)
      setNoKey(true)
    }
  }, [loaded, banks, bloodGroup, userLocation, noKey])

  // ── FALLBACK — no API key ─────────────────────────────
  if (noKey) {
    return (
      <div style={{ background: '#141414', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px' }}>
        <div style={{ fontSize: '12px', color: '#ffaa00', marginBottom: '10px' }}>
          ⚠️ MapmyIndia key not set — showing list view
        </div>
        {banks.map((bank, i) => {
          const stock    = bank.inventory?.[bloodGroup] ?? '—'
          const hasStock = typeof stock === 'number' && stock > 0
          return (
            <div key={bank.id}
              onClick={() => onBankSelect && onBankSelect(bank)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', marginBottom: '8px', cursor: 'pointer',
                background: '#1a1a1a', borderRadius: '8px',
                border: `1px solid ${hasStock ? '#00cc6633' : '#2a2a2a'}`
              }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{i + 1}. {bank.name}</div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>{bank.address}</div>
                <div style={{ fontSize: '11px', color: '#555' }}>📞 {bank.phone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: hasStock ? '#00cc66' : '#CC0000' }}>
                  {stock}
                </div>
                <div style={{ fontSize: '10px', color: '#555' }}>units</div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        id="mmi-map"
        ref={mapRef}
        style={{ width: '100%', height: '300px', borderRadius: '12px', overflow: 'hidden', background: '#1a1a1a' }}
      />
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#1a1a1a', borderRadius: '12px', gap: '8px'
        }}>
          <div className="loading-spinner" />
          <div style={{ fontSize: '12px', color: '#888' }}>Loading MapmyIndia...</div>
        </div>
      )}
    </div>
  )
}
