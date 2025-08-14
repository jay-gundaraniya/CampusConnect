import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaSave, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { api, storage } from '../../../services/api';

function EditEvent() {
  const navigate = useNavigate();
  const location = useLocation();
  const event = location.state?.event;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
    eventType: 'workshop',
    category: 'technology',
    requirements: '',
    contactEmail: '',
    contactPhone: '+91 '
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (!event) {
      navigate('/coordinator/manage-events');
      return;
    }

    // Parse the event date and time
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toISOString().split('T')[0];
    const timeStr = eventDate.toTimeString().slice(0, 5);

    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: dateStr,
      time: timeStr,
      location: event.location || '',
      maxParticipants: event.maxParticipants ? event.maxParticipants.toString() : '',
      eventType: event.eventType || 'workshop',
      category: event.category || 'technology',
      requirements: event.requirements || '',
      contactEmail: event.contactEmail || '',
      contactPhone: event.contactPhone || '+91 '
    });
  }, [event, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number with +91 prefix
    if (name === 'contactPhone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: '+91 ' + numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear phone error when user starts typing
    if (name === 'contactPhone' && phoneError) {
      setPhoneError('');
    }
  };

  const handleCancel = () => {
    navigate('/coordinator/manage-events');
  };

  const validatePhone = (phone) => {
    if (!phone) return '';
    
    const digits = phone.replace('+91 ', '').replace(/\D/g, '');
    
    if (digits.length !== 10) {
      return 'Phone number must be exactly 10 digits';
    }
    
    return '';
  };

  const handlePhoneBlur = (e) => {
    const phoneError = validatePhone(e.target.value);
    setPhoneError(phoneError);
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push('Event title is required');
    }
    
    if (!formData.description.trim()) {
      errors.push('Event description is required');
    }
    
    if (!formData.date) {
      errors.push('Event date is required');
    }
    
    if (!formData.time) {
      errors.push('Event time is required');
    }
    
    if (!formData.location.trim()) {
      errors.push('Event location is required');
    }
    
    // Check if date is in the future
    if (formData.date && formData.time) {
      const eventDateTime = new Date(formData.date + 'T' + formData.time);
      const now = new Date();
      if (eventDateTime <= now) {
        errors.push('Event date and time must be in the future');
      }
    }
    
    // Check max participants
    if (formData.maxParticipants && parseInt(formData.maxParticipants) <= 0) {
      errors.push('Maximum participants must be greater than 0');
    }
    
    // Validate contact email if provided
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.push('Please enter a valid contact email address');
    }
    
    // Validate contact phone if provided
    if (formData.contactPhone) {
      const digits = formData.contactPhone.replace('+91 ', '').replace(/\D/g, '');
      
      if (digits.length !== 10) {
        errors.push('Phone number must be exactly 10 digits');
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check for phone validation error
      if (phoneError) {
        throw new Error('Please fix the phone number format before submitting');
      }
      
      // Validate form
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      // Get token from storage
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Prepare event data
      const eventData = {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        date: new Date(formData.date + 'T' + formData.time).toISOString()
      };

      // Call API to update event
      const response = await api.updateEvent(event._id, eventData, token);
      
      setSuccess(response.message || 'Event updated successfully! It will be reviewed by admin.');
      
      // Navigate back to manage events after a short delay
      setTimeout(() => {
        navigate('/coordinator/manage-events');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating event:', error);
      setError(error.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={handleCancel}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FaArrowLeft className="mr-2 h-4 w-4" />
          Back to Manage Events
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600 mt-2">Update your event details</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Event Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event in detail"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Event Date *
            </label>
            <div className="relative">
              <input
                type="date"
                id="date"
                name="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <FaCalendarAlt className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
              Event Time *
            </label>
            <input
              type="time"
              id="time"
              name="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <input
                type="text"
                id="location"
                name="location"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter event location"
                required
              />
              <FaMapMarkerAlt className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>

          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Participants
            </label>
            <div className="relative">
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="Leave empty for unlimited"
              />
              <FaUsers className="absolute right-3 top-3 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Event Classification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
              Event Type *
            </label>
            <select
              id="eventType"
              name="eventType"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.eventType}
              onChange={handleChange}
              required
            >
              <option value="workshop">Workshop</option>
              <option value="seminar">Seminar</option>
              <option value="conference">Conference</option>
              <option value="competition">Competition</option>
              <option value="cultural">Cultural</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="arts">Arts</option>
              <option value="sports">Sports</option>
              <option value="academic">Academic</option>
              <option value="social">Social</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Additional Details */}
        <div className="mb-6">
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
            Requirements
          </label>
          <textarea
            id="requirements"
            name="requirements"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.requirements}
            onChange={handleChange}
            placeholder="Any specific requirements for participants"
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">+91</span>
              </div>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone.replace('+91 ', '')}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                placeholder="Enter phone number"
                className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  phoneError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-sm text-red-600">{phoneError}</p>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <FaTimes className="mr-2 h-4 w-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Event...
              </>
            ) : (
              <>
                <FaSave className="mr-2 h-4 w-4" />
                Update Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditEvent; 