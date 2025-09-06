import { Navigate } from 'react-router-dom';
import { storage } from '../services/api';
import { useRole } from '../contexts/RoleContext';

const ProtectedRoute = ({ children, allowedRoles, role }) => {
  const user = storage.getUser();
  const { currentRole, availableRoles } = useRole();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle both allowedRoles (array) and role (string) props
  const allowedRolesArray = allowedRoles || (role ? [role] : []);

  // Get user's available roles
  const userRoles = availableRoles.length > 0 ? availableRoles : (user.roles || []);
  
  // Check if user has any of the allowed roles
  const hasAllowedRole = userRoles.some(role => allowedRolesArray.includes(role));
  
  if (!hasAllowedRole) {
    // User doesn't have any of the allowed roles
    return <Navigate to="/login" replace />;
  }

  // Use currentRole from context if available, otherwise fall back to user.role
  const userCurrentRole = currentRole || user.role;

  // Check if user's current role is in allowed roles
  if (!allowedRolesArray.includes(userCurrentRole)) {
    // User has the role but it's not their current role
    // Instead of redirecting, show a message or let the role switcher handle it
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Role Switch Required</h2>
          <p className="text-gray-600 mb-4">
            You need to switch to a different role to access this page.
          </p>
          <p className="text-sm text-gray-500">
            Use the role switcher in the sidebar to change your current role.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute; 