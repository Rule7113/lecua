import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaUserShield, 
  FaExclamationTriangle, 
  FaDatabase, 
  FaChartBar, 
  FaCog,
  FaUsers,
  FaKey
} from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';
import client, { endpoints } from '../api/client';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--background-main);
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  margin-left: 250px;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: var(--text-secondary);
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: var(--background-card);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.color}15;
  color: ${props => props.color};
  font-size: 1.25rem;
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const StatDescription = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const RecentActivity = styled.div`
  background-color: var(--background-card);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
`;

const ActivityHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ActivitySectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.375rem;
  background-color: var(--background-light);
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--hover-light);
  }
`;

const ActivityIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.color}15;
  color: ${props => props.color};
  font-size: 1.25rem;
  margin-right: 1rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.p`
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const ActivityTime = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalReports: 0,
    pendingReports: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch dashboard data from admin endpoint
        const response = await client.get(endpoints.admin.dashboard);
        const data = response.data;

        setStats({
          totalUsers: data.stats.total_users,
          activeUsers: data.stats.total_users, // You might want to add active_users to the backend response
          totalReports: data.stats.total_documents,
          pendingReports: data.stats.pending_reports,
        });

        // Combine and sort recent activities
        const activities = [
          ...data.recent_users.map(user => ({
            type: 'user',
            title: 'New User Registration',
            description: `${user.username} joined the platform`,
            time: new Date(user.created_at),
            icon: <FaUsers />,
            color: 'var(--primary)',
          })),
          ...data.recent_reports.map(report => ({
            type: 'report',
            title: 'New Report Submitted',
            description: `Report #${report.id} was submitted`,
            time: new Date(report.created_at),
            icon: <FaExclamationTriangle />,
            color: 'var(--error)',
          })),
        ].sort((a, b) => b.time - a.time).slice(0, 5);

        setRecentActivity(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <DashboardContainer>
      <AdminSidebar />
      <MainContent>
        <Header>
          <Title>Admin Dashboard</Title>
          <Subtitle>Welcome back! Here's what's happening with your system.</Subtitle>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatHeader>
              <StatTitle>Total Users</StatTitle>
              <StatIcon color="var(--primary)">
                <FaUsers />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatDescription>Total registered users in the system</StatDescription>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatTitle>Active Users</StatTitle>
              <StatIcon color="var(--success)">
                <FaUserShield />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.activeUsers}</StatValue>
            <StatDescription>Currently active users</StatDescription>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatTitle>Total Documents</StatTitle>
              <StatIcon color="var(--warning)">
                <FaDatabase />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.totalReports}</StatValue>
            <StatDescription>Total documents in the system</StatDescription>
          </StatCard>

          <StatCard>
            <StatHeader>
              <StatTitle>Pending Reports</StatTitle>
              <StatIcon color="var(--error)">
                <FaExclamationTriangle />
              </StatIcon>
            </StatHeader>
            <StatValue>{stats.pendingReports}</StatValue>
            <StatDescription>Reports awaiting review</StatDescription>
          </StatCard>
        </StatsGrid>

        <RecentActivity>
          <ActivityHeader>
            <ActivitySectionTitle>Recent Activity</ActivitySectionTitle>
          </ActivityHeader>
          <ActivityList>
            {recentActivity.map((activity, index) => (
              <ActivityItem key={index}>
                <ActivityIcon color={activity.color}>
                  {activity.icon}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityDescription>{activity.description}</ActivityDescription>
                </ActivityContent>
                <ActivityTime>{formatTime(activity.time)}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityList>
        </RecentActivity>
      </MainContent>
    </DashboardContainer>
  );
};

export default AdminDashboard; 