import { useSessionTimeout } from '../../hooks/useSessionTimeout';
import CoordinatorLayout from './components/CoordinatorLayout';
import Dashboard from './pages/Dashboard';

function CoordinatorPanel() {
  useSessionTimeout(); // Add session timeout for coordinator panel (45 minutes)

  return (
    <CoordinatorLayout>
      <Dashboard />
    </CoordinatorLayout>
  );
}

export default CoordinatorPanel; 