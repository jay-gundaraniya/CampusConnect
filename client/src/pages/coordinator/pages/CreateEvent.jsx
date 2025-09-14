import { useState } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaSave, FaTimes } from 'react-icons/fa';
import { api, storage } from '../../../services/api';

function CreateEvent() {
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
  const [eventImage, setEventImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number with +91 prefix (same as student profile)
    if (name === 'contactPhone') {
      // Only allow numeric input and limit to 10 digits
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setEventImage(null);
    setImagePreview(null);
  };

  const handleCancel = () => {
    setFormData({
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
    setEventImage(null);
    setImagePreview(null);
    setError('');
    setSuccess('');
    setPhoneError('');
  };

  const validatePhone = (phone) => {
    if (!phone) return '';
    
    // Remove +91 prefix and spaces to get just the digits
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
      // Remove +91 prefix and spaces to get just the digits
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

      // Call API to create event
      let response;
      if (eventImage) {
        // Create event with image
        response = await api.createEventWithImage(eventData, eventImage, token);
      } else {
        // Create event without image
        response = await api.createEvent(eventData, token);
      }
      
      setSuccess(response.message || 'Event created successfully! It will be reviewed by admin.');
      
      // Reset form
      setFormData({
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
      setEventImage(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-2">Fill in the details below to create a new event</p>
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

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                Event Type *
              </label>
              <select
                id="eventType"
                name="eventType"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.eventType}
                onChange={handleChange}
              >
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="conference">Conference</option>
                <option value="competition">Competition</option>
                <option value="cultural">Cultural Event</option>
                <option value="sports">Sports Event</option>
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
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="technology">Technology</option>
                <option value="business">Business</option>
                <option value="arts">Arts & Culture</option>
                <option value="sports">Sports</option>
                <option value="academic">Academic</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Participants
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.maxParticipants}
                onChange={handleChange}
                placeholder="Enter max participants"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Event Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event in detail..."
            />
          </div>
        </div>

        {/* Event Image */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Event Image</h2>
          <div className="space-y-4">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Event preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Upload an event image (optional)</p>
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  Choose Image
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Event Time *
              </label>
              <input
                type="time"
                id="time"
                name="time"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Event Location *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location (e.g., Main Auditorium, Room 101)"
            />
          </div>
        </div>

        {/* Requirements */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements & Additional Info</h2>
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
              Requirements (Optional)
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Any specific requirements for participants..."
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Creating Event...
              </>
            ) : (
              <>
                <FaSave className="mr-2 h-4 w-4" />
                Create Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateEvent; 