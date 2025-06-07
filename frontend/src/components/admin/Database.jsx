import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaDatabase, FaTable, FaSearch, FaSync } from 'react-icons/fa';
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

const Database = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const fetchDatabaseInfo = async () => {
    try {
      setLoading(true);
      // This endpoint should be added to your backend
      const response = await client.get(endpoints.admin.database);
      setTables(response.data);
    } catch (error) {
      console.error('Failed to fetch database info:', error);
      setError('Failed to load database information. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDatabaseInfo();
  };

  const filteredTables = tables.filter(table => 
    table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    table.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <Header>
        <Title>System Database</Title>
        <Button onClick={handleRefresh}>
          <FaSync /> Refresh
        </Button>
      </Header>

      <SearchBar>
        <SearchInput
          type="text"
          placeholder="Search tables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchBar>

      <Table>
        <thead>
          <tr>
            <Th>Table Name</Th>
            <Th>Description</Th>
            <Th>Records</Th>
            <Th>Last Updated</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filteredTables.map(table => (
            <tr key={table.name}>
              <Td>{table.name}</Td>
              <Td>{table.description}</Td>
              <Td>{table.recordCount}</Td>
              <Td>{new Date(table.lastUpdated).toLocaleString()}</Td>
              <Td>
                <Button onClick={() => window.alert('View table details')}>
                  <FaTable /> View
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Database; 