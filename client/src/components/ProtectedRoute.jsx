import { Navigate } from 'react-router-dom';
import { storage } from '../services/api';
import DashboardRedirect from './DashboardRedirect';

const ProtectedRoute = ({ children, allowedRoles, role }) => {
  const user = storage.getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle both allowedRoles (array) and role (string) props
  const allowedRolesArray = allowedRoles || (role ? [role] : []);

  if (!allowedRolesArray.includes(user.role)) {
    // Redirect to their correct dashboard
    return <DashboardRedirect />;
  }

  return children;
};

export default ProtectedRoute; 