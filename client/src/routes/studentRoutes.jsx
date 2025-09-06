import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardRedirect from '../components/DashboardRedirect';
import StudentLayout from '../pages/student/components/StudentLayout';
import StudentDashboard from '../pages/student/pages/StudentDashboard';
import Events from '../pages/student/pages/Events';
import MyEvents from '../pages/student/pages/MyEvents';
import Certificates from '../pages/student/pages/Certificates';
import Profile from '../pages/student/pages/Profile';

export const studentRoutes = [
  <Route
    key="student-layout"
    path="/student"
    element={
      <ProtectedRoute allowedRoles={['student']}>
        <StudentLayout />
      </ProtectedRoute>
    }
  >
    <Route
      key="student-default"
      index
      element={<Navigate to="dashboard" replace />}
    />
    <Route
      key="student-dashboard"
      path="dashboard"
      element={<StudentDashboard />}
    />
    <Route
      key="student-events"
      path="events"
      element={<Events />}
    />
    <Route
      key="student-my-events"
      path="my-events"
      element={<MyEvents />}
    />
    <Route
      key="student-certificates"
      path="certificates"
      element={<Certificates />}
    />
    <Route
      key="student-profile"
      path="profile"
      element={<Profile />}
    />
  </Route>
]; 