import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/api';

const TIMEOUT_DURATIONS = {
  admin: 30 * 60 * 1000, // 30 minutes
  cordinator: 45 * 60 * 1000, // 45 minutes
  student: 60 * 60 * 1000, // 60 minutes
  default: 30 * 60 * 1000 // 30 minutes default
};

function SessionTimeout() {
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    const user = storage.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const timeoutDuration = TIMEOUT_DURATIONS[user.role] || TIMEOUT_DURATIONS.default;
    const warningDuration = timeoutDuration - (5 * 60 * 1000); // 5 minutes before timeout

    const handleUserActivity = () => {
      setLastActivity(Date.now());
      setShowWarning(false);
    };

    // Set up event listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Check for inactivity
    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;
      
      if (timeSinceLastActivity >= timeoutDuration) {
        // Session expired
        storage.clear();
        alert('Your session has expired due to inactivity. Please log in again.');
        navigate('/login');
        return;
      }

      if (timeSinceLastActivity >= warningDuration && !showWarning) {
        // Show warning
        setShowWarning(true);
        setTimeLeft(Math.ceil((timeoutDuration - timeSinceLastActivity) / 1000));
      }

      if (showWarning) {
        setTimeLeft(Math.ceil((timeoutDuration - timeSinceLastActivity) / 1000));
      }
    };

    const interval = setInterval(checkInactivity, 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      clearInterval(interval);
    };
  }, [navigate, lastActivity, showWarning]);

  const handleExtendSession = () => {
    setLastActivity(Date.now());
    setShowWarning(false);
  };

  const handleLogout = () => {
    storage.clear();
    navigate('/login');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-red-600 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Session Timeout Warning
          </h3>
          <p className="text-gray-600 mb-4">
            Your session will expire in <span className="font-bold text-red-600">{formatTime(timeLeft)}</span> due to inactivity.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleExtendSession}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Extend Session
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionTimeout; 