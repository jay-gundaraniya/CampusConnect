import { useState, useEffect } from 'react';
import { FaUserPlus, FaSearch, FaPlus, FaTimes, FaCrown, FaUser } from 'react-icons/fa';
import { api, storage } from '../../../services/api';
import { useRole } from '../../../contexts/RoleContext';

function AddStudent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [students, setStudents] = useState([]);
  const [promotingStudent, setPromotingStudent] = useState(null);
  const { updateUserData } = useRole();
  
  // Get current user data
  const currentUser = storage.getUser();
  const canPromoteStudents = currentUser && currentUser.defaultRole === 'coordinator';

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

  const handleAddStudent = (student) => {
    if (!selectedStudents.find(s => s._id === student._id)) {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s._id !== studentId));
  };

  const handleSubmit = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = storage.getToken();
      const promotionPromises = selectedStudents.map(student => 
        api.promoteStudent(student._id, token)
      );
      
      const results = await Promise.all(promotionPromises);
      
      // Update local state with promoted students
      setStudents(prevStudents => 
        prevStudents.map(s => {
          const promotedStudent = results.find(r => r.student._id === s._id);
          return promotedStudent ? promotedStudent.student : s;
        })
      );
      
      // Refresh current user data in case they were promoted
      const currentUser = storage.getUser();
      if (currentUser) {
        const currentUserPromoted = results.find(r => r.student._id === currentUser._id);
        if (currentUserPromoted) {
          updateUserData(currentUserPromoted.student);
          storage.setUser(currentUserPromoted.student);
        }
      }
      
      setSuccess(`${selectedStudents.length} student(s) promoted to coordinator successfully!`);
      setSelectedStudents([]);
    } catch (err) {
      setError('Failed to promote students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToCoordinator = async (student) => {
    setPromotingStudent(student._id);
    setError('');
    setSuccess('');

    try {
      const token = storage.getToken();
      const response = await api.promoteStudent(student._id, token);
      
      // Update local state with the response
      setStudents(prevStudents => 
        prevStudents.map(s => 
          s._id === student._id 
            ? response.student
            : s
        )
      );
      
      // Refresh current user data in case they were promoted
      const currentUser = storage.getUser();
      if (currentUser && currentUser._id === student._id) {
        updateUserData(response.student);
        storage.setUser(response.student);
      }
      
      setSuccess(response.message);
    } catch (err) {
      setError(err.message || `Failed to promote ${student.name}. Please try again.`);
    } finally {
      setPromotingStudent(null);
    }
  };

  // If user can't promote students, show a message
  if (!canPromoteStudents) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promote Students to Coordinators</h1>
          <p className="text-gray-600 mt-2">Search and promote students to coordinators, or manage their roles</p>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Access Restricted
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You don't have permission to promote students to coordinators. 
                  Only users with coordinator as their default role can promote students.
                </p>
                <p className="mt-2">
                  <strong>Your current role:</strong> {currentUser?.defaultRole || 'Unknown'}
                  {currentUser?.roles && currentUser.roles.length > 1 && (
                    <span> (Available roles: {currentUser.roles.join(', ')})</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Promote Students to Coordinators</h1>
        <p className="text-gray-600 mt-2">Search and promote students to coordinators, or manage their roles</p>
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
        {/* Search and Select Students */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Students</h2>
          
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
            {filteredStudents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No students found</p>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      {student.roles.includes('coordinator') && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <FaCrown className="w-3 h-3 mr-1" />
                          Coordinator
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <p className="text-xs text-gray-400">
                      {student.studentId && `ID: ${student.studentId}`}
                      {student.studentId && student.department && ' • '}
                      {student.department && student.department}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!student.roles.includes('coordinator') && (
                      <button
                        onClick={() => handlePromoteToCoordinator(student)}
                        disabled={promotingStudent === student._id}
                        className="p-2 text-purple-600 hover:text-purple-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title="Promote to Coordinator"
                      >
                        <FaCrown className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleAddStudent(student)}
                      disabled={selectedStudents.find(s => s._id === student._id) || student.roles.includes('coordinator')}
                      className="p-2 text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Select for Promotion"
                    >
                      <FaPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Students */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Students to Promote ({selectedStudents.length})
          </h2>
          
          {selectedStudents.length === 0 ? (
            <div className="text-center py-8">
              <FaUserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students selected</p>
              <p className="text-sm text-gray-400 mt-2">Search and select students to promote to coordinators</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedStudents.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-blue-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <p className="text-xs text-gray-400">
                      {student.studentId && `ID: ${student.studentId}`}
                      {student.studentId && student.department && ' • '}
                      {student.department && student.department}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(student._id)}
                    className="ml-2 p-2 text-red-600 hover:text-red-900"
                    title="Remove from Selection"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <FaCrown className="mr-2 h-4 w-4" />
                  {loading ? 'Promoting Students...' : `Promote ${selectedStudents.length} Student(s) to Coordinator`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FaUserPlus className="h-5 w-5 text-blue-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Bulk Import</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FaSearch className="h-5 w-5 text-green-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">View All Students</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FaUserPlus className="h-5 w-5 text-purple-600 mr-3" />
            <span className="text-sm font-medium text-gray-700">Manage Relationships</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddStudent; 