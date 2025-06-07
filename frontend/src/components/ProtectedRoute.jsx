import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ProtectedRoute component definition
const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();
  
  // Show nothing while loading
  if (loading) {
    return null;
  }

  // Check if trying to access admin routes
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard');

  // Redirect based on route and user type
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isAdminRoute && isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }
  
  return children;
};

export default ProtectedRoute; 