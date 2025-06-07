import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaUserShield, 
  FaDatabase, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaExclamationTriangle,
  FaUsers,
  FaKey
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import client, { endpoints } from '../api/client';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  background-color: var(--background-dark);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 4px rgba(0,0,0,0.2);

  @media (max-width: 768px) {
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  }
`;

const SidebarHeader = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-light);
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: var(--primary-light);
  }
`;

const ToggleButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 8px;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MenuItem = styled.div`
  padding: 16px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  color: ${props => props.$active ? 'var(--primary)' : 'var(--text-primary)'};
  background-color: ${props => props.$active ? 'var(--background-light)' : 'transparent'};
  border-left: 3px solid ${props => props.$active ? 'var(--primary)' : 'transparent'};
  
  &:hover {
    background-color: var(--background-light);
    color: var(--primary);
  }
`;

const MenuIcon = styled.div`
  font-size: 18px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const LogoutButton = styled(MenuItem)`
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  color: var(--error);

  &:hover {
    background-color: var(--error-light);
    color: var(--error);
  }
`;

const Badge = styled.span`
  background-color: var(--error);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  margin-left: 8px;
`;

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [activePath, setActivePath] = useState(location.pathname);
  const [unreadReports, setUnreadReports] = useState(0);

  useEffect(() => {
    // Update active path when location changes
    setActivePath(location.pathname);
  }, [location]);

  useEffect(() => {
    // Fetch unread reports count
    const fetchUnreadReports = async () => {
      try {
        const response = await client.get(endpoints.admin.reports);
        const reports = response.data;
        const unread = reports.filter(report => report.status === 'pending').length;
        setUnreadReports(unread);
      } catch (error) {
        console.error('Failed to fetch unread reports:', error);
      }
    };

    fetchUnreadReports();
  }, []);

  const menuItems = [
    { 
      icon: <FaUserShield />, 
      label: "Dashboard", 
      path: "/admin-dashboard",
      description: "View system overview"
    },
    { 
      icon: <FaUsers />, 
      label: "User Management", 
      path: "/admin-dashboard/users",
      description: "Manage user accounts and permissions"
    },
    { 
      icon: <FaExclamationTriangle />, 
      label: "Reports & Issues", 
      path: "/admin-dashboard/reports",
      description: "Review and manage user reports",
      badge: unreadReports > 0 ? unreadReports : null
    },
    { 
      icon: <FaDatabase />, 
      label: "System Database", 
      path: "/admin-dashboard/database",
      description: "View and manage system data"
    },
    { 
      icon: <FaKey />, 
      label: "Password Management", 
      path: "/admin-dashboard/passwords",
      description: "Reset user passwords"
    },
    { 
      icon: <FaChartBar />, 
      label: "Analytics", 
      path: "/admin-dashboard/analytics",
      description: "View system statistics and reports"
    },
    { 
      icon: <FaCog />, 
      label: "Settings", 
      path: "/admin-dashboard/settings",
      description: "Configure system settings"
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setActivePath(path);
    if (window.innerWidth <= 768) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin-dashboard' && activePath === '/admin-dashboard') {
      return true;
    }
    return activePath.startsWith(path);
  };

  return (
    <SidebarContainer $isOpen={isOpen}>
      <SidebarHeader>
        <Logo onClick={() => handleNavigate('/admin-dashboard')}>
          Admin Panel
        </Logo>
        <ToggleButton onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </ToggleButton>
      </SidebarHeader>

      {menuItems.map((item) => (
        <MenuItem 
          key={item.path}
          $active={isActive(item.path)}
          onClick={() => handleNavigate(item.path)}
        >
          {item.icon}
          <span>{item.label}</span>
          {item.badge && (
            <Badge>{item.badge}</Badge>
          )}
        </MenuItem>
      ))}

      <MenuItem onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </MenuItem>
    </SidebarContainer>
  );
};

export default AdminSidebar;