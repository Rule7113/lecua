import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaHistory, FaTrash, FaSearch, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useChat } from './ChatInterface';
import client, { endpoints } from '../api/client';

// Styled component for the main container of the history page
const HistoryContainer = styled.div`
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

// Styled component for the title of the page
const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
`;

// Styled component for the search container
const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

// Styled component for the search input field
const SearchInput = styled.input`
  width: 100%;
  padding: 8px 16px;
  padding-left: 40px;
  background-color: var(--background-dark);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 14px;

  &:focus {
  outline: none;
    border-color: var(--primary);
  }
`;

// Styled component for the search icon
const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
`;

// Styled component for the chat list
const ChatList = styled.div`
  display: grid;
  gap: 16px;
`;

// Styled component for individual chat cards
const ChatCard = styled.div`
  background-color: var(--background-light);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

// Styled component for the information section of a chat card
const ChatInfo = styled.div`
  flex: 1;
`;

// Styled component for the title of a chat card
const ChatTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
`;

// Styled component for the date of a chat card
const ChatDate = styled.p`
  font-size: 12px;
  color: var(--text-secondary);
`;

// Styled component for the actions section of a chat card
const ChatActions = styled.div`
  display: flex;
  gap: 8px;
`;

// Styled component for the action buttons in a chat card
const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: ${props => props.delete ? 'var(--error)' : 'var(--primary)'};
    background-color: ${props => props.delete ? 'var(--error-light)' : 'var(--primary-light)'};
  }
`;

// Styled component for the empty state message
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
`;

const History = () => {
  const [archivedChats, setArchivedChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setMessages } = useChat();

  // Effect to load archived chats from API and localStorage
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoading(true);
        // Get user from localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (!user) {
          throw new Error('User not found');
        }

        // Fetch chat history from API
        const response = await client.get('analyses/');
        if (response.data) {
          setArchivedChats(response.data);
          localStorage.setItem('archivedChats', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        setError('Failed to load chat history');
        
        // Fallback to localStorage if API fails
    const savedChats = localStorage.getItem('archivedChats');
    if (savedChats) {
      setArchivedChats(JSON.parse(savedChats));
      }
      } finally {
        setIsLoading(false);
      }
    };

    loadChatHistory();
  }, []);

  // Filter chats by search query
  const filteredChats = archivedChats.filter(chat => 
    (chat.title || chat.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle click on a chat card
  const handleChatClick = (chat) => {
    if (chat.messages) {
    setMessages(chat.messages);
    } else if (chat.content) {
      setMessages([{ type: 'assistant', content: chat.content }]);
    }
    navigate('/dashboard');
  };

  // Handle deletion of a chat
  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    const updatedChats = archivedChats.filter(chat => chat.id !== chatId);
    setArchivedChats(updatedChats);
    localStorage.setItem('archivedChats', JSON.stringify(updatedChats));
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <HistoryContainer>
      <Header>
        <Title>
          <FaHistory />
          Chat History
        </Title>
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
      </Header>

      {isLoading ? (
        <EmptyState>
          <h3>Loading chat history...</h3>
        </EmptyState>
      ) : error ? (
        <EmptyState>
          <h3>{error}</h3>
          <p>Please try refreshing the page</p>
        </EmptyState>
      ) : filteredChats.length > 0 ? (
        <ChatList>
          {filteredChats.map((chat) => (
            <ChatCard key={chat.id || Date.now()} onClick={() => handleChatClick(chat)}>
              <ChatInfo>
                <ChatTitle>{chat.title || chat.content?.substring(0, 30) + '...' || 'Untitled Chat'}</ChatTitle>
                <ChatDate>{formatDate(chat.created_at || chat.timestamp || chat.upload_date)}</ChatDate>
              </ChatInfo>
              <ChatActions>
                <ActionButton onClick={(e) => handleChatClick(chat)}>
              <FaFileAlt />
                </ActionButton>
                <ActionButton delete onClick={(e) => handleDeleteChat(chat.id, e)}>
                  <FaTrash />
                </ActionButton>
              </ChatActions>
            </ChatCard>
          ))}
        </ChatList>
      ) : (
        <EmptyState>
          <FaHistory size={48} />
          <h3>No chat history found</h3>
          <p>Your analyzed documents will appear here</p>
        </EmptyState>
      )}
    </HistoryContainer>
  );
};

export default History; 