import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, api } from '../../../services/api';
import { FaCalendarAlt, FaUsers, FaChartBar, FaClock } from 'react-icons/fa';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    totalParticipants: 0,
    pendingApprovals: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = storage.getUser();
    if (userData) {
      setUser(userData);
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = storage.getToken();
      console.log('Fetching coordinator dashboard data with token:', token ? 'Token exists' : 'No token');
      
      if (token) {
        const response = await api.getCoordinatorDashboardData(token);
        console.log('Dashboard API response:', response);
        setStats(response.stats);
        setRecentEvents(response.recentEvents || []);
      } else {
        console.error('No authentication token found');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data to prevent blank page
      setStats({
        totalEvents: 0,
        activeEvents: 0,
        completedEvents: 0,
        totalParticipants: 0,
        pendingApprovals: 0
      });
      setRecentEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: FaCalendarAlt,
      color: 'bg-blue-500',
      textColor: 'text-blue-500'
    },
    {
      title: 'Completed Events',
      value: stats.completedEvents,
      icon: FaClock,
      color: 'bg-green-500',
      textColor: 'text-green-500'
    },
    {
      title: 'Total Participants',
      value: stats.totalParticipants,
      icon: FaUsers,
      color: 'bg-purple-500',
      textColor: 'text-purple-500'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: FaChartBar,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Coordinator Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.name || 'Coordinator'}!</p>
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
          <button 
            onClick={() => navigate('/coordinator/create-event')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaCalendarAlt className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Create New Event</span>
          </button>
          <button 
            onClick={() => navigate('/coordinator/participants')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaUsers className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Manage Participants</span>
          </button>
          <button 
            onClick={() => navigate('/coordinator/reports')}
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaChartBar className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Events</h2>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading events...</p>
            </div>
          ) : recentEvents.length > 0 ? (
            recentEvents.map((event) => {
              const getStatusColor = (status) => {
                switch (status) {
                  case 'approved':
                    return 'bg-green-100 text-green-800';
                  case 'pending':
                    return 'bg-yellow-100 text-yellow-800';
                  case 'rejected':
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

              const formatTime = (timeString) => {
                return timeString || 'TBD';
              };

              return (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(event.date)} • {formatTime(event.time)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {event.participantsCount} participants registered
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <FaCalendarAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900">No events found</h3>
              <p className="text-sm text-gray-500">Create your first event to get started!</p>
              <button 
                onClick={() => navigate('/coordinator/create-event')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 