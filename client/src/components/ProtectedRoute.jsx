import { Navigate } from 'react-router-dom';
import { storage } from '../services/api';

const ProtectedRoute = ({ children, allowedRoles, role }) => {
  const user = storage.getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle both allowedRoles (array) and role (string) props
  const allowedRolesArray = allowedRoles || (role ? [role] : []);

  if (!allowedRolesArray.includes(user.role)) {
    // Redirect to their correct dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'cordinator') return <Navigate to="/coordinator" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute; 