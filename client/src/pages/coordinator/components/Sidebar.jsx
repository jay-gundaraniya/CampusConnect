import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaPlus, 
  FaCalendarAlt, 
  FaUsers, 
  FaUserPlus,
  FaChartBar,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';
import RoleSwitcher from '../../../components/RoleSwitcher';
import { storage } from '../../../services/api';
import { useRole } from '../../../contexts/RoleContext';

function Sidebar({ onLogout }) {
  const location = useLocation();
  const { canSwitchRole } = useRole();
  
  // Get current user data to check permissions
  const currentUser = storage.getUser();
  const canPromoteStudents = currentUser && currentUser.defaultRole === 'coordinator';
  const canCreateEvents = currentUser && currentUser.roles && currentUser.roles.includes('coordinator');

  const menuItems = [
    { path: '/coordinator', icon: FaTachometerAlt, label: 'Dashboard' },
    ...(canCreateEvents ? [{ path: '/coordinator/create-event', icon: FaPlus, label: 'Create Event' }] : []),
    { path: '/coordinator/manage-events', icon: FaCalendarAlt, label: 'Manage Events' },
    { path: '/coordinator/participants', icon: FaUsers, label: 'Manage Participants' },
    ...(canPromoteStudents ? [{ path: '/coordinator/add-student', icon: FaUserPlus, label: 'Add Student' }] : []),
    { path: '/coordinator/reports', icon: FaChartBar, label: 'Feedback & Reports' },
    { path: '/coordinator/profile', icon: FaUser, label: 'Profile' }
  ];

  return (
    <div className="bg-white shadow-lg w-64 min-h-screen fixed left-0 top-0 z-10">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="ml-3 text-xl font-bold text-gray-900">CampusConnect</h1>
        </div>
        
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Role Switcher - Only show if user can switch roles */}
        {canSwitchRole && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="px-4">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Switch Role
              </label>
              <RoleSwitcher />
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar; 