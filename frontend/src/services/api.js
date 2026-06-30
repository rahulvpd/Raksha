import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 60000,
})

// ─── VISION OCR ──────────────────────────────────────
export const scanLicense = async (imageFile) => {
  const form = new FormData()
  form.append('file', imageFile)
  const res = await API.post('/vision/scan-license', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// ─── QR CODE ─────────────────────────────────────────
export const registerUser = async (userData) => {
  const res = await API.post('/qr/register', userData)
  return res.data
}

export const lookupQR = async (qrData) => {
  const res = await API.post('/qr/lookup', qrData)
  return res.data
}

export const getQRImageUrl = (rakshaId) =>
  `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/qr/generate/${rakshaId}`

// ─── EMERGENCY ────────────────────────────────────────
export const triggerEmergency = async (emergencyData) => {
  const res = await API.post('/emergency/trigger', emergencyData)
  return res.data
}

export const getEmergencyStatus = async (emergencyId) => {
  const res = await API.get(`/emergency/status/${emergencyId}`)
  return res.data
}

export const acknowledgeEmergency = async (ackData) => {
  const res = await API.post('/emergency/acknowledge', ackData)
  return res.data
}

export const getBloodBanks = async () => {
  const res = await API.get('/emergency/bloodbanks')
  return res.data
}

export const getBanksByBloodGroup = async (bloodGroup) => {
  const res = await API.get(`/emergency/bloodbanks/${bloodGroup}`)
  return res.data
}

// ─── BLOOD BANK ───────────────────────────────────────
export const getShortagePrediction = async () => {
  const res = await API.get('/bloodbank/predict/shortage')
  return res.data
}

// ─── DONOR ────────────────────────────────────────────
export const registerDonor = async (donorData) => {
  const res = await API.post('/donor/register', donorData)
  return res.data
}

export const getNearbyDonors = async (bloodGroup, lat, lng) => {
  const res = await API.get(`/donor/nearby/${bloodGroup}?lat=${lat}&lng=${lng}`)
  return res.data
}

export const getDonorLeaderboard = async () => {
  const res = await API.get('/donor/leaderboard')
  return res.data
}

export default API
