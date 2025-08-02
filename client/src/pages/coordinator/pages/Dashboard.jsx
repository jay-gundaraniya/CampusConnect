import { useEffect, useState } from 'react';
import { storage } from '../../../services/api';
import { FaCalendarAlt, FaUsers, FaChartBar, FaClock } from 'react-icons/fa';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipants: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

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
      // TODO: Replace with actual API calls when backend is implemented
      setStats({
        totalEvents: 5,
        activeEvents: 3,
        totalParticipants: 120,
        pendingApprovals: 2
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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
      title: 'Active Events',
      value: stats.activeEvents,
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
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FaCalendarAlt className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Create New Event</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FaUsers className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Manage Participants</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FaChartBar className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">View Reports</span>
          </button>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Events</h2>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">Tech Workshop 2024</h3>
                <p className="text-sm text-gray-600">February 15, 2024 • 10:00 AM</p>
                <p className="text-sm text-gray-500">45 participants registered</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">Cultural Festival</h3>
                <p className="text-sm text-gray-600">February 20, 2024 • 6:00 PM</p>
                <p className="text-sm text-gray-500">120 participants registered</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard; 