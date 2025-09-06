import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, storage } from '../../services/api'
import GoogleOAuth from '../../components/GoogleOAuth'
import { useRole } from '../../contexts/RoleContext'
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const navigate = useNavigate()
  const { updateUserData } = useRole()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (hasNavigated.current) return; // Prevent multiple navigations
    
    const user = storage.getUser();
    if (user) {
      hasNavigated.current = true;
      const userRole = user.currentRole || user.role;
      if (userRole === 'admin') navigate('/admin', { replace: true });
      else if (userRole === 'coordinator') navigate('/coordinator', { replace: true });
      else if (userRole === 'student') navigate('/student', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Only clear error if user edits the field that had an error
    if (e.target.name === 'email' && emailError) setEmailError('');
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setEmailError('')

    // Email validation
    if (!formData.email.trim()) {
      setEmailError('Email is required');
      setLoading(false);
      return;
    } else if (!formData.email.includes('@')) {
      setEmailError('Please include an "@" in the email address.');
      setLoading(false);
      return;
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      setEmailError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.login(formData)
      
      // Store token and user data
      storage.setToken(response.token)
      storage.setUser(response.user)
      
      // Update RoleContext with new user data
      updateUserData(response.user)
      
      // Role-based redirect
      const userRole = response.user.currentRole || response.user.role;
      if (userRole === 'admin') {
        navigate('/admin', { replace: true })
      } else if (userRole === 'coordinator') {
        navigate('/coordinator', { replace: true })
      } else if (userRole === 'student') {
        navigate('/student', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = (result) => {
    // Google OAuth success is handled in the GoogleOAuth component
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

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to CampusConnect
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        
        {emailError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm mt-2">
            {emailError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={loading}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mt-4">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" tabIndex={-1} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 z-20" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center w-full">
              <GoogleOAuth 
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                disabled={loading}
              />
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login 