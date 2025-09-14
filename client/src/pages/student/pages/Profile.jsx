import { useState, useEffect } from 'react'
import { FaUser, FaEdit } from 'react-icons/fa'
import { storage, api } from '../../../services/api'
import ForgotPasswordModal from '../../../components/ForgotPasswordModal'

function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [activitySummary, setActivitySummary] = useState({
    eventsAttended: 0,
    eventsOrganized: 0,
    certificatesEarned: 0,
    memberSince: ''
  })
  const [activityLoading, setActivityLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    department: '',
    year: '',
    bio: '',
    skills: [],
    interests: [],
    avatar: null
  })

  // Department options
  const departments = [
    'Information Technology',
    'Computer Engineering', 
    'Computer Science Engineering',
    'AIML',
    'Electronic & Communication',
    'Civil',
    'Mechanical'
  ]

  // Year options
  const years = [
    '1st Year',
    '2nd Year', 
    '3rd Year',
    '4th Year'
  ]

  useEffect(() => {
    fetchProfile()
    fetchActivitySummary()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const token = storage.getToken()
      if (token) {
        const response = await api.getProfile(token)
        const userData = response.user
        setUser(userData)
        setFormData({
          name: userData?.name || '',
          email: userData?.email || '',
          phone: userData?.phone || '+91 ',
          studentId: userData?.studentId || '',
          department: userData?.department || '',
          year: userData?.year || '',
          bio: userData?.bio || '',
          skills: userData?.skills || [],
          interests: userData?.interests || [],
          avatar: userData?.avatar || null
        })
        console.log('Student profile data loaded:', userData)
        console.log('Student avatar value:', userData?.avatar)
        console.log('Student avatar type:', typeof userData?.avatar)
      } else {
        // Fallback to local storage if no token
        const userData = storage.getUser()
        setUser(userData)
        setFormData({
          name: userData?.name || '',
          email: userData?.email || '',
          phone: '+91 ',
          studentId: 'STU2024001',
          department: 'Information Technology',
          year: '3rd Year',
          bio: 'Passionate student interested in web development and machine learning. Always eager to learn new technologies and participate in campus events.',
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning'],
          interests: ['Web Development', 'AI/ML', 'Mobile Apps', 'Data Science'],
          avatar: null
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      // Fallback to local storage on error
      const userData = storage.getUser()
      setUser(userData)
      setFormData({
        name: userData?.name || '',
        email: userData?.email || '',
        phone: '+91 ',
        studentId: 'STU2024001',
        department: 'Information Technology',
        year: '3rd Year',
        bio: 'Passionate student interested in web development and machine learning. Always eager to learn new technologies and participate in campus events.',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning'],
        interests: ['Web Development', 'AI/ML', 'Mobile Apps', 'Data Science'],
        avatar: null
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchActivitySummary = async () => {
    setActivityLoading(true)
    try {
      const token = storage.getToken()
      if (!token) {
        setActivityLoading(false)
        return
      }

      const response = await api.getStudentActivitySummary(token)
      setActivitySummary(response)
    } catch (error) {
      console.error('Error fetching activity summary:', error)
      // Set default values on error
      setActivitySummary({
        eventsAttended: 0,
        eventsOrganized: 0,
        certificatesEarned: 0,
        memberSince: user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : ''
      })
    } finally {
      setActivityLoading(false)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setShowDepartmentDropdown(false)
        setShowYearDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    // Handle phone number with +91 prefix
    if (name === 'phone') {
      // Only allow numeric input and limit to 10 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10)
      setFormData(prev => ({
        ...prev,
        [name]: '+91' + numericValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleDepartmentSelect = (department) => {
    setFormData(prev => ({
      ...prev,
      department
    }))
    setShowDepartmentDropdown(false)
  }

  const handleYearSelect = (year) => {
    setFormData(prev => ({
      ...prev,
      year
    }))
    setShowYearDropdown(false)
  }

  const handleSkillChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim())
    setFormData(prev => ({
      ...prev,
      skills
    }))
  }

  const handleInterestChange = (e) => {
    const interests = e.target.value.split(',').map(interest => interest.trim())
    setFormData(prev => ({
      ...prev,
      interests
    }))
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    console.log('File selected:', file)
    if (file) {
      try {
        const token = storage.getToken()
        if (!token) {
          console.error('No authentication token found')
          return
        }

        console.log('Uploading photo to server...')
        // Upload photo to server
        const response = await api.uploadProfilePhoto(token, file)
        
        console.log('Upload response:', response)
        
        // Update form data with server path
        setFormData(prev => ({
          ...prev,
          avatar: response.avatar
        }))
        
        // Update user data
        const updatedUser = { ...user, avatar: response.avatar }
        setUser(updatedUser)
        storage.setUser(updatedUser)
        
        console.log('Profile photo uploaded successfully:', response)
      } catch (error) {
        console.error('Error uploading profile photo:', error)
        // Fallback to local file for preview
        setFormData(prev => ({
          ...prev,
          avatar: file
        }))
      }
    }
  }

  const handleSave = async () => {
    try {
      const token = storage.getToken()
      console.log('Token found:', !!token)
      if (!token) {
        console.error('No authentication token found')
        return
      }

      // Prepare profile data for API
      const profileData = {
        name: formData.name,
        phone: formData.phone,
        studentId: formData.studentId,
        department: formData.department,
        year: formData.year,
        bio: formData.bio,
        skills: formData.skills,
        interests: formData.interests
      }

      console.log('Sending profile data:', profileData)

      // Update profile via API
      const response = await api.updateProfile(token, profileData)
      
      console.log('API response:', response)
      
      // Update local storage with new user data
      const updatedUser = { ...user, ...response.user }
      storage.setUser(updatedUser)
      setUser(updatedUser)
      
      console.log('Profile updated successfully:', response)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      console.error('Error details:', error.message)
      // You could add error state handling here
    }
  }

  const handleCancel = () => {
    // Reset form data to original values from user data
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '+91 ',
      studentId: user?.studentId || '',
      department: user?.department || '',
      year: user?.year || '',
      bio: user?.bio || '',
      skills: user?.skills || [],
      interests: user?.interests || [],
      avatar: user?.avatar || null
    })
    setIsEditing(false)
  }

  const handleChangePassword = () => {
    setShowForgotPasswordModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading profile...
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition duration-150 ease-in-out"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture and Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="h-32 w-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {formData.avatar && formData.avatar !== 'Profile' ? (
                    <img
                      src={typeof formData.avatar === 'string' ? formData.avatar : URL.createObjectURL(formData.avatar)}
                      alt="Profile"
                      className="h-32 w-32 rounded-full object-cover"
                      onLoad={() => console.log('Student image loaded successfully:', formData.avatar)}
                      onError={(e) => {
                        console.error('Student image load error:', e);
                        console.error('Failed to load image:', formData.avatar);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-3xl font-bold text-blue-600">
                      {user?.name?.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                    <FaEdit className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditing && (
                <p className="text-sm text-gray-500 mb-4">Click the edit icon to change your profile picture</p>
              )}
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{user?.name}</h2>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition duration-150 ease-in-out"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
            {activityLoading ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Events Attended</span>
                  <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Events Organized</span>
                  <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certificates Earned</span>
                  <div className="animate-pulse bg-gray-200 h-4 w-8 rounded"></div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <div className="animate-pulse bg-gray-200 h-4 w-12 rounded"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Events Attended</span>
                  <span className="font-semibold">{activitySummary.eventsAttended}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Events Organized</span>
                  <span className="font-semibold">{activitySummary.eventsOrganized}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Certificates Earned</span>
                  <span className="font-semibold">{activitySummary.certificatesEarned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold">{activitySummary.memberSince || (user?.createdAt ? new Date(user.createdAt).getFullYear().toString() : 'N/A')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={true}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 cursor-not-allowed"
                    title="Email cannot be edited"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-sm">+91</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone.replace('+91', '')}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      onClick={() => isEditing && setShowDepartmentDropdown(!showDepartmentDropdown)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-left flex items-center justify-between"
                    >
                      <span className={formData.department ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.department || 'Select Department'}
                      </span>
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showDepartmentDropdown && isEditing && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {departments.map((dept) => (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => handleDepartmentSelect(dept)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-none transition-colors"
                          >
                            {dept}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <div className="relative dropdown-container">
                    <button
                      type="button"
                      onClick={() => isEditing && setShowYearDropdown(!showYearDropdown)}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 text-left flex items-center justify-between"
                    >
                      <span className={formData.year ? 'text-gray-900' : 'text-gray-500'}>
                        {formData.year || 'Select Year'}
                      </span>
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {showYearDropdown && isEditing && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {years.map((year) => (
                          <button
                            key={year}
                            type="button"
                            onClick={() => handleYearSelect(year)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-none transition-colors"
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills.join(', ')}
                  onChange={handleSkillChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="JavaScript, React, Python..."
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.interests.join(', ')}
                  onChange={handleInterestChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  placeholder="Web Development, AI/ML..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  )
}

export default Profile 