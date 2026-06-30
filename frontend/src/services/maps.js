// MapmyIndia (Mappls) — Free Indian mapping API
// REST Key: for backend/API calls
// Map SDK Key: for loading the map in browser

export const loadMapmyIndia = () => {
  return new Promise((resolve) => {
    if (window.mappls) { resolve(window.mappls); return }

    const key = import.meta.env.VITE_MAPPLS_API_KEY
    if (!key || key === 'your_mappls_api_key_here') {
      console.warn('MapmyIndia key not set — fallback list view active')
      resolve(null); return
    }

    const script = document.createElement('script')
    script.src = `https://apis.mappls.com/advancedmaps/api/${key}/map_sdk?v=3.0`
    script.async = true
    script.defer = true
    script.onload  = () => {
      // Small delay to let Mappls finish initializing
      setTimeout(() => resolve(window.mappls || null), 500)
    }
    script.onerror = () => {
      console.warn('MapmyIndia SDK failed to load')
      resolve(null)
    }
    document.head.appendChild(script)
  })
}

// Distance between two lat/lng points in km (Haversine)
export const getDistance = (lat1, lng1, lat2, lng2) => {
  const R    = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a    =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Sort blood banks by distance from user location
export const sortByDistance = (banks, userLat, userLng) => {
  return banks
    .map(b => ({
      ...b,
      distance: getDistance(userLat, userLng, b.location.lat, b.location.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
}
