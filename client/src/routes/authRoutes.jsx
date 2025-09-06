import { Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import DashboardRedirect from '../components/DashboardRedirect';
import LandingPage from '../components/LandingPage';

export const authRoutes = [
  <Route key="root" path="/" element={<LandingPage />} />,
  <Route key="dashboard-redirect" path="/dashboard" element={<DashboardRedirect />} />,
  <Route key="login" path="/login" element={<Login />} />,
  <Route key="register" path="/register" element={<Register />} />,
  <Route key="forgot-password" path="/forgot-password" element={<ForgotPassword />} />,
  <Route key="reset-password" path="/reset-password/:token" element={<ResetPassword />} />
]; 