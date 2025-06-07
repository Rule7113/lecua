import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCog, FaMoon, FaSun, FaSignOutAlt, FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import client, { endpoints } from '../api/client';

// Styled component for the settings container
const SettingsContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  background-color: var(--background-dark);
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
  color: var(--text-primary);

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

// Styled component for the header of the settings panel
const SettingsHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;

  justify-content: space-between; // Space between title and close button
  align-items: center;
`;

// Styled component for the title in the settings header
const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
`;

// Styled component for the close button in the settings header
const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--hover);
  }
`;

// Styled component for the content area of the settings panel
const SettingsContent = styled.div`
  flex: 1; // Allow content to fill available space
  overflow-y: auto; // Allow vertical scrolling
  padding: 20px;
`;

// Styled component for a section within the settings panel
const Section = styled.div`
  margin-bottom: 32px;
`;

// Styled component for titles of sections
const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Styled component for a setting item
const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background-color: var(--background-light);
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.3s ease;
`;

// Styled component for setting labels
const SettingLabel = styled.span`
  color: var(--text-primary);
  font-size: 14px;
`;

// Styled component for toggle switch
const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  
  input {
    opacity: 0; // Hide the original input
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--background-light);
    transition: .4s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: var(--primary);
  }
  
  input:checked + span:before {
    transform: translateX(24px);
  }
`;

// Styled component for the logout button
const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  width: 100%;
  background-color: var(--error);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  margin-top: auto; // Align button to the bottom of the panel
  &:hover {
    background-color: var(--error-dark);
  }
`;

// Styled component for the password form
const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

// Styled component for password input fields
const PasswordInput = styled.input`
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-light);
  color: var(--text-primary);
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

// Styled component for the button to submit password changes
const PasswordButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-dark);
  }
  
  &:disabled {
    background-color: var(--text-secondary);
    cursor: not-allowed;
  }
`;

// Styled component for form groups in the password form
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 8px;
`;

const ErrorMessage = styled.span`
  color: var(--error);
  font-size: 14px;
  margin-top: 8px;
  padding: 8px;
  background-color: var(--error-light);
  border-radius: 4px;
  display: block;
`;

const SuccessMessage = styled.span`
  color: var(--success);
  font-size: 14px;
  margin-top: 8px;
  padding: 8px;
  background-color: var(--success-light);
  border-radius: 4px;
  display: block;
`;

const Settings = ({ onClose }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
    notifications: localStorage.getItem('notifications') === 'true',
    autoSave: localStorage.getItem('autoSave') === 'true',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Apply initial theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.darkMode ? 'dark' : 'light');
  }, []);

  const handleSettingChange = async (setting) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting]
    };
    setSettings(newSettings);
    localStorage.setItem(setting, newSettings[setting]);

    // Apply theme change immediately if it's darkMode
    if (setting === 'darkMode') {
      document.documentElement.setAttribute('data-theme', newSettings.darkMode ? 'dark' : 'light');
    }

    // Save settings to backend
    try {
      await client.post(endpoints.auth.user, {
        settings: {
          [setting]: newSettings[setting]
        }
      });
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await client.post(endpoints.auth.changePassword, {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        confirm_password: passwordData.confirmPassword
      });
      setPasswordSuccess('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('archivedChats');
    navigate('/login');
  };

  return (
    <SettingsContainer>
      <SettingsHeader>
        <Title>
          <FaCog />
          Settings
        </Title>
        <CloseButton onClick={onClose}>×</CloseButton>
      </SettingsHeader>

      <SettingsContent>
        <Section>
          <SectionTitle>
            <FaMoon />
            Appearance
          </SectionTitle>
          <SettingItem>
            <SettingLabel>Dark Mode</SettingLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={() => handleSettingChange('darkMode')}
              />
              <span />
            </ToggleSwitch>
          </SettingItem>
        </Section>

        <Section>
          <SectionTitle>
            <FaUser />
            Preferences
          </SectionTitle>
          <SettingItem>
            <SettingLabel>Enable Notifications</SettingLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={() => handleSettingChange('notifications')}
              />
              <span />
            </ToggleSwitch>
          </SettingItem>
          <SettingItem>
            <SettingLabel>Auto-save Chats</SettingLabel>
            <ToggleSwitch>
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={() => handleSettingChange('autoSave')}
              />
              <span />
            </ToggleSwitch>
          </SettingItem>
        </Section>

        <Section>
          <SectionTitle>
            <FaLock />
            Security
          </SectionTitle>
          <PasswordForm onSubmit={handlePasswordSubmit}>
            <FormGroup>
              <Label>Current Password</Label>
              <PasswordInput
          type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
          required
              />
            </FormGroup>
            <FormGroup>
              <Label>New Password</Label>
              <PasswordInput
          type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
          required
              />
            </FormGroup>
            <FormGroup>
              <Label>Confirm New Password</Label>
              <PasswordInput
          type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
          required
        />
            </FormGroup>
            {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
            {passwordSuccess && <SuccessMessage>{passwordSuccess}</SuccessMessage>}
            <PasswordButton type="submit" disabled={loading}>
              {loading ? 'Changing Password...' : 'Change Password'}
            </PasswordButton>
          </PasswordForm>
          <LogoutButton onClick={handleLogout}>
            <FaSignOutAlt />
            Logout
          </LogoutButton>
        </Section>
      </SettingsContent>
    </SettingsContainer>
  );
};

export default Settings;