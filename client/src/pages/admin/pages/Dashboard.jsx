import { useEffect, useState } from 'react';
import { storage } from '../../../services/api';
import { FaUsers, FaCalendarCheck, FaUserGraduate, FaClock, FaCalendarAlt } from 'react-icons/fa';

function Dashboard() {
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
      
      setStats({
        totalCoordinators: coordinatorData.count || 0,
        pendingRequests: requestsData.requests?.length || 0,
        totalEvents: 0, // TODO: Implement when events are added
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
    } finally {
      setLoading(false);
    }
  };

  // Placeholder data for upcoming events
  const placeholderUpcomingEvents = [
    {
      id: 1,
      title: 'Tech Workshop 2024',
      date: '2024-02-15',
      time: '10:00 AM',
      location: 'Main Auditorium',
      organizer: 'John Doe',
      attendees: 45
    },
    {
      id: 2,
      title: 'Cultural Festival',
      date: '2024-02-20',
      time: '6:00 PM',
      location: 'Open Air Theater',
      organizer: 'Jane Smith',
      attendees: 120
    },
    {
      id: 3,
      title: 'Career Fair',
      date: '2024-02-25',
      time: '2:00 PM',
      location: 'Conference Hall',
      organizer: 'Mike Johnson',
      attendees: 200
    }
  ];

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
      title: 'Total Events',
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FaUsers className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Manage Users</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FaCalendarCheck className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Review Events</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FaUserGraduate className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Manage Students</span>
          </button>
        </div>
      </div>

      {/* Upcoming Events Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upcoming Events Summary</h2>
          <FaCalendarAlt className="h-5 w-5 text-blue-600" />
        </div>
        {placeholderUpcomingEvents.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No upcoming events</p>
            <p className="text-sm mt-2">Events will appear here when scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {placeholderUpcomingEvents.map((event) => (
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
        <div className="mt-4 text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All Events →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 