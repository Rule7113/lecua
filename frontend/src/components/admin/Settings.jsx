import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCog, FaSave, FaUndo } from 'react-icons/fa';
import client, { endpoints } from '../../api/client';
import { toast } from 'react-hot-toast';

const Container = styled.div`
  padding: 24px;
  margin-left: 250px;
  min-height: 100vh;
  background-color: var(--background-dark);
  color: var(--text-primary);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => props.primary ? 'var(--primary)' : 'var(--background-light)'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  
  &:hover {
    opacity: 0.9;
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const SettingsCard = styled.div`
  background: var(--background-light);
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: var(--text-secondary);
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--background-dark);
  color: var(--text-primary);
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--background-dark);
  color: var(--text-primary);
`;

const Settings = () => {
  const [settings, setSettings] = useState({
    system: {
      maintenanceMode: false,
      maxLoginAttempts: 5,
      sessionTimeout: 30,
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
    },
    notifications: {
      emailNotifications: true,
      reportNotifications: true,
      userNotifications: true,
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalSettings, setOriginalSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // This endpoint should be added to your backend
      const response = await client.get(endpoints.admin.settings);
      setSettings(response.data);
      setOriginalSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setError('Failed to load settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      // This endpoint should be added to your backend
      const response = await client.post(endpoints.admin.settings, settings);
      if (response.data.success) {
        toast.success('Settings saved successfully');
        setOriginalSettings(settings);
      } else {
        throw new Error(response.data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <Header>
        <Title>System Settings</Title>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={handleReset}>
            <FaUndo /> Reset
          </Button>
          <Button primary onClick={handleSave}>
            <FaSave /> Save Changes
          </Button>
        </div>
      </Header>

      <SettingsGrid>
        <SettingsCard>
          <CardTitle>System Settings</CardTitle>
          <FormGroup>
            <Label>Maintenance Mode</Label>
            <Select
              value={settings.system.maintenanceMode}
              onChange={(e) => handleChange('system', 'maintenanceMode', e.target.value === 'true')}
            >
              <option value="false">Disabled</option>
              <option value="true">Enabled</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Max Login Attempts</Label>
            <Input
              type="number"
              value={settings.system.maxLoginAttempts}
              onChange={(e) => handleChange('system', 'maxLoginAttempts', parseInt(e.target.value))}
            />
          </FormGroup>
          <FormGroup>
            <Label>Session Timeout (minutes)</Label>
            <Input
              type="number"
              value={settings.system.sessionTimeout}
              onChange={(e) => handleChange('system', 'sessionTimeout', parseInt(e.target.value))}
            />
          </FormGroup>
        </SettingsCard>

        <SettingsCard>
          <CardTitle>Security Settings</CardTitle>
          <FormGroup>
            <Label>Minimum Password Length</Label>
            <Input
              type="number"
              value={settings.security.passwordMinLength}
              onChange={(e) => handleChange('security', 'passwordMinLength', parseInt(e.target.value))}
            />
          </FormGroup>
          <FormGroup>
            <Label>Require Special Characters</Label>
            <Select
              value={settings.security.requireSpecialChars}
              onChange={(e) => handleChange('security', 'requireSpecialChars', e.target.value === 'true')}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Require Numbers</Label>
            <Select
              value={settings.security.requireNumbers}
              onChange={(e) => handleChange('security', 'requireNumbers', e.target.value === 'true')}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Require Uppercase</Label>
            <Select
              value={settings.security.requireUppercase}
              onChange={(e) => handleChange('security', 'requireUppercase', e.target.value === 'true')}
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </Select>
          </FormGroup>
        </SettingsCard>

        <SettingsCard>
          <CardTitle>Notification Settings</CardTitle>
          <FormGroup>
            <Label>Email Notifications</Label>
            <Select
              value={settings.notifications.emailNotifications}
              onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.value === 'true')}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Report Notifications</Label>
            <Select
              value={settings.notifications.reportNotifications}
              onChange={(e) => handleChange('notifications', 'reportNotifications', e.target.value === 'true')}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>User Notifications</Label>
            <Select
              value={settings.notifications.userNotifications}
              onChange={(e) => handleChange('notifications', 'userNotifications', e.target.value === 'true')}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </Select>
          </FormGroup>
        </SettingsCard>
      </SettingsGrid>
    </Container>
  );
};

export default Settings; 