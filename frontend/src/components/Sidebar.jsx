
import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';

import { FaPlus, FaHistory, FaCog, FaBars, FaTimes, FaSignOutAlt, FaFileAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatContext } from './ChatInterface';
import { Link } from 'react-router-dom';
import client, { endpoints } from '../api/client';


// Sidebar container with theme-based styles and responsive width
const SidebarContainer = styled.div`
  width: ${({ $isCollapsed }) => ($isCollapsed ? '60px' : '250px')};
  height: 100vh;
  background: ${({ theme }) => theme.colors.sidebar.background};
  color: ${({ theme }) => theme.colors.sidebar.text};
  transition: width 0.3s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  border-right: 1px solid ${({ theme }) => theme.colors.sidebar.border};
`;

// Sidebar header with conditional rendering of items based on collapse state
const SidebarHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'space-between')};
  border-bottom: 1px solid ${({ theme }) => theme.colors.sidebar.border};
`;

// Logo styling and conditional display based on collapse state
const Logo = styled.div`
  font-family: 'Playfair Display', serif;
  font-size: ${({ theme }) => theme.typography.h2.fontSize};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.sidebar.text};
  display: ${({ $isCollapsed }) => ($isCollapsed ? 'none' : 'block')};
`;

const CollapseButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.sidebar.icon};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.sidebar.iconActive};
  }
`;

// Container for navigation items
const NavItems = styled.nav`
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Navigation item styles with hover and active states
const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.sidebar.icon};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.sidebar.hover};
    color: ${({ theme }) => theme.colors.sidebar.iconActive};
  }
  
  &.active {
    background: ${({ theme }) => theme.colors.sidebar.active};
    color: ${({ theme }) => theme.colors.sidebar.iconActive};
  }
  
  svg {
    min-width: 20px;
  }
  
  span {
    display: ${({ $isCollapsed }) => ($isCollapsed ? 'none' : 'block')};
  }
`;

// User section styling with conditional rendering
const UserSection = styled.div`
  margin-top: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.sidebar.border};
`;

// User information styling based on collapse state
const UserInfo = styled.div`
  display: ${({ $isCollapsed }) => ($isCollapsed ? 'none' : 'flex')};
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.sidebar.hover};
`;

// Avatar styling for the user
const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.sidebar.text};
  font-weight: 600;
`;

// User detail styling
const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

// User name styling
const UserName = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.sidebar.text};
`;

// User role styling
const UserRole = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.sidebar.icon};
`;

// Button styling for starting a new chat
const NewChatButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  margin: 16px;
  background-color: ${({ theme }) => theme.colors.primary || 'var(--accent-blue)'};
  color: ${({ theme }) => theme.colors.sidebar.text};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  width: ${props => props.$isCollapsed ? '28px' : 'calc(100% - 32px)'};
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
  }
`;

// Container for menu items
const MenuItems = styled.div`
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${props => props.$active ? props.theme.colors.sidebar.iconActive : props.theme.colors.sidebar.icon};
  background-color: ${props => props.$active ? props.theme.colors.sidebar.hover : 'transparent'};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.sidebar.hover};
    color: ${({ theme }) => theme.colors.sidebar.iconActive};
  }
`;

const Icon = styled.div`
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.$isCollapsed ? '0' : '12px'};
  color: ${({ theme }) => theme.colors.sidebar.icon};
`;

const Label = styled.span`
  display: ${props => props.$isCollapsed ? 'none' : 'block'};
  color: ${({ theme }) => theme.colors.sidebar.text};
`;

const ToggleButton = styled.button`
  position: absolute;
  right: -12px;
  top: 20px;
  background: ${({ theme }) => theme.colors.background.light};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  &:hover {
    background: ${({ theme }) => theme.colors.hover};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin: 16px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  justify-content: ${props => props.$isCollapsed ? 'center' : 'flex-start'};
  transition: all 0.2s;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
    background-color: ${({ theme }) => theme.colors.hover};
  }
`;

const Sidebar = ({ isCollapsed, onCollapse, onReportClick, onSettingsClick }) => {
  const [activeItem, setActiveItem] = useState('new');
  const [archivedChats, setArchivedChats] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const { resetChat, messages } = useContext(ChatContext);

  // Load user data and chat history on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await client.get(endpoints.auth.user);
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Load chat history for the user
        const userChats = await client.get('/api/analyses/');
        if (userChats.data) {
          setArchivedChats(userChats.data);
          localStorage.setItem('archivedChats', JSON.stringify(userChats.data));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // If there's an error, try to get data from localStorage
        const storedUser = localStorage.getItem('user');
        const storedChats = localStorage.getItem('archivedChats');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedChats) {
          setArchivedChats(JSON.parse(storedChats));
        }
      }
    };
    loadUserData();
  }, []);

  // Update active item based on current location
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') {
      setActiveItem('new');
    } else if (path === '/history') {
      setActiveItem('history');
    } else if (path === '/settings') {
      setActiveItem('settings');
    } else if (path === '/report-issue') {
      setActiveItem('reports');
    }
  }, [location]);

  const handleNewChat = async () => {
    if (messages.length > 0) {
      const newArchivedChat = {
        id: Date.now(),
        title: messages[0].content.substring(0, 30) + '...',
        timestamp: new Date().toISOString(),
        messages: [...messages],
        user_id: user?.id
      };

      try {
        // Save chat to backend using the analyses endpoint
        await client.post('analyses/', {
          title: newArchivedChat.title,
          content: messages.map(m => m.content).join('\n'),
          document_id: selectedFile?.id
        });
        
        // Update local state
        const updatedChats = [newArchivedChat, ...archivedChats];
        setArchivedChats(updatedChats);
        localStorage.setItem('archivedChats', JSON.stringify(updatedChats));
      } catch (error) {
        console.error('Error saving chat:', error);
        // Still update local state even if backend save fails
        const updatedChats = [newArchivedChat, ...archivedChats];
        setArchivedChats(updatedChats);
        localStorage.setItem('archivedChats', JSON.stringify(updatedChats));
      }
    }
    if (resetChat) {
    resetChat();
    }
    navigate('/dashboard');
  };

  const handleMenuItemClick = (itemId) => {
    setActiveItem(itemId);
    switch (itemId) {
      case 'new':
        handleNewChat();
        break;
      case 'history':
      navigate('/history');
        break;
      case 'settings':
      navigate('/settings');
        break;
      case 'reports':
      navigate('/report-issue');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('archivedChats');
    navigate('/login');
  };

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <SidebarHeader $isCollapsed={isCollapsed}>
        <Logo $isCollapsed={isCollapsed}>LECUA</Logo>
        <CollapseButton onClick={onCollapse}>
          {isCollapsed ? <FaBars /> : <FaTimes />}
        </CollapseButton>
      </SidebarHeader>

      <NewChatButton 
        $isCollapsed={isCollapsed}
          onClick={() => handleMenuItemClick('new')}
        >
          <FaPlus />
        {!isCollapsed && <span>New Chat</span>}
      </NewChatButton>

      <MenuItems>
        <MenuItem 
          $active={activeItem === 'history'} 
          onClick={() => handleMenuItemClick('history')}
        >
          <Icon $isCollapsed={isCollapsed}><FaHistory /></Icon>
          {!isCollapsed && <Label>History ({archivedChats.length})</Label>}
        </MenuItem>

        <MenuItem 
          $active={activeItem === 'reports'} 
          onClick={() => handleMenuItemClick('reports')}
        >
          <Icon $isCollapsed={isCollapsed}><FaFileAlt /></Icon>
          {!isCollapsed && <Label>Reports</Label>}
        </MenuItem>

        <MenuItem 
          $active={activeItem === 'settings'} 
          onClick={() => handleMenuItemClick('settings')}
        >
          <Icon $isCollapsed={isCollapsed}><FaCog /></Icon>
          {!isCollapsed && <Label>Settings</Label>}
        </MenuItem>
      </MenuItems>

      <UserSection>
        <UserInfo $isCollapsed={isCollapsed}>
          <UserAvatar>
            {user?.username ? user.username[0].toUpperCase() : 'U'}
          </UserAvatar>
          {!isCollapsed && (
          <UserDetails>
              <UserName>{user?.username || 'User'}</UserName>
              <UserRole>{user?.account_type || 'User'}</UserRole>
          </UserDetails>
          )}
        </UserInfo>

        <LogoutButton 
          $isCollapsed={isCollapsed}
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          {!isCollapsed && <span>Logout</span>}
        </LogoutButton>
      </UserSection>
    </SidebarContainer>
  );
};

export default Sidebar;