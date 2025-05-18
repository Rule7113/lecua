import React, { useState } from 'react';
import styled from 'styled-components';
import { FaPlus, FaHistory, FaCog, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: width 0.3s ease;
  width: ${props => props.isCollapsed ? '60px' : '250px'};
  z-index: 1000;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: ${props => props.isCollapsed ? '0' : '250px'};
  }
`;

const Logo = styled.div`
  padding: 20px;
  font-size: 1.2rem;
  font-weight: 600;
  border-bottom: 1px solid var(--border-color);
  display: ${props => props.isCollapsed ? 'none' : 'block'};
`;

const NewChatButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  margin: 16px;
  background-color: var(--accent-blue);
  color: var(--text-primary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: ${props => props.isCollapsed ? '28px' : 'calc(100% - 32px)'};
  justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};
  transition: background-color 0.2s;

  &:hover {
    background-color: #3d63c9;
  }
`;

const MenuItems = styled.div`
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1; /* Take up available space */
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: ${props => props.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  background-color: ${props => props.active ? 'var(--hover-color)' : 'transparent'};

  &:hover {
    background-color: var(--hover-color);
  }
`;

const Icon = styled.div`
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.isCollapsed ? '0' : '12px'};
`;

const Label = styled.span`
  display: ${props => props.isCollapsed ? 'none' : 'block'};
  white-space: nowrap;
  overflow: hidden;
  font-size: 0.9rem;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: -12px;
  top: 20px;
  background: var(--background-light);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;

  &:hover {
    background: var(--hover-color);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin: 16px;
  background-color: transparent;
  color: var(--text-secondary);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  justify-content: ${props => props.isCollapsed ? 'center' : 'flex-start'};
  transition: all 0.2s;
  border-top: 1px solid var(--border-color);
  
  &:hover {
    color: var(--text-primary);
    background-color: var(--hover-color);
  }
`;

const Sidebar = ({ isCollapsed, onCollapse }) => {
  const [activeItem, setActiveItem] = useState('new');
  const navigate = useNavigate();

  const menuItems = [
    { id: 'new', icon: <FaPlus />, label: 'New chat' },
    { id: 'history', icon: <FaHistory />, label: 'History' },
    { id: 'settings', icon: <FaCog />, label: 'Settings' }
  ];

  const handleLogout = () => {
    // Add any logout logic here (clear tokens, etc.)
    // For example: localStorage.removeItem('auth_token');
    
    // Navigate to welcome page
    navigate('/');
  };

  return (
    <SidebarContainer isCollapsed={isCollapsed}>
      {!isCollapsed && <Logo>LECUA</Logo>}
      <ToggleButton onClick={() => onCollapse(!isCollapsed)}>
        {isCollapsed ? <FaBars size={12} /> : <FaTimes size={12} />}
      </ToggleButton>
      <NewChatButton isCollapsed={isCollapsed}>
        <FaPlus />
        {!isCollapsed && <span>New chat</span>}
      </NewChatButton>
      <MenuItems>
        {menuItems.map(item => (
          <MenuItem
            key={item.id}
            active={activeItem === item.id}
            onClick={() => setActiveItem(item.id)}
          >
            <Icon isCollapsed={isCollapsed}>{item.icon}</Icon>
            <Label isCollapsed={isCollapsed}>{item.label}</Label>
          </MenuItem>
        ))}
      </MenuItems>
      
      {/* Logout Button */}
      <LogoutButton isCollapsed={isCollapsed} onClick={handleLogout}>
        <Icon isCollapsed={isCollapsed}>
          <FaSignOutAlt />
        </Icon>
        {!isCollapsed && <span>Logout</span>}
      </LogoutButton>
    </SidebarContainer>
  );
};

export default Sidebar;