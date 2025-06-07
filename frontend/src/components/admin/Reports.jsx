import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCheck, FaTimes, FaEye, FaSearch } from 'react-icons/fa';
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

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'pending': return 'var(--warning)';
      case 'resolved': return 'var(--success)';
      case 'rejected': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  }};
  color: white;
`;

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await client.get(endpoints.admin.reports);
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      await client.patch(`${endpoints.reports.update}${reportId}/`, { status: newStatus });
      setReports(reports.map(report => 
        report.id === reportId ? { ...report, status: newStatus } : report
      ));
    } catch (error) {
      console.error('Failed to update report status:', error);
      alert('Failed to update report status. Please try again.');
    }
  };

  const filteredReports = reports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <Header>
        <Title>Reports & Issues</Title>
      </Header>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      <Table>
        <thead>
          <tr>
            <Th>Title</Th>
            <Th>Type</Th>
            <Th>Priority</Th>
            <Th>Status</Th>
            <Th>Submitted By</Th>
            <Th>Date</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredReports.map(report => (
            <tr key={report.id}>
              <Td>{report.title}</Td>
              <Td>{report.type}</Td>
              <Td>{report.priority}</Td>
              <Td>
                <StatusBadge status={report.status}>
                  {report.status}
                </StatusBadge>
              </Td>
              <Td>{report.submitted_by}</Td>
              <Td>{new Date(report.created_at).toLocaleDateString()}</Td>
              <Td>
                {report.status === 'pending' && (
                  <>
                    <Button primary onClick={() => handleUpdateStatus(report.id, 'resolved')}>
                      <FaCheck /> Resolve
                    </Button>
                    <Button onClick={() => handleUpdateStatus(report.id, 'rejected')}>
                      <FaTimes /> Reject
                    </Button>
                  </>
                )}
                <Button onClick={() => window.open(`/admin-dashboard/reports/${report.id}`, '_blank')}>
                  <FaEye /> View
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Reports; 