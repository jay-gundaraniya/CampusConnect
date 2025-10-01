import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, api } from '../../../services/api';
import { FaUsers, FaCalendarCheck, FaUserGraduate, FaClock, FaCalendarAlt } from 'react-icons/fa';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCoordinators: 0,
    pendingRequests: 0,
    totalEvents: 0,
    totalStudents: 0
  });
  const [loading, setLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    const userData = storage.getUser();
    if (userData) {
      setUser(userData);
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = storage.getToken();
      
      // Fetch coordinator count
      const coordinatorRes = await fetch('http://localhost:5000/api/auth/coordinator-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const coordinatorData = await coordinatorRes.json();
      
      // Fetch pending requests
      const requestsRes = await fetch('http://localhost:5000/api/auth/pending-coordinator-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const requestsData = await requestsRes.json();
      
      // Fetch student count
      const studentRes = await fetch('http://localhost:5000/api/auth/student-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      let studentData = { count: 0 };
      if (studentRes.ok) {
        const contentType = studentRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          studentData = await studentRes.json();
        }
      }
      
      // Fetch upcoming events
      let activeEventsCount = 0;
      try {
        const eventsRes = await api.getUpcomingEvents(token);
        const allEvents = eventsRes.events || [];
        
        // Filter for only approved upcoming events (future dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate total active events count (all upcoming approved events)
        const allUpcomingEvents = allEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate >= today && event.status === 'approved';
        });
        activeEventsCount = allUpcomingEvents.length;
        
        // Get 3 events for display (sorted by date, earliest first)
        const upcomingEventsData = allUpcomingEvents
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);
        
        // Format for display
        const formattedEvents = upcomingEventsData.map(event => ({
          id: event._id,
          title: event.title,
          date: new Date(event.date).toLocaleDateString(),
          time: event.time,
          location: event.location,
          organizer: event.coordinator?.name || 'Unknown',
          attendees: event.participants?.length || 0,
          status: event.status
        }));
        
        setUpcomingEvents(formattedEvents);
      } catch (eventsError) {
        console.error('Error fetching upcoming events:', eventsError);
        setUpcomingEvents([]);
        activeEventsCount = 0;
      }

      setStats({
        totalCoordinators: coordinatorData.count || 0,
        pendingRequests: requestsData.requests?.length || 0,
        totalEvents: activeEventsCount,
        totalStudents: studentData.count || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error.message);
      // Set default values if API calls fail
      setStats({
        totalCoordinators: 0,
        pendingRequests: 0,
        totalEvents: 0,
        totalStudents: 0
      });
      setUpcomingEvents([]);
    } finally {
      setLoading(false);
    }
  };


  const statCards = [
    {
      title: 'Total Coordinators',
      value: stats.totalCoordinators,
      icon: FaUsers,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: FaClock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500'
    },
    {
      title: 'Active Events',
      value: stats.totalEvents,
      icon: FaCalendarCheck,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: FaUserGraduate,
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'Admin'}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                  <Icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/admin/user-management')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
          >
            <FaUsers className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </button>
          <button 
            onClick={() => navigate('/admin/event-approval')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow focus:outline-none focus:ring-2 focus:ring-green-500/30 transition"
          >
            <FaCalendarCheck className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Review Events</span>
          </button>
          {/* Removed Manage Certificates quick action */}
        </div>
      </div>

      {/* Upcoming Events Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Events Summary</h2>
          <FaCalendarAlt className="h-5 w-5 text-blue-600" />
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading events...</p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No upcoming events</p>
            <p className="text-sm mt-2">Events will appear here when scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">Organized by {event.organizer}</p>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <FaCalendarAlt className="h-4 w-4 mr-1" />
                        {event.date} at {event.time}
                      </span>
                      <span>{event.location}</span>
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 