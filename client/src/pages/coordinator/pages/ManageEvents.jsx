import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';

function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockEvents = [
        {
          id: 1,
          title: 'Tech Workshop 2024',
          description: 'A comprehensive workshop on modern web technologies.',
          date: '2024-02-15',
          time: '10:00 AM',
          location: 'Main Auditorium',
          status: 'active',
          participants: 45,
          maxParticipants: 50,
          eventType: 'workshop',
          category: 'technology'
        },
        {
          id: 2,
          title: 'Cultural Festival',
          description: 'Annual cultural festival showcasing student talents.',
          date: '2024-02-20',
          time: '6:00 PM',
          location: 'Open Air Theater',
          status: 'pending',
          participants: 120,
          maxParticipants: 150,
          eventType: 'cultural',
          category: 'arts'
        },
        {
          id: 3,
          title: 'Career Fair',
          description: 'Connect with top companies and explore career opportunities.',
          date: '2024-02-25',
          time: '2:00 PM',
          location: 'Conference Hall',
          status: 'draft',
          participants: 0,
          maxParticipants: 200,
          eventType: 'conference',
          category: 'business'
        }
      ];
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    // TODO: Navigate to edit event page
    console.log('Edit event:', event);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      // TODO: Implement delete API call
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const handleViewEvent = (event) => {
    setSelectedEvent(event);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
          <p className="text-gray-600 mt-2">View and manage all your created events</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Create New Event
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Events</h2>
          </div>
          <div className="p-6">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No events found</p>
                <p className="text-sm text-gray-400 mt-2">Create your first event to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <p className="text-gray-600 mt-1">{event.description}</p>
                        <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <FaCalendarAlt className="h-4 w-4 mr-1" />
                            {event.date} at {event.time}
                          </span>
                          <span className="flex items-center">
                            <FaMapMarkerAlt className="h-4 w-4 mr-1" />
                            {event.location}
                          </span>
                          <span className="flex items-center">
                            <FaUsers className="h-4 w-4 mr-1" />
                            {event.participants}/{event.maxParticipants} participants
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        <span className="capitalize">{event.eventType}</span> • <span className="capitalize">{event.category}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewEvent(event)}
                          className="text-blue-600 hover:text-blue-900 p-2"
                          title="View Event"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-green-600 hover:text-green-900 p-2"
                          title="Edit Event"
                        >
                          <FaEdit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900 p-2"
                          title="Delete Event"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-600">{selectedEvent.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Date & Time:</span>
                  <p className="text-gray-600">{selectedEvent.date} at {selectedEvent.time}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-600">{selectedEvent.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Participants:</span>
                  <p className="text-gray-600">{selectedEvent.participants}/{selectedEvent.maxParticipants}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-gray-600 capitalize">{selectedEvent.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageEvents; 