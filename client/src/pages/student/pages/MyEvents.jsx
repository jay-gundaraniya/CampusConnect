import { useState, useEffect } from 'react'
import { api, storage } from '../../../services/api'

function MyEvents() {
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('registered')
  const [unregisterLoading, setUnregisterLoading] = useState(new Set())
  const [viewingEvent, setViewingEvent] = useState(null)

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const token = storage.getToken()
        if (!token) {
          setMyEvents([])
          setLoading(false)
          return
        }
        const response = await api.getStudentEvents(token)
        // API returns events with Mongo _id; normalize and compute status for tabs
        const now = new Date()
        const normalized = (response.events || []).map(e => ({
          ...e,
          id: e._id,
          // Mark completed if date is past; otherwise registered
          status: new Date(e.date) < now ? 'completed' : 'registered',
          isOrganizer: false
        }))
        setMyEvents(normalized)
      } catch (err) {
        console.error('Failed to load my events', err)
        setMyEvents([])
      } finally {
        setLoading(false)
      }
    }
    fetchMyEvents()
  }, [])

  const handleEditEvent = (eventId) => {
    console.log('Editing event:', eventId)
    // Navigate to edit event page
  }

  const handleDeleteEvent = (eventId) => {
    console.log('Deleting event:', eventId)
    // Show confirmation dialog and delete event
  }

  const handleViewParticipants = (eventId) => {
    console.log('Viewing participants for event:', eventId)
    // Navigate to participants page
  }

  const filteredEvents = myEvents.filter(event => {
    if (activeTab === 'registered') return event.status === 'registered'
    if (activeTab === 'completed') return event.status === 'completed'
    return true
  })

  const handleUnregister = async (eventId) => {
    try {
      const token = storage.getToken()
      if (!token) return
      setUnregisterLoading(prev => new Set(prev).add(eventId))
      await api.unregisterFromEvent(eventId, token)
      setMyEvents(prev => prev.filter(e => e.id !== eventId))
    } catch (err) {
      console.error('Failed to unregister', err)
      alert(err.message || 'Failed to unregister')
    } finally {
      setUnregisterLoading(prev => { const ns = new Set(prev); ns.delete(eventId); return ns })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading your events...
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <p className="mt-2 text-gray-600">Manage your events and registrations</p>
      </div>

      {/* Tabs (Organizing removed) */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('registered')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'registered'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Registered
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Completed
            </button>
          </nav>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="md:flex">
              <div className="md:flex-shrink-0">
                <img
                  className="h-48 w-full object-cover md:w-48"
                  src={event.image}
                  alt={event.title}
                />
              </div>
              <div className="p-6 w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {event.category}
                    </span>
                    {event.isOrganizer && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Organizer
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.status === 'registered' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {event.currentParticipants}/{event.maxParticipants} participants
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <div className="text-gray-500">Requirements</div>
                    <div className="text-gray-800 whitespace-pre-wrap">{event.requirements || 'None'}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Contact</div>
                    <div className="text-gray-800">{event.contactEmail || 'N/A'}{event.contactPhone ? ` • ${event.contactPhone}` : ''}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {event.status === 'registered' && (
                    <>
                      <button
                        onClick={() => setViewingEvent(event)}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleUnregister(event.id)}
                        disabled={unregisterLoading.has(event.id)}
                        className={`px-4 py-2 text-white text-sm font-medium rounded-md transition ${unregisterLoading.has(event.id) ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
                      >
                        {unregisterLoading.has(event.id) ? 'Unregistering...' : 'Unregister'}
                      </button>
                    </>
                  )}
                  {event.status === 'completed' && (
                    <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition duration-150 ease-in-out">
                      View Certificate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'registered' && "You don't have any registered events."}
            {activeTab === 'completed' && "You don't have any completed events."}
          </p>
        </div>
      )}

      {/* Details Modal */}
      {viewingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-40" onClick={() => setViewingEvent(null)}></div>
          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Title</div>
                  <div className="font-medium text-gray-900">{viewingEvent.title}</div>
                </div>
                <div>
                  <div className="text-gray-500">Type</div>
                  <div className="font-medium text-gray-900 capitalize">{viewingEvent.eventType}</div>
                </div>
                <div>
                  <div className="text-gray-500">Category</div>
                  <div className="font-medium text-gray-900 capitalize">{viewingEvent.category}</div>
                </div>
                <div>
                  <div className="text-gray-500">Participants</div>
                  <div className="font-medium text-gray-900">{viewingEvent.currentParticipants || 0}{viewingEvent.maxParticipants ? ` / ${viewingEvent.maxParticipants}` : ''}</div>
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Description</div>
                <div className="text-gray-800 text-sm whitespace-pre-wrap">{viewingEvent.description}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Date</div>
                  <div className="font-medium text-gray-900">{new Date(viewingEvent.date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Time</div>
                  <div className="font-medium text-gray-900">{viewingEvent.time}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-gray-500">Location</div>
                  <div className="font-medium text-gray-900">{viewingEvent.location}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Requirements</div>
                  <div className="text-gray-800 whitespace-pre-wrap">{viewingEvent.requirements || 'None'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Contact</div>
                  <div className="text-gray-800">{viewingEvent.contactEmail || 'N/A'}{viewingEvent.contactPhone ? ` • ${viewingEvent.contactPhone}` : ''}</div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={() => setViewingEvent(null)} className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyEvents 