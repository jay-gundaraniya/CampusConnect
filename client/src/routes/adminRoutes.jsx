import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminPanel from '../pages/admin/AdminPanel';
import UserManagement from '../pages/admin/pages/UserManagement';
import EventApproval from '../pages/admin/pages/EventApproval';
import CertificateManager from '../pages/admin/pages/CertificateManager';
import AdminLayout from '../pages/admin/components/AdminLayout';

export const adminRoutes = [
  <Route
    key="admin-panel"
    path="/admin"
    element={
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminPanel />
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-user-management"
    path="/admin/user-management"
    element={
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout>
          <UserManagement />
        </AdminLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-event-approval"
    path="/admin/event-approval"
    element={
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout>
          <EventApproval />
        </AdminLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="admin-certificate-manager"
    path="/admin/certificate-manager"
    element={
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout>
          <CertificateManager />
        </AdminLayout>
      </ProtectedRoute>
    }
  />
]; 