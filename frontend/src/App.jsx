import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Emergency from './pages/Emergency'
import Register from './pages/Register'
import BloodBank from './pages/BloodBank'
import Donor from './pages/Donor'
import Hospital from './pages/Hospital'
import ImpactDashboard from './components/ImpactDashboard'
import './index.css'

export default function App() {
  return (
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/emergency" element={<Emergency />} />
      <Route path="/register"  element={<Register />} />
      <Route path="/bloodbank" element={<BloodBank />} />
      <Route path="/donor"     element={<Donor />} />
      <Route path="/hospital"  element={<Hospital />} />
      <Route path="/impact"    element={<ImpactDashboard />} />
    </Routes>
  )
}
