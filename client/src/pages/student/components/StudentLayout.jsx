import { useNavigate, Outlet } from 'react-router-dom';
import { storage } from '../../../services/api';
import Sidebar from './Sidebar';
import SessionTimeout from '../../../components/SessionTimeout';

function StudentLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar onLogout={handleLogout} />
      <div className="ml-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <SessionTimeout />
    </div>
  );
}

export default StudentLayout 