import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../services/api'
import { useRole } from '../contexts/RoleContext'

function DashboardRedirect() {
  const navigate = useNavigate()
  const { updateUserData } = useRole()
  const [isChecking, setIsChecking] = useState(true)
  const hasUpdatedUserData = useRef(false)
  const hasNavigated = useRef(false)

  useEffect(() => {
    // Prevent multiple executions
    if (hasNavigated.current) return
    
    const checkAuth = async () => {
      try {
        const user = storage.getUser()
        const token = storage.getToken()
        
        // If no user or token, redirect to login
        if (!user || !token) {
          storage.clear() // Clear any stale data
          hasNavigated.current = true
          navigate('/login', { replace: true })
          return
        }

        // Validate token by making a request to the server
        try {
          const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })

          if (!response.ok) {
            // Token is invalid, clear storage and redirect to login
            storage.clear()
            hasNavigated.current = true
            navigate('/login', { replace: true })
            return
          }

          const data = await response.json()
          
          // Only update user data once to prevent infinite loops
          if (!hasUpdatedUserData.current) {
            updateUserData(data.user)
            hasUpdatedUserData.current = true
          }

          // Token is valid, redirect based on current role
          const userRole = data.user.currentRole || data.user.role;
          hasNavigated.current = true
          
          if (userRole === 'admin') {
            navigate('/admin', { replace: true })
          } else if (userRole === 'coordinator') {
            navigate('/coordinator', { replace: true })
          } else if (userRole === 'student') {
            navigate('/student', { replace: true })
          } else {
            // Unknown role, clear and redirect to login
            storage.clear()
            navigate('/login', { replace: true })
          }
        } catch (error) {
          console.error('Token validation failed:', error)
          storage.clear()
          hasNavigated.current = true
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        storage.clear()
        hasNavigated.current = true
        navigate('/login', { replace: true })
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [navigate, updateUserData]) // Added updateUserData back to dependencies since it's stable

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking authentication...
        </div>
      </div>
    )
  }

  return null
}

export default DashboardRedirect 