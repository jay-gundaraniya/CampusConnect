import { useState, useEffect } from 'react';
import { FaUsers, FaSearch, FaDownload, FaEye, FaTrash, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { api, storage } from '../../../services/api';

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [actionLoading, setActionLoading] = useState(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Fetch coordinator's events
      const eventsResponse = await api.getCoordinatorEvents(token);
      const coordinatorEvents = eventsResponse.events || [];
      setEvents(coordinatorEvents);

      // Fetch participants for all events
      const allParticipants = [];
      for (const event of coordinatorEvents) {
        if (event.participants && event.participants.length > 0) {
          const eventParticipants = event.participants.map(participant => ({
            _id: participant._id || participant.student?._id,
            name: participant.student?.name || 'Unknown Student',
            email: participant.student?.email || 'No email',
            studentId: participant.student?.studentId || 'N/A',
            eventId: event._id,
            eventTitle: event.title,
            registrationDate: new Date(participant.registeredAt || Date.now()).toLocaleDateString(),
            status: participant.status || 'registered',
            eventDate: event.date,
            eventLocation: event.location,
            eventType: event.eventType,
            eventCategory: event.category
          }));
          allParticipants.push(...eventParticipants);
        }
      }
      
      setParticipants(allParticipants);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message || 'Failed to fetch participants data');
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participants.filter(participant => {
    const matchesEvent = !selectedEvent || participant.eventId === selectedEvent;
    const matchesSearch = participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEvent && matchesSearch;
  });

  const handleRemoveParticipant = async (participantId, eventId) => {
    if (!window.confirm('Are you sure you want to remove this participant from the event?')) {
      return;
    }

    try {
      setActionLoading(prev => new Set(prev).add(participantId));
      
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Unregister participant from event
      await api.unregisterFromEvent(eventId, token);
      
      // Update local state
      setParticipants(prev => prev.filter(p => p._id !== participantId));
      
      setSuccess('Participant removed successfully');
      
      // Refresh data to ensure consistency
      setTimeout(() => {
        fetchData();
      }, 1000);
      
    } catch (error) {
      console.error('Error removing participant:', error);
      setError(error.message || 'Failed to remove participant');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });
    }
  };

  const exportParticipants = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Student ID', 'Event', 'Registration Date', 'Status'];
      const csvContent = [
        headers.join(','),
        ...filteredParticipants.map(p => [
          `"${p.name}"`,
          `"${p.email}"`,
          `"${p.studentId}"`,
          `"${p.eventTitle}"`,
          `"${p.registrationDate}"`,
          `"${p.status}"`
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `participants_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess('Participants exported successfully');
    } catch (error) {
      console.error('Error exporting participants:', error);
      setError('Failed to export participants');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'attended':
        return 'bg-green-100 text-green-800';
      case 'no-show':
        return 'bg-red-100 text-red-800';
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Participants</h1>
        <p className="text-gray-600 mt-2">View and manage participants for your events</p>
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

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">{success}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1">
              <label htmlFor="eventFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Event
              </label>
              <select
                id="eventFilter"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Events</option>
                {events.map(event => (
                  <option key={event._id} value={event._id}>{event.title}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Participants
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by name, email, or student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          <button
            onClick={exportParticipants}
            disabled={filteredParticipants.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload className="mr-2 h-4 w-4" />
            Export ({filteredParticipants.length})
          </button>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Participants ({filteredParticipants.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading participants...</p>
                  </td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No participants found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {selectedEvent || searchTerm ? 'Try adjusting your filters' : 'No participants have registered for your events yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map((participant) => (
                  <tr key={participant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                        <div className="text-sm text-gray-500">{participant.email}</div>
                        <div className="text-xs text-gray-400">ID: {participant.studentId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">{participant.eventTitle}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1 h-3 w-3" />
                          {formatDate(participant.eventDate)} at {formatTime(participant.eventDate)}
                        </div>
                        <div className="flex items-center mt-1">
                          <FaMapMarkerAlt className="mr-1 h-3 w-3" />
                          {participant.eventLocation}
                        </div>
                        <div className="mt-1">
                          <span className="capitalize">{participant.eventType}</span> • <span className="capitalize">{participant.eventCategory}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{participant.registrationDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(participant.status)}`}>
                        {participant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setSelectedParticipant(participant)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveParticipant(participant._id, participant.eventId)}
                          disabled={actionLoading.has(participant._id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 disabled:opacity-50"
                          title="Remove Participant"
                        >
                          {actionLoading.has(participant._id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <FaTrash className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Participant Details Modal */}
      {selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Participant Details</h2>
              <button
                onClick={() => setSelectedParticipant(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-600">{selectedParticipant.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-600">{selectedParticipant.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Student ID:</span>
                  <p className="text-gray-600">{selectedParticipant.studentId}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <p className="text-gray-600 capitalize">{selectedParticipant.status}</p>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Event:</span>
                <p className="text-gray-600 font-medium">{selectedParticipant.eventTitle}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Event Date:</span>
                  <p className="text-gray-600">{formatDate(selectedParticipant.eventDate)} at {formatTime(selectedParticipant.eventDate)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-600">{selectedParticipant.eventLocation}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Event Type:</span>
                  <p className="text-gray-600 capitalize">{selectedParticipant.eventType}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <p className="text-gray-600 capitalize">{selectedParticipant.eventCategory}</p>
                </div>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Registration Date:</span>
                <p className="text-gray-600">{selectedParticipant.registrationDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Participants; 