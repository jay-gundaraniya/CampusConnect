import { useState } from 'react';
import { FaCertificate, FaDownload, FaEye, FaTrash, FaPlus } from 'react-icons/fa';

function CertificateManager() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Placeholder data for demonstration
  const placeholderCertificates = [
    {
      id: 1,
      title: 'Web Development Workshop',
      recipient: 'John Doe',
      email: 'john.doe@example.com',
      issuedDate: '2024-01-15',
      status: 'issued',
      certificateUrl: '#'
    },
    {
      id: 2,
      title: 'Leadership Training Program',
      recipient: 'Jane Smith',
      email: 'jane.smith@example.com',
      issuedDate: '2024-01-20',
      status: 'pending',
      certificateUrl: '#'
    }
  ];

  const handleViewCertificate = (certificateId) => {
    // TODO: Implement view certificate logic
    console.log('Viewing certificate:', certificateId);
  };

  const handleDownloadCertificate = (certificateId) => {
    // TODO: Implement download certificate logic
    console.log('Downloading certificate:', certificateId);
  };

  const handleDeleteCertificate = (certificateId) => {
    // TODO: Implement delete certificate logic
    console.log('Deleting certificate:', certificateId);
  };

  const handleCreateCertificate = () => {
    // TODO: Implement create certificate logic
    console.log('Creating new certificate');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Manager</h1>
          <p className="text-gray-600 mt-2">Manage and issue certificates to participants</p>
        </div>
        <button
          onClick={handleCreateCertificate}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="h-4 w-4 mr-2" />
          Create Certificate
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 bg-opacity-10">
              <FaCertificate className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Certificates</p>
              <p className="text-2xl font-semibold text-gray-900">{placeholderCertificates.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 bg-opacity-10">
              <FaCertificate className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Issued</p>
              <p className="text-2xl font-semibold text-gray-900">
                {placeholderCertificates.filter(c => c.status === 'issued').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 bg-opacity-10">
              <FaCertificate className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {placeholderCertificates.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-500 bg-opacity-10">
              <FaCertificate className="h-6 w-6 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">All Certificates</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading certificates...</p>
            </div>
          ) : placeholderCertificates.length === 0 ? (
            <div className="text-center py-8">
              <FaCertificate className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No certificates found</p>
              <p className="text-sm text-gray-400 mt-2">Create your first certificate to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certificate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issued Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {placeholderCertificates.map((certificate) => (
                    <tr key={certificate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{certificate.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{certificate.recipient}</div>
                          <div className="text-sm text-gray-500">{certificate.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {certificate.issuedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          certificate.status === 'issued' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {certificate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewCertificate(certificate.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View Certificate"
                          >
                            <FaEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadCertificate(certificate.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Download Certificate"
                          >
                            <FaDownload className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCertificate(certificate.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Certificate"
                          >
                            <FaTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CertificateManager; 