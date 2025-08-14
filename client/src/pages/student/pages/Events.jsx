import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaSearch, FaFilter, FaRegHeart, FaHeart } from 'react-icons/fa';
import { api, storage } from '../../../services/api';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [registrationLoading, setRegistrationLoading] = useState(new Set());

  useEffect(() => {
    fetchEvents();
    fetchRegisteredEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.getEvents();
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      const token = storage.getToken();
      if (!token) return;

      const response = await api.getStudentEvents(token);
      const registeredIds = new Set(response.events?.map(event => event._id) || []);
      setRegisteredEvents(registeredIds);
    } catch (error) {
      console.error('Error fetching registered events:', error);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Please log in to register for events');
      }

      setRegistrationLoading(prev => new Set(prev).add(eventId));

      await api.registerForEvent(eventId, token);
      
      // Update local state
      setRegisteredEvents(prev => new Set(prev).add(eventId));
      
      // Update event participant count
      setEvents(prev => prev.map(event => 
        event._id === eventId 
          ? { ...event, currentParticipants: (event.currentParticipants || 0) + 1 }
          : event
      ));

      // Show success message (you could add a toast notification here)
      console.log('Successfully registered for event');
      
    } catch (error) {
      console.error('Error registering for event:', error);
      alert(error.message || 'Failed to register for event');
    } finally {
      setRegistrationLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Please log in to unregister from events');
      }

      setRegistrationLoading(prev => new Set(prev).add(eventId));

      await api.unregisterFromEvent(eventId, token);
      
      // Update local state
      setRegisteredEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
      
      // Update event participant count
      setEvents(prev => prev.map(event => 
        event._id === eventId 
          ? { ...event, currentParticipants: Math.max(0, (event.currentParticipants || 0) - 1) }
          : event
      ));

      console.log('Successfully unregistered from event');
      
    } catch (error) {
      console.error('Error unregistering from event:', error);
      alert(error.message || 'Failed to unregister from event');
    } finally {
      setRegistrationLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const filteredEvents = events.filter(event => {
    // Apply search filter
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply category filter
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      technology: 'bg-blue-100 text-blue-800',
      business: 'bg-green-100 text-green-800',
      arts: 'bg-purple-100 text-purple-800',
      sports: 'bg-orange-100 text-orange-800',
      academic: 'bg-indigo-100 text-indigo-800',
      social: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Events</h1>
        <p className="mt-2 text-gray-600">Discover and register for exciting campus events</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex-shrink-0">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
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
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FaCalendarAlt className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Check back later for upcoming events'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRegistered = registeredEvents.has(event._id);
            const isFull = event.maxParticipants && event.currentParticipants >= event.maxParticipants;
            const isLoading = registrationLoading.has(event._id);
            
            return (
              <div key={event._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Event Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <FaCalendarAlt className="h-16 w-16 text-white opacity-80" />
                </div>

                {/* Event Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {event.eventType}
                    </span>
                  </div>

                  {/* Event Title and Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-2 h-4 w-4" />
                      <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaMapMarkerAlt className="mr-2 h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaUsers className="mr-2 h-4 w-4" />
                      <span>
                        {event.currentParticipants || 0}
                        {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants
                      </span>
                    </div>
                  </div>

                  {/* Registration Button */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => isRegistered ? handleUnregister(event._id) : handleRegister(event._id)}
                      disabled={isLoading || isFull}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        isRegistered
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : isFull
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      } disabled:opacity-50`}
                    >
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                      ) : isRegistered ? (
                        'Unregister'
                      ) : isFull ? (
                        'Event Full'
                      ) : (
                        'Register'
                      )}
                    </button>
                    
                    {/* Heart Icon */}
                    <button className="ml-3 p-2 text-gray-400 hover:text-red-500 transition-colors">
                      {isRegistered ? <FaHeart className="h-5 w-5 text-red-500" /> : <FaRegHeart className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Events; 