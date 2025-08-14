import { useState, useEffect } from 'react';
import { FaCalendarCheck, FaClock, FaCheck, FaTimes, FaEye, FaEdit, FaTrash, FaUsers, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { api, storage } from '../../../services/api';

function EventApproval() {
  const [allEvents, setAllEvents] = useState([]); // Store all events
  const [events, setEvents] = useState([]); // Store filtered events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(new Set());
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

  useEffect(() => {
    fetchEvents();
  }, []); // Only fetch once on component mount

  useEffect(() => {
    // Filter events when filter changes
    if (filter === 'all') {
      setEvents(allEvents);
    } else {
      setEvents(allEvents.filter(event => event.status === filter));
    }
  }, [filter, allEvents]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Use the admin-specific endpoint to get all events
      const response = await api.getAdminEvents({}, token);
      const allEventsData = response.events || [];
      
      // Store all events
      setAllEvents(allEventsData);
      
      // Apply current filter
      if (filter === 'all') {
        setEvents(allEventsData);
      } else {
        setEvents(allEventsData.filter(event => event.status === filter));
      }
      
    } catch (error) {
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Approving event:', eventId);
      setActionLoading(prev => new Set(prev).add(eventId));

      // Update event status to approved
      const response = await api.updateEvent(eventId, { status: 'approved' }, token);
      console.log('Update response:', response);
      
      // Show success message
      setSuccess('Event approved successfully!');
      
      // Update local state immediately for better UX
      setAllEvents(prev => prev.map(event => 
        event._id === eventId 
          ? { ...event, status: 'approved' }
          : event
      ));
      
      // Refresh the events list to get updated data
      await fetchEvents();
      
      console.log('Event approved successfully');
      
    } catch (error) {
      console.error('Error approving event:', error);
      setError(error.message || 'Failed to approve event');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleReject = async (eventId) => {
    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      setActionLoading(prev => new Set(prev).add(eventId));

      // Update event status to rejected
      await api.updateEvent(eventId, { status: 'rejected' }, token);
      
      // Show success message
      setSuccess('Event rejected successfully!');
      
      // Update local state immediately for better UX
      setAllEvents(prev => prev.map(event => 
        event._id === eventId 
          ? { ...event, status: 'rejected' }
          : event
      ));
      
      // Refresh the events list to get updated data
      await fetchEvents();
      
      console.log('Event rejected successfully');
      
    } catch (error) {
      console.error('Error rejecting event:', error);
      setError(error.message || 'Failed to reject event');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const token = storage.getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      setActionLoading(prev => new Set(prev).add(eventId));

      await api.deleteEvent(eventId, token);
      
      // Show success message
      setSuccess('Event deleted successfully!');
      
      // Update local state immediately for better UX
      setAllEvents(prev => prev.filter(event => event._id !== eventId));
      
      // Refresh the events list to get updated data
      await fetchEvents();
      
      console.log('Event deleted successfully');
      
    } catch (error) {
      console.error('Error deleting event:', error);
      setError(error.message || 'Failed to delete event');
    } finally {
      setActionLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Events will be filtered automatically by the useEffect
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
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

  const getStats = () => {
    const stats = {
      pending: allEvents.filter(e => e.status === 'pending').length,
      approved: allEvents.filter(e => e.status === 'approved').length,
      rejected: allEvents.filter(e => e.status === 'rejected').length,
      total: allEvents.length
    };
    
    // Debug logging
    console.log('All events count:', allEvents.length);
    console.log('Stats calculated:', stats);
    console.log('Current filter:', filter);
    console.log('Filtered events count:', events.length);
    
    return stats;
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Event Management</h1>
        <p className="text-gray-600 mt-2">Review and manage all event requests</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
              <FaClock className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Events</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
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
              <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-500 bg-opacity-10">
              <FaCalendarCheck className="h-6 w-6 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Events', count: stats.total },
              { key: 'pending', label: 'Pending', count: stats.pending },
              { key: 'approved', label: 'Approved', count: stats.approved },
              { key: 'rejected', label: 'Rejected', count: stats.rejected }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleFilterChange(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium ${
                  filter === tab.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Events List */}
        <div className="p-6">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'No events found' 
                  : `No ${filter} events found`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event._id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{event.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
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
                          <span>
                            {event.currentParticipants || 0}
                            {event.maxParticipants ? ` / ${event.maxParticipants}` : ''} participants
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-500">
                        <span className="capitalize">{event.eventType}</span> • <span className="capitalize">{event.category}</span>
                        {event.coordinator && (
                          <span> • Coordinator: {event.coordinator.name || event.coordinator.email}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50"
                        title="View Details"
                      >
                        <FaEye className="h-4 w-4" />
                      </button>
                      
                      {event.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(event._id)}
                            disabled={actionLoading.has(event._id)}
                            className="text-green-600 hover:text-green-900 p-2 rounded-md hover:bg-green-50 disabled:opacity-50"
                            title="Approve Event"
                          >
                            {actionLoading.has(event._id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <FaCheck className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(event._id)}
                            disabled={actionLoading.has(event._id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 disabled:opacity-50"
                            title="Reject Event"
                          >
                            {actionLoading.has(event._id) ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <FaTimes className="h-4 w-4" />
                            )}
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDelete(event._id)}
                        disabled={actionLoading.has(event._id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 disabled:opacity-50"
                        title="Delete Event"
                      >
                        {actionLoading.has(event._id) ? (
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
          )}
        </div>
      </div>

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
              {selectedEvent.coordinator && (
                <div>
                  <span className="font-medium text-gray-700">Coordinator:</span>
                  <p className="text-gray-600">{selectedEvent.coordinator.name || selectedEvent.coordinator.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventApproval; 