import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  
  useEffect(() => {
    console.log('ProtectedRoute - Token exists:', !!token);
    console.log('ProtectedRoute - Current path:', window.location.pathname);
  }, [token]);
  
  if (!token) {
    console.log('ProtectedRoute - No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute - Token found, rendering protected content');
  return children;
};

export default ProtectedRoute; 