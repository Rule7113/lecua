import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUsers, FaFileAlt, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import client, { endpoints } from '../../api/client';

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: var(--background-light);
  padding: 24px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: ${props => props.color};
  color: white;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  color: var(--text-secondary);
  font-size: 14px;
`;

const ChartContainer = styled.div`
  background: var(--background-light);
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const ChartTitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
`;

const Chart = styled.div`
  height: 300px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 16px 0;
`;

const Bar = styled.div`
  flex: 1;
  background: var(--primary);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  position: relative;
  
  &:hover {
    opacity: 0.8;
  }
`;

const BarLabel = styled.div`
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
`;

const Analytics = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_documents: 0,
    total_reports: 0,
    active_users: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityData, setActivityData] = useState({
    user_registrations: [],
    document_uploads: [],
    report_submissions: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await client.get(endpoints.admin.analytics);
      setStats({
        total_users: response.data.total_users,
        total_documents: response.data.total_documents,
        total_reports: response.data.total_reports,
        active_users: response.data.active_users
      });
      setActivityData({
        user_registrations: response.data.user_registrations,
        document_uploads: response.data.document_uploads,
        report_submissions: response.data.report_submissions
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getMaxValue = (data) => {
    return Math.max(...data.map(item => item.count));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <Header>
        <Title>Analytics Dashboard</Title>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="var(--primary)">
            <FaUsers />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.total_users}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="var(--success)">
            <FaFileAlt />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.total_documents}</StatValue>
            <StatLabel>Total Documents</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="var(--warning)">
            <FaExclamationTriangle />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.total_reports}</StatValue>
            <StatLabel>Total Reports</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon color="var(--info)">
            <FaChartLine />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.active_users}</StatValue>
            <StatLabel>Active Users</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <ChartContainer>
        <ChartTitle>User Registrations (Last 7 Days)</ChartTitle>
        <Chart>
          {activityData.user_registrations.map((item, index) => {
            const maxValue = getMaxValue(activityData.user_registrations);
            const height = (item.count / maxValue) * 100;
            
            return (
              <Bar 
                key={index} 
                style={{ height: `${height}%` }}
                title={`${item.day}: ${item.count}`}
              >
                <BarLabel>{item.day}</BarLabel>
              </Bar>
            );
          })}
        </Chart>
      </ChartContainer>

      <ChartContainer>
        <ChartTitle>Document Uploads (Last 7 Days)</ChartTitle>
        <Chart>
          {activityData.document_uploads.map((item, index) => {
            const maxValue = getMaxValue(activityData.document_uploads);
            const height = (item.count / maxValue) * 100;
            
            return (
              <Bar 
                key={index} 
                style={{ height: `${height}%` }}
                title={`${item.day}: ${item.count}`}
              >
                <BarLabel>{item.day}</BarLabel>
              </Bar>
            );
          })}
        </Chart>
      </ChartContainer>

      <ChartContainer>
        <ChartTitle>Report Submissions (Last 7 Days)</ChartTitle>
        <Chart>
          {activityData.report_submissions.map((item, index) => {
            const maxValue = getMaxValue(activityData.report_submissions);
            const height = (item.count / maxValue) * 100;
            
            return (
              <Bar 
                key={index} 
                style={{ height: `${height}%` }}
                title={`${item.day}: ${item.count}`}
              >
                <BarLabel>{item.day}</BarLabel>
              </Bar>
            );
          })}
        </Chart>
      </ChartContainer>
    </Container>
  );
};

export default Analytics; 