import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import Reports from '../components/admin/Reports';
import Analytics from '../components/admin/Analytics';
import Database from '../components/admin/Database';
import PasswordManagement from '../components/admin/PasswordManagement';
import Settings from '../components/admin/Settings';
import { useAuth } from '../contexts/AuthContext';

const AdminRoutes = () => {
  const { user } = useAuth();

  if (!user || user.account_type !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/database" element={<Database />} />
      <Route path="/passwords" element={<PasswordManagement />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes; 