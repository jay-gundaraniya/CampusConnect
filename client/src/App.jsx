import { BrowserRouter as Router, Routes } from 'react-router-dom'
import { RoleProvider } from './contexts/RoleContext'
import { authRoutes } from './routes/authRoutes'
import { studentRoutes } from './routes/studentRoutes'
import coordinatorRoutes from './routes/coordinatorRoutes'
import { adminRoutes } from './routes/adminRoutes'
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
          </Routes>
        </div>
      </Router>
    </RoleProvider>
  )
}

export default App
