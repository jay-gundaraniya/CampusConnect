import { useState } from 'react';
import { FaCalendarCheck, FaClock, FaCheck, FaTimes } from 'react-icons/fa';

function EventApproval() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Placeholder data for demonstration
  const placeholderEvents = [
    {
      id: 1,
      title: 'Tech Workshop 2024',
      organizer: 'John Doe',
      date: '2024-02-15',
      time: '10:00 AM',
      location: 'Main Auditorium',
      description: 'A comprehensive workshop on modern web technologies.',
      status: 'pending'
    },
    {
      id: 2,
      title: 'Cultural Festival',
      organizer: 'Jane Smith',
      date: '2024-02-20',
      time: '6:00 PM',
      location: 'Open Air Theater',
      description: 'Annual cultural festival showcasing student talents.',
      status: 'pending'
    }
  ];

  const handleApprove = (eventId) => {
    // TODO: Implement approval logic
    console.log('Approving event:', eventId);
  };

  const handleReject = (eventId) => {
    // TODO: Implement rejection logic
    console.log('Rejecting event:', eventId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Event Approval</h1>
        <p className="text-gray-600 mt-2">Review and approve pending event requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
              <FaClock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Events</p>
              <p className="text-2xl font-semibold text-gray-900">{placeholderEvents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
              <FaCheck className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved Events</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-500 bg-opacity-10">
              <FaTimes className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected Events</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Pending Events</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading events...</p>
            </div>
          ) : placeholderEvents.length === 0 ? (
            <div className="text-center py-8">
              <FaCalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No pending events to review</p>
              <p className="text-sm text-gray-400 mt-2">New event requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {placeholderEvents.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">Organized by {event.organizer}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date & Time</p>
                      <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Location</p>
                      <p className="text-sm text-gray-600">{event.location}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Description</p>
                    <p className="text-sm text-gray-600">{event.description}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(event.id)}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      <FaCheck className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(event.id)}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      <FaTimes className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventApproval; 