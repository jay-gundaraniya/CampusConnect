import { useState } from 'react';
import { FaTimes, FaEnvelope } from 'react-icons/fa';
import { api } from '../services/api';

function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.forgotPassword(email);
      setMessage(response.message);
      setEmail(''); // Clear email on success
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="text-center mb-4">
            <FaEnvelope className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <p className="text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          {/* Messages */}
          {message && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-center">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">
              Remember your password?{' '}
              <button
                onClick={handleClose}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Back to Profile
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
