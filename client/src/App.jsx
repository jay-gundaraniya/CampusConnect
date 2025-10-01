import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { RoleProvider } from './contexts/RoleContext'
import { authRoutes } from './routes/authRoutes'
import { studentRoutes } from './routes/studentRoutes'
import coordinatorRoutes from './routes/coordinatorRoutes'
import { adminRoutes } from './routes/adminRoutes'
import CertificateVerification from './pages/CertificateVerification'
import './App.css'

function App() {
  return (
    <RoleProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {authRoutes}
            {studentRoutes}
            {coordinatorRoutes}
            {adminRoutes}
            <Route path="/certificates/verify/:userId/:eventId" element={<CertificateVerification />} />
            <Route path="/certificates/verify" element={<CertificateVerification />} />
          </Routes>
        </div>
      </Router>
    </RoleProvider>
  )
}

export default App
