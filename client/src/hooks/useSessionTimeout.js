import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/api';

const TIMEOUT_DURATIONS = {
  admin: 30 * 60 * 1000, // 30 minutes
  cordinator: 45 * 60 * 1000, // 45 minutes
  student: 60 * 60 * 1000, // 60 minutes
  default: 30 * 60 * 1000 // 30 minutes default
};

export const useSessionTimeout = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  const resetTimeout = () => {
    const user = storage.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const timeoutDuration = TIMEOUT_DURATIONS[user.role] || TIMEOUT_DURATIONS.default;
    const warningDuration = timeoutDuration - (5 * 60 * 1000); // Show warning 5 minutes before timeout

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Set warning timeout (5 minutes before session expires)
    warningTimeoutRef.current = setTimeout(() => {
      const shouldExtend = window.confirm(
        `Your session will expire in 5 minutes due to inactivity. Would you like to extend your session?`
      );
      if (shouldExtend) {
        resetTimeout();
      }
    }, warningDuration);

    // Set session timeout
    timeoutRef.current = setTimeout(() => {
      storage.clear();
      alert('Your session has expired due to inactivity. Please log in again.');
      navigate('/login');
    }, timeoutDuration);
  };

  const handleUserActivity = () => {
    resetTimeout();
  };

  useEffect(() => {
    // Set up event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Initial timeout setup
    resetTimeout();

    // Cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, []);

  return { resetTimeout };
}; 