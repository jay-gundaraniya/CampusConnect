const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// API service functions
export const api = {
  // Health check
  health: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },

  // Authentication
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  googleAuth: async (googleData) => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleData),
    });
    return handleResponse(response);
  },

  // User profile
  getProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  },

  updateProfile: async (token, profileData) => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  uploadProfilePhoto: async (token, file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await fetch(`${API_BASE_URL}/auth/profile/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  // Password reset
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
    return handleResponse(response);
  },

  // Events API
  getEvents: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/events?${queryParams}`);
    return handleResponse(response);
  },

  getAdminEvents: async (filters = {}, token) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/events/admin/all?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getEvent: async (eventId) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`);
    return handleResponse(response);
  },

  createEvent: async (eventData, token) => {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  createEventWithImage: async (eventData, imageFile, token) => {
    const formData = new FormData();
    
    // Append all event data fields
    Object.keys(eventData).forEach(key => {
      formData.append(key, eventData[key]);
    });
    
    // Append the image file
    formData.append('image', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/events/with-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse(response);
  },

  updateEvent: async (eventId, eventData, token) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(eventData),
    });
    return handleResponse(response);
  },

  deleteEvent: async (eventId, token) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  registerForEvent: async (eventId, token) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  unregisterFromEvent: async (eventId, token) => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getCoordinatorEvents: async (token) => {
    const response = await fetch(`${API_BASE_URL}/events/coordinator/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getStudentEvents: async (token) => {
    const response = await fetch(`${API_BASE_URL}/events/student/registered`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getStudentActivitySummary: async (token) => {
    const response = await fetch(`${API_BASE_URL}/student/activity-summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Student Dashboard API
  getStudentDashboardData: async (token) => {
    const response = await fetch(`${API_BASE_URL}/student/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Coordinator Dashboard API
  getCoordinatorDashboardData: async (token) => {
    const response = await fetch(`${API_BASE_URL}/coordinator/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getUpcomingEvents: async (token) => {
    const response = await fetch(`${API_BASE_URL}/events?status=approved`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Certificates API
  getCertificates: async (token) => {
    const response = await fetch(`${API_BASE_URL}/certificates`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  getStudentCertificates: async (studentId, token) => {
    const response = await fetch(`${API_BASE_URL}/certificates/student/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  generateCertificates: async (eventId, grades, token) => {
    const response = await fetch(`${API_BASE_URL}/certificates/generate/${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ grades }),
    });
    return handleResponse(response);
  },

  downloadCertificate: async (certificateId, token) => {
    const response = await fetch(`${API_BASE_URL}/certificates/download/${certificateId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  verifyCertificate: async (certificateId) => {
    const response = await fetch(`${API_BASE_URL}/certificates/verify/${certificateId}`);
    return handleResponse(response);
  },

  // Role switching
  switchRole: async (role, token) => {
    const response = await fetch(`${API_BASE_URL}/auth/switch-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });
    return handleResponse(response);
  },

  // Coordinator management
  getStudents: async (token) => {
    const response = await fetch(`${API_BASE_URL}/coordinator/students`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  promoteStudent: async (studentId, token) => {
    const response = await fetch(`${API_BASE_URL}/coordinator/promote-student`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ studentId }),
    });
    return handleResponse(response);
  },

  demoteCoordinator: async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/coordinator/demote-coordinator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
  },
};

// Local storage helpers
export const storage = {
  setToken: (token) => {
    localStorage.setItem('campusconnect_token', token);
  },

  getToken: () => {
    return localStorage.getItem('campusconnect_token');
  },

  removeToken: () => {
    localStorage.removeItem('campusconnect_token');
  },

  setUser: (user) => {
    localStorage.setItem('campusconnect_user', JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem('campusconnect_user');
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem('campusconnect_user');
  },

  clear: () => {
    localStorage.removeItem('campusconnect_token');
    localStorage.removeItem('campusconnect_user');
  },
}; 