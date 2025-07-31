import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Password complexity validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!/(?=.*[a-z])/.test(password)) {
      setError('Password must contain a lowercase letter.');
      return;
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      setError('Password must contain an uppercase letter.');
      return;
    }
    if (!/(?=.*\d)/.test(password)) {
      setError('Password must contain a number.');
      return;
    }
    if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password)) {
      setError('Password must contain a special character.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.resetPassword(token, password);
      setMessage(res.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
              <button type="button" tabIndex={-1} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 z-20" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <button type="button" tabIndex={-1} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 z-20" onClick={() => setShowConfirmPassword((v) => !v)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {message && <div className="mt-4 text-green-600 text-center">{message}</div>}
        {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
      </div>
    </div>
  );
}

export default ResetPassword; 