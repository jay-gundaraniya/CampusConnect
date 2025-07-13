import { useNavigate } from 'react-router-dom';
import { storage } from '../../services/api';

function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.clear();
    navigate('/login');
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-blue-700">Admin Panel</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
        >
          Logout
        </button>
      </div>
      <p className="text-gray-700">Welcome, Admin! Here you can manage users, events, and view analytics.</p>
      {/* Add admin-specific features here */}
    </div>
  );
}

export default AdminDashboard; 