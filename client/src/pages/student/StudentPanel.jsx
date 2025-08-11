import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import StudentLayout from './components/StudentLayout';
import StudentDashboard from './pages/StudentDashboard';

function StudentPanel() {
  useSessionTimeout(); // Add session timeout for student panel (60 minutes)

  return (
    <StudentLayout>
      <StudentDashboard />
    </StudentLayout>
  );
}

export default StudentPanel; 