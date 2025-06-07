import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaUsers, 
  FaFileAlt, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaSignOutAlt,
  FaDatabase,
  FaKey,
  FaSearch,
  FaEye,
  FaTrash,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import client, { endpoints } from '../api/client';
import { toast } from 'react-hot-toast';

// Styled component for the main dashboard container
const DashboardContainer = styled.div`
  padding: 24px;
  margin-left: 250px;
  min-height: 100vh;
  background-color: var(--background-dark);
  color: var(--text-primary);
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

// Styled component for the header section
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 16px;
  background-color: var(--background-light);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

// Styled component for header content
const HeaderContent = styled.div`
  flex: 1;
`;

// Styled component for the title
const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
`;

// Styled component for the subtitle
const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 16px;
`;

// Styled component for the logout button
const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--error);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--error-dark);
  }
`;

// Styled component for the statistics grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

// Styled component for the individual statistic card
const StatCard = styled.div`
  background: var(--background-light);
  padding: 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

// Styled component for the icon in the stat card
const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
  font-size: 24px;
`;

// Styled component for the stat content
const StatContent = styled.div`
  flex: 1;
`;

// Styled component for the stat value
const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
`;

// Styled component for the stat label
const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
`;

// Styled component for the loading container
const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 18px;
  color: var(--text-primary);
`;

// Styled component for the error container
const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 18px;
  color: var(--error);
`;

// Styled component for the table container
const TableContainer = styled.div`
  background: var(--background-light);
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
  overflow-x: auto;
`;

// Styled component for the table element
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

// Styled component for the table header
const Th = styled.th`
  text-align: left;
  padding: 12px;
  background: var(--background-dark);
  color: var(--text-primary);
  font-weight: 500;
`;

// Styled component for the table cell
const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
`;

// Styled component for the action button
const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${props => props.primary ? 'var(--primary)' : 'var(--background-dark)'};
  color: ${props => props.primary ? 'white' : 'var(--text-primary)'};
  
  &:hover {
    opacity: 0.9;
  }
`;

// Styled component for the search input
const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-bottom: 16px;
  width: 300px;
  background: var(--background-dark);
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocuments: 0,
    pendingReports: 0,
    resolvedReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.account_type !== 'admin') {
          navigate('/dashboard');
          return;
        }

        // Fetch dashboard data from admin endpoint
        const dashboardResponse = await client.get(endpoints.admin.dashboard);
        const { stats: dashboardStats, users, reports } = dashboardResponse.data;
        
        setStats(dashboardStats);
        setUsers(users);
        setReports(reports);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        setUsers([]);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
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

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      const response = await client.patch(`${endpoints.reports.update}${reportId}/`, { 
        status: newStatus 
      });
      
      if (response.data.success) {
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ));
        toast.success(`Report ${newStatus} successfully`);
      } else {
        throw new Error(response.data.message || 'Failed to update report status');
      }
    } catch (error) {
      console.error('Update report status error:', error);
      toast.error('Failed to update report status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const filteredUsers = users?.filter(user => 
    user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredReports = reports?.filter(report =>
    report?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report?.type?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return <LoadingContainer>Loading Admin Dashboard...</LoadingContainer>;
  }

  if (error) {
    return <ErrorContainer>{error}</ErrorContainer>;
  }

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <Title>Admin Dashboard</Title>
          <Subtitle>Monitor system activity and manage users</Subtitle>
        </HeaderContent>
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt />
          Logout
        </LogoutButton>
      </Header>
      
      <StatsGrid>
        <StatCard>
          <StatIcon color="var(--primary)">
            <FaUsers />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--success)">
            <FaFileAlt />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalDocuments}</StatValue>
            <StatLabel>Total Documents</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--warning)">
            <FaExclamationTriangle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.pendingReports}</StatValue>
            <StatLabel>Pending Reports</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon color="var(--success)">
            <FaCheckCircle />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.resolvedReports}</StatValue>
            <StatLabel>Resolved Reports</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <TableContainer>
        <h2>Reports & Issues</h2>
        <SearchInput
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Table>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Type</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Reported By</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr key={report.id}>
                <Td>{report.title}</Td>
                <Td>{report.type}</Td>
                <Td>{report.priority}</Td>
                <Td>{report.status}</Td>
                <Td>{report.user?.username || 'Anonymous'}</Td>
                <Td>
                  {report.status === 'pending' && (
                    <>
                      <ActionButton primary onClick={() => handleUpdateReportStatus(report.id, 'resolved')}>
                        <FaCheck /> Resolve
                      </ActionButton>
                      <ActionButton onClick={() => handleUpdateReportStatus(report.id, 'rejected')}>
                        <FaTimes /> Reject
                      </ActionButton>
                    </>
                  )}
                  <ActionButton onClick={() => handleViewReport(report)}>
                    <FaEye /> View
                  </ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {showPasswordModal && (
        <ModalOverlay>
          <Modal>
            <h2>Reset Password for {selectedUser?.username}</h2>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <ActionButton primary onClick={() => handleResetPassword(selectedUser.id)}>
                Reset Password
              </ActionButton>
              <ActionButton onClick={() => setShowPasswordModal(false)}>
                Cancel
              </ActionButton>
            </div>
          </Modal>
        </ModalOverlay>
      )}

      {showReportModal && selectedReport && (
        <ModalOverlay>
          <Modal>
            <h2>{selectedReport.title}</h2>
            <div style={{ marginTop: '16px' }}>
              <p><strong>Type:</strong> {selectedReport.type}</p>
              <p><strong>Priority:</strong> {selectedReport.priority}</p>
              <p><strong>Status:</strong> {selectedReport.status}</p>
              <p><strong>Reported By:</strong> {selectedReport.user?.username || 'Anonymous'}</p>
              <p><strong>Description:</strong></p>
              <p>{selectedReport.description}</p>
              {selectedReport.steps && (
                <>
                  <p><strong>Steps to Reproduce:</strong></p>
                  <p>{selectedReport.steps}</p>
                </>
              )}
              <p><strong>Created:</strong> {new Date(selectedReport.created_at).toLocaleString()}</p>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              {selectedReport.status === 'pending' && (
                <>
                  <ActionButton primary onClick={() => {
                    handleUpdateReportStatus(selectedReport.id, 'resolved');
                    setShowReportModal(false);
                  }}>
                    <FaCheck /> Resolve
                  </ActionButton>
                  <ActionButton onClick={() => {
                    handleUpdateReportStatus(selectedReport.id, 'rejected');
                    setShowReportModal(false);
                  }}>
                    <FaTimes /> Reject
                  </ActionButton>
                </>
              )}
              <ActionButton onClick={() => setShowReportModal(false)}>
                Close
              </ActionButton>
            </div>
          </Modal>
        </ModalOverlay>
      )}
    </DashboardContainer>
  );
};

export default AdminDashboard;