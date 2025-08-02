import { useState } from 'react';
import { FaUserPlus, FaSearch, FaPlus, FaTimes } from 'react-icons/fa';

function AddStudent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Mock data - replace with API calls
  const [students] = useState([
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', studentId: 'STU001', department: 'Computer Science' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', studentId: 'STU002', department: 'Engineering' },
    { id: 3, name: 'Mike Johnson', email: 'mike.johnson@example.com', studentId: 'STU003', department: 'Business' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah.wilson@example.com', studentId: 'STU004', department: 'Arts' },
    { id: 5, name: 'David Brown', email: 'david.brown@example.com', studentId: 'STU005', department: 'Science' }
  ]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = (student) => {
    if (!selectedStudents.find(s => s.id === student.id)) {
      setSelectedStudents([...selectedStudents, student]);
    }
  };

  const handleRemoveStudent = (studentId) => {
    setSelectedStudents(selectedStudents.filter(s => s.id !== studentId));
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
      // TODO: Implement API call to add students
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(`${selectedStudents.length} student(s) added successfully!`);
      setSelectedStudents([]);
    } catch (err) {
      setError('Failed to add students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Add Student</h1>
        <p className="text-gray-600 mt-2">Search and add students to your events or manage relationships</p>
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
                  key={student.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <p className="text-xs text-gray-400">ID: {student.studentId} • {student.department}</p>
                  </div>
                  <button
                    onClick={() => handleAddStudent(student)}
                    disabled={selectedStudents.find(s => s.id === student.id)}
                    className="ml-2 p-2 text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Add Student"
                  >
                    <FaPlus className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Students */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Students ({selectedStudents.length})
          </h2>
          
          {selectedStudents.length === 0 ? (
            <div className="text-center py-8">
              <FaUserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students selected</p>
              <p className="text-sm text-gray-400 mt-2">Search and select students from the left panel</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-blue-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.email}</p>
                    <p className="text-xs text-gray-400">ID: {student.studentId} • {student.department}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveStudent(student.id)}
                    className="ml-2 p-2 text-red-600 hover:text-red-900"
                    title="Remove Student"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <FaUserPlus className="mr-2 h-4 w-4" />
                  {loading ? 'Adding Students...' : `Add ${selectedStudents.length} Student(s)`}
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