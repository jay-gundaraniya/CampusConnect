import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSave, FaEdit, FaTimes, FaLock } from 'react-icons/fa';
import { storage, api } from '../../../services/api';
import ForgotPasswordModal from '../../../components/ForgotPasswordModal';

function Profile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '+91 ',
    department: '',
    position: '',
    bio: '',
    avatar: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = storage.getToken();
      if (token) {
        const response = await api.getProfile(token);
        const userData = response.user;
        setProfile({
          name: userData?.name || '',
          email: userData?.email || '',
          phone: userData?.phone || '+91 ',
          department: userData?.department || '',
          position: userData?.position || '',
          bio: userData?.bio || '',
          avatar: userData?.avatar || null
        });
        console.log('Coordinator profile data loaded:', userData);
        console.log('Coordinator avatar value:', userData?.avatar);
        console.log('Coordinator avatar type:', typeof userData?.avatar);
      } else {
        // Fallback to local storage
        const userData = storage.getUser();
        if (userData) {
          setProfile({
            name: userData.name || 'Coordinator Name',
            email: userData.email || 'coordinator@example.com',
            phone: '+91 9876543210',
            department: 'Computer Science',
            position: 'Event Coordinator',
            bio: 'Experienced event coordinator with a passion for organizing engaging campus events and fostering student participation.',
            avatar: null
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to local storage on error
      const userData = storage.getUser();
      if (userData) {
        setProfile({
          name: userData.name || 'Coordinator Name',
          email: userData.email || 'coordinator@example.com',
          phone: '+91 9876543210',
          department: 'Computer Science',
          position: 'Event Coordinator',
          bio: 'Experienced event coordinator with a passion for organizing engaging campus events and fostering student participation.',
          avatar: null
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number with +91 prefix
    if (name === 'phone') {
      // Only allow numeric input and limit to 10 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setProfile(prev => ({
        ...prev,
        [name]: '+91 ' + numericValue
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    console.log('Coordinator file selected:', file);
    if (file) {
      try {
        const token = storage.getToken();
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        console.log('Coordinator uploading photo to server...');
        // Upload photo to server
        const response = await api.uploadProfilePhoto(token, file);
        
        console.log('Coordinator upload response:', response);
        
        // Update profile with server path
        setProfile(prev => ({
          ...prev,
          avatar: response.avatar
        }));
        
        console.log('Coordinator profile photo uploaded successfully:', response);
      } catch (error) {
        console.error('Error uploading coordinator profile photo:', error);
        // Fallback to local file for preview
        setProfile(prev => ({
          ...prev,
          avatar: file
        }));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = storage.getToken();
      console.log('Coordinator token found:', !!token);
      if (!token) {
        setError('No authentication token found');
        return;
      }

      // Prepare profile data for API
      const profileData = {
        name: profile.name,
        phone: profile.phone,
        department: profile.department,
        position: profile.position,
        bio: profile.bio
      };

      console.log('Sending coordinator profile data:', profileData);

      // Update profile via API
      const response = await api.updateProfile(token, profileData);
      
      console.log('Coordinator API response:', response);
      
      // Update local storage with new user data
      const userData = storage.getUser();
      const updatedUser = { ...userData, ...response.user };
      storage.setUser(updatedUser);
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating coordinator profile:', err);
      console.error('Error details:', err.message);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchProfile(); // Reset to original data
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleChangePassword = () => {
    setShowForgotPasswordModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Management</h1>
          <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaEdit className="mr-2 h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  {profile.avatar && profile.avatar !== 'Profile' ? (
                    <img
                      src={typeof profile.avatar === 'string' ? profile.avatar : URL.createObjectURL(profile.avatar)}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                      onLoad={() => console.log('Coordinator image loaded successfully:', profile.avatar)}
                      onError={(e) => {
                        console.error('Coordinator image load error:', e);
                        console.error('Failed to load image:', profile.avatar);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <FaUser className="h-16 w-16 text-gray-400" />
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
                <p className="text-sm text-gray-500">Click the edit icon to change your profile picture</p>
              )}
              
              {/* Change Password Button */}
              <div className="mt-4">
                <button
                  onClick={handleChangePassword}
                  className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition duration-150 ease-in-out"
                >
                  <FaLock className="mr-2 h-4 w-4" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+91</span>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profile.phone.replace(/^\+91\s*/, '')}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={profile.department}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={profile.position}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={profile.bio}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaTimes className="mr-2 h-4 w-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <FaSave className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
}

export default Profile; 