import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import CoordinatorLayout from '../pages/coordinator/components/CoordinatorLayout';
import CoordinatorPanel from '../pages/coordinator/CoordinatorPanel';
import Dashboard from '../pages/coordinator/pages/Dashboard';
import CreateEvent from '../pages/coordinator/pages/CreateEvent';
import ManageEvents from '../pages/coordinator/pages/ManageEvents';
import Participants from '../pages/coordinator/pages/Participants';
import AddStudent from '../pages/coordinator/pages/AddStudent';
import Reports from '../pages/coordinator/pages/Reports';
import Profile from '../pages/coordinator/pages/Profile';

const coordinatorRoutes = [
  <Route
    key="coordinator-dashboard"
    path="/coordinator"
    element={
      <ProtectedRoute role="cordinator">
        <CoordinatorLayout>
          <Dashboard />
        </CoordinatorLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="coordinator-create-event"
    path="/coordinator/create-event"
    element={
      <ProtectedRoute role="cordinator">
        <CoordinatorLayout>
          <CreateEvent />
        </CoordinatorLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="coordinator-manage-events"
    path="/coordinator/manage-events"
    element={
      <ProtectedRoute role="cordinator">
        <CoordinatorLayout>
          <ManageEvents />
        </CoordinatorLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="coordinator-participants"
    path="/coordinator/participants"
    element={
      <ProtectedRoute role="cordinator">
        <CoordinatorLayout>
          <Participants />
        </CoordinatorLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="coordinator-add-student"
    path="/coordinator/add-student"
    element={
      <ProtectedRoute role="cordinator">
        <CoordinatorLayout>
          <AddStudent />
        </CoordinatorLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="coordinator-reports"
    path="/coordinator/reports"
    element={
      <ProtectedRoute role="cordinator">
        <CoordinatorLayout>
          <Reports />
        </CoordinatorLayout>
      </ProtectedRoute>
    }
  />,
  <Route
    key="coordinator-profile"
    path="/coordinator/profile"
    element={
      <ProtectedRoute role="cordinator">
        <CoordinatorLayout>
          <Profile />
        </CoordinatorLayout>
      </ProtectedRoute>
    }
  />
];

export default coordinatorRoutes; 