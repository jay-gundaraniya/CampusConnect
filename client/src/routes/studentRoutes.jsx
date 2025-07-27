import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import StudentDashboard from '../pages/student/StudentDashboard';

export const studentRoutes = [
  <Route
    key="student-dashboard"
    path="/dashboard"
    element={
      <ProtectedRoute allowedRoles={['student']}>
        <StudentDashboard />
      </ProtectedRoute>
    }
  />
  // Add more student routes here as needed
  // Example:
  // <Route
  //   key="student-events"
  //   path="/student/events"
  //   element={
  //     <ProtectedRoute allowedRoles={['student']}>
  //       <StudentEvents />
  //     </ProtectedRoute>
  //   }
  // />
]; 