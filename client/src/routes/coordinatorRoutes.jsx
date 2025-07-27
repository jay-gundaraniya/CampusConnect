import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import CoordinatorDashboard from '../pages/CoordinatorDashboard';

export const coordinatorRoutes = [
  <Route
    key="coordinator-dashboard"
    path="/coordinator"
    element={
      <ProtectedRoute allowedRoles={['cordinator']}>
        <CoordinatorDashboard />
      </ProtectedRoute>
    }
  />
  // Add more coordinator routes here as needed
  // Example:
  // <Route
  //   key="coordinator-events"
  //   path="/coordinator/events"
  //   element={
  //     <ProtectedRoute allowedRoles={['cordinator']}>
  //       <CoordinatorEvents />
  //     </ProtectedRoute>
  //   }
  // />
  // <Route
  //   key="coordinator-create-event"
  //   path="/coordinator/create-event"
  //   element={
  //     <ProtectedRoute allowedRoles={['cordinator']}>
  //       <CreateEvent />
  //     </ProtectedRoute>
  //   }
  // />
]; 