import { useState, useEffect } from 'react'

function MyEvents() {
  const [myEvents, setMyEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    // Load my events data
    setMyEvents([
      {
        id: 1,
        title: 'Coding Competition',
        description: 'Showcase your programming skills in this competitive coding event.',
        date: '2024-02-20',
        time: '2:00 PM',
        location: 'Computer Lab 101',
        category: 'Competition',
        maxParticipants: 30,
        currentParticipants: 28,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        isOrganizer: true
      },
      {
        id: 2,
        title: 'Web Development Workshop',
        description: 'Learn modern web development techniques and frameworks.',
        date: '2024-02-28',
        time: '10:00 AM',
        location: 'Room 205',
        category: 'Workshop',
        maxParticipants: 25,
        currentParticipants: 15,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        isOrganizer: true
      },
      {
        id: 3,
        title: 'Tech Workshop 2024',
        description: 'Learn the latest technologies in web development and mobile apps.',
        date: '2024-02-15',
        time: '10:00 AM',
        location: 'Main Auditorium',
        category: 'Technology',
        maxParticipants: 50,
        currentParticipants: 35,
        status: 'upcoming',
        image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        isOrganizer: false
      },
      {
        id: 4,
        title: 'Python Programming Course',
        description: 'Complete Python programming course for beginners.',
        date: '2024-01-15',
        time: '3:00 PM',
        location: 'Computer Lab 102',
        category: 'Course',
        maxParticipants: 20,
        currentParticipants: 20,
        status: 'completed',
        image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        isOrganizer: true
      }
    ])
    setLoading(false)
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
    if (activeTab === 'upcoming') return event.status === 'upcoming'
    if (activeTab === 'completed') return event.status === 'completed'
    if (activeTab === 'organizing') return event.isOrganizer
    return true
  })

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

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('organizing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'organizing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Organizing
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
                      event.status === 'upcoming' 
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
                  {event.isOrganizer && event.status === 'upcoming' && (
                    <>
                      <button
                        onClick={() => handleEditEvent(event.id)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition duration-150 ease-in-out"
                      >
                        Edit Event
                      </button>
                      <button
                        onClick={() => handleViewParticipants(event.id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition duration-150 ease-in-out"
                      >
                        View Participants
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition duration-150 ease-in-out"
                      >
                        Delete Event
                      </button>
                    </>
                  )}
                  {!event.isOrganizer && event.status === 'upcoming' && (
                    <button className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition duration-150 ease-in-out">
                      Cancel Registration
                    </button>
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
            {activeTab === 'upcoming' && "You don't have any upcoming events."}
            {activeTab === 'organizing' && "You're not organizing any events."}
            {activeTab === 'completed' && "You don't have any completed events."}
          </p>
        </div>
      )}
    </div>
  )
}

export default MyEvents 