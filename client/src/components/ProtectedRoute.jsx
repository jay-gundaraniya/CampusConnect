import { Navigate } from 'react-router-dom';
import { storage } from '../services/api';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = storage.getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their correct dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'cordinator') return <Navigate to="/coordinator" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute; 