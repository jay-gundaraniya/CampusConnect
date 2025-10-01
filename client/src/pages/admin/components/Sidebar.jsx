import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaCalendarCheck, 
  FaCertificate,
  FaSignOutAlt
} from 'react-icons/fa';

function Sidebar({ onLogout }) {
  const location = useLocation();

  const menuItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/admin/user-management', icon: FaUsers, label: 'User Management' },
    { path: '/admin/event-approval', icon: FaCalendarCheck, label: 'Event Approval' },
    // Certificate Manager removed
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