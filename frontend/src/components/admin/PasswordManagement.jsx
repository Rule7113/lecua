import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaKey, FaSearch, FaLock, FaUnlock } from 'react-icons/fa';
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

const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--background-light);
  color: var(--text-primary);
  width: 300px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--background-light);
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  background: var(--background-dark);
  color: var(--text-primary);
  font-weight: 500;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--background-light);
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 400px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 16px;
  background: var(--background-dark);
  color: var(--text-primary);
`;

const PasswordManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await client.get(endpoints.admin.users);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const response = await client.post(endpoints.auth.resetPassword, {
        user_id: userId,
        new_password: newPassword
      });
      
      if (response.data.success) {
        toast.success('Password reset successfully');
        setShowPasswordModal(false);
        setNewPassword('');
      } else {
        throw new Error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Failed to reset password: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <Header>
        <Title>Password Management</Title>
      </Header>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      <Table>
        <thead>
          <tr>
            <Th>Username</Th>
            <Th>Email</Th>
            <Th>Last Password Change</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <Td>{user.username}</Td>
              <Td>{user.email}</Td>
              <Td>{user.last_password_change ? new Date(user.last_password_change).toLocaleString() : 'Never'}</Td>
              <Td>
                <Button onClick={() => {
                  setSelectedUser(user);
                  setShowPasswordModal(true);
                }}>
                  <FaKey /> Reset Password
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showPasswordModal && selectedUser && (
        <ModalOverlay>
          <Modal>
            <h2>Reset Password for {selectedUser.username}</h2>
            <ModalInput
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button primary onClick={() => handleResetPassword(selectedUser.id)}>
                <FaLock /> Reset Password
              </Button>
              <Button onClick={() => {
                setShowPasswordModal(false);
                setNewPassword('');
              }}>
                <FaUnlock /> Cancel
              </Button>
            </div>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default PasswordManagement; 