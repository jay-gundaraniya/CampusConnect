import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

function CertificateVerification() {
  const { userId, eventId } = useParams();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useState({
    userId: userId || '',
    eventId: eventId || ''
  });

  // Auto-verify if URL parameters are provided
  useEffect(() => {
    if (userId && eventId) {
      handleVerify();
    }
  }, [userId, eventId]);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    setVerificationData(null);

    try {
      const response = await api.verifyCertificate(searchParams.userId, searchParams.eventId);
      
      if (response.valid) {
        setVerificationData(response.certificate);
      } else {
        setError(response.message || 'Certificate not found');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError('Failed to verify certificate. Please check the details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white text-center">
              Certificate Verification
            </h1>
            <p className="mt-2 text-blue-100 text-center">
              Verify the authenticity of participation certificates
            </p>
          </div>

          {/* Verification Form */}
          <div className="p-6">
            {!verificationData && !error && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-gray-900">
                    Enter Certificate Details
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Provide the User ID and Event ID to verify the certificate
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="space-y-4">
                  <div>
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                      User ID
                    </label>
                    <input
                      type="text"
                      id="userId"
                      name="userId"
                      value={searchParams.userId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter User ID"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="eventId" className="block text-sm font-medium text-gray-700">
                      Event ID
                    </label>
                    <input
                      type="text"
                      id="eventId"
                      name="eventId"
                      value={searchParams.eventId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter Event ID"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify Certificate'}
                  </button>
                </form>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying certificate...
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Verification Failed</h3>
                <p className="mt-2 text-gray-600">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setSearchParams({ userId: '', eventId: '' });
                  }}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Success State */}
            {verificationData && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="mt-4 text-2xl font-bold text-green-600">Certificate Verified!</h2>
                  <p className="mt-2 text-gray-600">This certificate is authentic and valid</p>
                </div>

                {/* Certificate Details */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Certificate ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">{verificationData.certificateId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Title</dt>
                      <dd className="mt-1 text-sm text-gray-900">{verificationData.title}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Student Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-semibold">{verificationData.studentName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Student Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{verificationData.studentEmail}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Event Title</dt>
                      <dd className="mt-1 text-sm text-gray-900">{verificationData.eventTitle}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Event Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(verificationData.eventDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Event Location</dt>
                      <dd className="mt-1 text-sm text-gray-900">{verificationData.eventLocation}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Issued Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(verificationData.issuedAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setVerificationData(null);
                      setSearchParams({ userId: '', eventId: '' });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Verify Another Certificate
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Print Certificate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificateVerification;
