import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, storage } from '../services/api'
import { useRole } from '../contexts/RoleContext'

const GOOGLE_CLIENT_ID = '755321876430-v6f6spuhc6ggb4cnn856kqh2r11rfhsu.apps.googleusercontent.com'

function GoogleOAuth({ onSuccess, onError, buttonText = "Continue with Google", disabled = false }) {
  const navigate = useNavigate()
  const { updateUserData } = useRole()
  const googleButtonRef = useRef(null)
  const googleInitialized = useRef(false)

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleAuth()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = initializeGoogleAuth
      script.onerror = () => {
        console.error('Failed to load Google Identity Services')
        if (onError) {
          onError('Failed to load Google authentication. Please check your internet connection.')
        }
      }
      document.head.appendChild(script)
    }

    const initializeGoogleAuth = () => {
      if (googleInitialized.current) return

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 360 // Set width to match form
          })
        }

        googleInitialized.current = true
      } catch (error) {
        console.error('Google initialization error:', error)
        if (onError) {
          onError('Google authentication is not properly configured. Please contact support.')
        }
      }
    }

    loadGoogleScript()

    return () => {
      // Cleanup if needed
    }
  }, [onError])

  const handleCredentialResponse = async (response) => {
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      
      const googleData = {
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        avatar: payload.picture
      }

      // Call the backend with Google data
      const result = await api.googleAuth(googleData)
      
      // Store token and user data
      storage.setToken(result.token)
      storage.setUser(result.user)
      
      // Update RoleContext with new user data
      updateUserData(result.user)
      
      // Call success callback or navigate
      if (onSuccess) {
        onSuccess(result)
      } else {
        const user = storage.getUser();
    if (user) {
      const userRole = user.currentRole || user.role;
      if (userRole === 'admin') navigate('/admin', { replace: true });
      else if (userRole === 'coordinator') navigate('/coordinator', { replace: true });
      else if (userRole === 'student') navigate('/student', { replace: true });
      else navigate('/dashboard', { replace: true });
    } else {
      navigate('/', { replace: true })
    }
      }
      
    } catch (error) {
      console.error('Google auth error:', error)
      if (onError) {
        onError(error.message || 'Google authentication failed')
      }
    }
  }

  return (
    <div className="flex justify-center w-full">
      <div
        ref={googleButtonRef}
        className="w-full flex justify-center"
      />
    </div>
  )
}

export default GoogleOAuth 