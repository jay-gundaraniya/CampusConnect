import { useState, useEffect } from 'react';
import { FaUserMinus, FaSearch, FaCrown } from 'react-icons/fa';
import { api, storage } from '../../../services/api';

function AddStudent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [demotingId, setDemotingId] = useState(null);
  const [promotingId, setPromotingId] = useState(null);

  // Load students on component mount
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const token = storage.getToken();
      const response = await api.getStudents(token);
      setStudents(response.students);
    } catch (error) {
      console.error('Failed to load students:', error);
      setError('Failed to load students. Please try again.');
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (student.department && student.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const nonCoordinators = filteredStudents.filter(s => !(s.roles || []).includes('coordinator'));
  const coordinators = filteredStudents.filter(s => (s.roles || []).includes('coordinator'));

  const handleDemoteCoordinator = async (userId) => {
    try {
      setDemotingId(userId);
      setError('');
      setSuccess('');
      const token = storage.getToken();
      const response = await api.demoteCoordinator(userId, token);
      setStudents(prev => prev.map(s => (s._id === userId ? response.user || response.student || s : s)));
      setSuccess(response.message || 'Coordinator removed successfully');
    } catch (err) {
      setError(err.message || 'Failed to remove coordinator');
    } finally {
      setDemotingId(null);
    }
  };

  const handlePromoteCoordinator = async (userId) => {
    try {
      setPromotingId(userId);
      setError('');
      setSuccess('');
      const token = storage.getToken();
      const response = await api.promoteStudent(userId, token);
      setStudents(prev => prev.map(s => (s._id === userId ? response.student || response.user || s : s)));
      setSuccess(response.message || 'Student promoted to coordinator successfully');
    } catch (err) {
      setError(err.message || 'Failed to promote student');
    } finally {
      setPromotingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Coordinators</h1>
        <p className="text-gray-600 mt-2">View all students and coordinators. Remove coordinator role when needed.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Non-Coordinators */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Students (Not Coordinators)</h2>
          
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, student ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {nonCoordinators.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No students found</p>
            ) : (
              nonCoordinators.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <p className="text-xs text-gray-400">
                      {student.studentId && `ID: ${student.studentId}`}
                      {student.studentId && student.department && ' • '}
                      {student.department && student.department}
                    </p>
                  </div>
                  <button
                    onClick={() => handlePromoteCoordinator(student._id)}
                    disabled={promotingId === student._id}
                    className="p-2 text-purple-600 hover:text-purple-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Promote to Coordinator"
                  >
                    {promotingId === student._id ? 'Promoting...' : (<FaCrown className="h-4 w-4" />)}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coordinators with Demote Action */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Coordinators</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {coordinators.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No coordinators found</p>
            ) : (
              coordinators.map((student) => (
                <div key={student._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        <FaCrown className="w-3 h-3 mr-1" />
                        Coordinator
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <p className="text-xs text-gray-400">
                      {student.studentId && `ID: ${student.studentId}`}
                      {student.studentId && student.department && ' • '}
                      {student.department && student.department}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDemoteCoordinator(student._id)}
                    disabled={demotingId === student._id}
                    className="p-2 text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Remove Coordinator Role"
                  >
                    {demotingId === student._id ? 'Removing...' : (<FaUserMinus className="h-4 w-4" />)}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-sm text-gray-600">Tip: Use the search above to filter both lists by name, email, ID, or department.</p>
      </div>
    </div>
  );
}

export default AddStudent; 