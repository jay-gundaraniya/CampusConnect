import { BrowserRouter as Router, Routes } from 'react-router-dom'
import { authRoutes } from './routes/authRoutes'
import { studentRoutes } from './routes/studentRoutes'
import coordinatorRoutes from './routes/coordinatorRoutes'
import { adminRoutes } from './routes/adminRoutes'
import './App.css'

function App() {
  return (
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
  )
}

export default App
