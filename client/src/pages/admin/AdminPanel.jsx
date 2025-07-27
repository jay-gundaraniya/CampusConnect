import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../../services/api';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';

function AdminPanel() {
  const navigate = useNavigate();

  useEffect(() => {
    const userData = storage.getUser();
    if (!userData || userData.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
}

export default AdminPanel; 