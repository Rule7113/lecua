import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { muiTheme, styledTheme } from './styles/theme';
import './styles/variables.css';
import { ChatProvider } from './components/ChatInterface';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import WelcomePage from './components/WelcomePage';
import Login from './components/Login';
import Signup from './components/Signup';
import ChatInterface from './components/ChatInterface';
import AdminDashboard from './components/AdminDashboard';
import AdminSidebar from './components/AdminSidebar';
import History from './components/History';
import Settings from './components/Settings';
import ReportIssue from './components/ReportIssue';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoutes from './routes/AdminRoutes';

// Main App component wrapped with providers
const AppWithProviders = () => {
  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeProvider theme={styledTheme}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </MuiThemeProvider>
  );
};

// App content component that uses the auth context
const AppContent = () => {
  // State to manage visibility of settings and report issue modals
  const [showSettings, setShowSettings] = useState(false);
  const [showReportIssue, setShowReportIssue] = useState(false);

  // Get auth context
  const { user, isAdmin } = useAuth();

  // Hook to get the current route location
  const location = useLocation();

  // Hook to navigate between routes
  const navigate = useNavigate();

  // Determine if the current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard');

  return (
    <>
        {/* Reset CSS styles */}
        <CssBaseline />
        {/* Provide chat context to children components */}
        <ChatProvider>
          {/* Display admin sidebar if user is admin and on an admin route */}
          {isAdminRoute && isAdmin && <AdminSidebar />}

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={
              user ? (
                isAdmin ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/dashboard" replace />
              ) : <Login />
            } />
            <Route path="/signup" element={
              user ? (
                isAdmin ? <Navigate to="/admin-dashboard" replace /> : <Navigate to="/dashboard" replace />
              ) : <Signup />
            } />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  {!user ? (
                    <Navigate to="/login" replace />
                  ) : !isAdmin ? (
                    <ChatInterface 
                      onSettingsClick={() => setShowSettings(true)}
                      onReportIssueClick={() => setShowReportIssue(true)}
                    />
                  ) : (
                    <Navigate to="/admin-dashboard" replace />
                  )}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  {!isAdmin ? (
                  <History />
                  ) : (
                    <Navigate to="/admin-dashboard" replace />
                  )}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  {!isAdmin ? (
                  <Settings onClose={() => navigate('/dashboard')} />
                  ) : (
                    <Navigate to="/admin-dashboard" replace />
                  )}
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report-issue" 
              element={
                <ProtectedRoute>
                  {!isAdmin ? (
                  <ReportIssue onClose={() => navigate('/dashboard')} />
                  ) : (
                    <Navigate to="/admin-dashboard" replace />
                  )}
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute>
                  {isAdmin ? (
                    <AdminDashboard />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )}
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-dashboard/*"
              element={
                <ProtectedRoute>
                  {isAdmin ? (
                  <AdminRoutes />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )}
                </ProtectedRoute>
              }
            />
            
            {/* Redirect to home for undefined routes */}
          <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          {/* Modal Components */}
          {showSettings && (
            <Settings onClose={() => setShowSettings(false)} />
          )}
          {showReportIssue && (
            <ReportIssue onClose={() => setShowReportIssue(false)} />
          )}
        </ChatProvider>
    </>
  );
};

export default AppWithProviders;