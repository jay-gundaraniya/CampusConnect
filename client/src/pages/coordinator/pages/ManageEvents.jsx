import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { api, storage } from '../../../services/api';

function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await api.getCoordinatorEvents(token);
      setEvents(response.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    // Navigate to edit event page with event data
    navigate('/coordinator/edit-event', { state: { event } });
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(eventId);
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      await api.deleteEvent(eventId, token);
      setEvents(events.filter(event => event._id !== eventId));
      // setSuccess('Event deleted successfully'); // This state was not defined in the original file
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.message || 'Failed to delete event');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <p className="text-gray-600 mt-2">View and manage all your created events</p>
        </div>
        <button
          onClick={() => navigate('/coordinator/create-event')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Create New Event
        </button>
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

      {events.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FaCalendarAlt className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first event.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/coordinator/create-event')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="-ml-1 mr-2 h-5 w-5" />
              Create Event
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{event.title}</h3>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center text-sm text-gray-500 space-x-6">
                      <div className="flex items-center">
                        <FaCalendarAlt className="mr-2 h-4 w-4" />
                        <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
                      </div>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-2 h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <FaUsers className="mr-2 h-4 w-4" />
                        <span>{event.currentParticipants || 0}{event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="capitalize">{event.eventType}</span> • <span className="capitalize">{event.category}</span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleViewEvent(event)}
                      className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                      title="View Event"
                    >
                      <FaEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-50"
                      title="Edit Event"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      disabled={deleteLoading === event._id}
                      className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 disabled:opacity-50"
                      title="Delete Event"
                    >
                      {deleteLoading === event._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <FaTrash className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">{selectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Date & Time:</span>
                  <p className="text-gray-600">{formatDate(selectedEvent.date)} at {formatTime(selectedEvent.date)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-600">{selectedEvent.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Participants:</span>
                  <p className="text-gray-600">{selectedEvent.currentParticipants || 0}{selectedEvent.maxParticipants ? ` / ${selectedEvent.maxParticipants}` : ''}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-gray-600 capitalize">{selectedEvent.status}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-600 capitalize">{selectedEvent.eventType}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="text-gray-600 capitalize">{selectedEvent.category}</p>
                </div>
              </div>
              {selectedEvent.requirements && (
                <div>
                  <span className="font-medium text-gray-700">Requirements:</span>
                  <p className="text-gray-600">{selectedEvent.requirements}</p>
                </div>
              )}
              {selectedEvent.contactEmail && (
                <div>
                  <span className="font-medium text-gray-700">Contact Email:</span>
                  <p className="text-gray-600">{selectedEvent.contactEmail}</p>
                </div>
              )}
              {selectedEvent.contactPhone && (
                <div>
                  <span className="font-medium text-gray-700">Contact Phone:</span>
                  <p className="text-gray-600">{selectedEvent.contactPhone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageEvents; 