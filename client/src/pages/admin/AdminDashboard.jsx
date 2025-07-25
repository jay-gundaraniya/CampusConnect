import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage, api } from '../../services/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [coordinatorCount, setCoordinatorCount] = useState(null);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [removingId, setRemovingId] = useState('');

  useEffect(() => {
    const userData = storage.getUser();
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(userData);
    fetchPendingRequests();
    fetchCoordinatorCount();
    fetchCoordinators();
    // eslint-disable-next-line
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const token = storage.getToken();
      const res = await fetch('http://localhost:5000/api/auth/pending-coordinator-requests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON. Check if backend is running and endpoint is correct.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch requests');
      setPendingRequests(data.requests || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinatorCount = async () => {
    try {
      const token = storage.getToken();
      const res = await fetch('http://localhost:5000/api/auth/coordinator-count', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch coordinator count');
      setCoordinatorCount(data.count);
    } catch (err) {
      setCoordinatorCount('Error');
    }
  };

  const fetchCoordinators = async () => {
    try {
      const token = storage.getToken();
      const res = await fetch('http://localhost:5000/api/auth/coordinators', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON.');
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch coordinators');
      setCoordinators(data.coordinators || []);
    } catch (err) {
      setCoordinators([]);
    }
  };

  const handleRemoveCoordinator = async (id) => {
    if (!window.confirm('Are you sure you want to remove this coordinator?')) return;
    setRemovingId(id);
    try {
      const token = storage.getToken();
      const res = await fetch(`http://localhost:5000/api/auth/coordinator/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete coordinator');
      setCoordinators((prev) => prev.filter((c) => c._id !== id));
      setSuccess(data.message);
    } catch (err) {
      setError(err.message || 'Failed to delete coordinator');
    } finally {
      setRemovingId('');
    }
  };

  const handleLogout = () => {
    storage.clear();
    navigate('/login');
  };

  const handleAction = async (requestId, action) => {
    setActionLoading(requestId + action);
    setError('');
    setSuccess('');
    try {
      const token = storage.getToken();
      const res = await fetch('http://localhost:5000/api/auth/handle-coordinator-request', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Action failed');
      setSuccess(data.message);
      setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">CampusConnect Admin</h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Admin Info</h2>
            {user && (
              <>
                <p className="text-gray-700">Role: {user.role}</p>
                <p className="text-gray-700">Email: {user.email}</p>
                <p className="text-gray-700 font-semibold mt-2">Total Coordinators: {coordinatorCount === null ? 'Loading...' : coordinatorCount}</p>
              </>
            )}
          </div>

          {/* Coordinators List */}
          <div className="bg-white overflow-hidden shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-blue-700 mb-4">All Coordinators</h2>
            {coordinators.length === 0 ? (
              <div className="text-gray-500">No coordinators found.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {coordinators.map((coord) => (
                  <li key={coord._id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{coord.name}</p>
                      <p className="text-gray-600 text-sm">{coord.email}</p>
                      <p className="text-gray-500 text-xs">Joined: {coord.createdAt ? new Date(coord.createdAt).toLocaleString() : 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveCoordinator(coord._id)}
                      disabled={removingId === coord._id}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 mt-2 sm:mt-0"
                    >
                      {removingId === coord._id ? 'Removing...' : 'Remove'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-700 mb-4">Pending Coordinator Requests</h2>
            {loading ? (
              <div>Loading...</div>
            ) : error ? (
              <div className="text-red-600 mb-2">{error}</div>
            ) : (
              <>
                {success && <div className="text-green-600 mb-2">{success}</div>}
                {pendingRequests.length === 0 ? (
                  <div className="text-gray-500">No pending requests.</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {pendingRequests.map((req) => (
                      <li key={req._id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{req.name}</p>
                          <p className="text-gray-600 text-sm">{req.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(req._id, 'approve')}
                            disabled={actionLoading === req._id + 'approve'}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
                          >
                            {actionLoading === req._id + 'approve' ? 'Approving...' : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleAction(req._id, 'decline')}
                            disabled={actionLoading === req._id + 'decline'}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50"
                          >
                            {actionLoading === req._id + 'decline' ? 'Declining...' : 'Decline'}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard; 