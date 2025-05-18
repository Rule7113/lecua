import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaUpload, FaSpinner, FaPaperclip, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import client from '../api/client';
import Sidebar from './Sidebar'; 

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--background-dark);
  margin-left: ${props => props.sidebarCollapsed ? '60px' : '250px'};
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
    margin-left: ${props => props.sidebarCollapsed ? '0' : '250px'};
  }
`;

const ChatHeader = styled.div`
  padding: 16px 24px;
  background-color: ${({ theme }) => theme.colors.backgroundLight || 'var(--background-light)'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.text?.light || 'var(--border-color)'}20;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text?.primary || 'var(--text-primary)'};
  font-size: 1.1rem;
  font-weight: 500;
`;

const ModelSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.colors.text?.light || 'var(--border-color)'}40;
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.text?.secondary || 'var(--text-secondary)'};
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.background || 'var(--background-dark)'};
`;

const ChatContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: ${({ theme }) => theme.colors.background || 'var(--background-dark)'};
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
`;

const Message = styled.div`
  background-color: ${props => props.isUser ? 'transparent' : 'var(--background-light)'};
  padding: 16px 24px;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap;
  box-shadow: ${({ isUser, theme }) => !isUser ? theme.shadows?.sm || '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  border: ${({ isUser, theme }) => !isUser ? `1px solid ${theme.colors.text?.light || 'var(--border-color)'}20` : 'none'};
`;

const LoadingMessage = styled(Message)`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LoadingStep = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.text?.secondary || 'var(--text-secondary)'};
  
  &.active {
    color: ${({ theme }) => theme.colors.primary || 'var(--accent-blue)'};
  }
`;

const LoadingSpinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  color: ${({ theme }) => theme.colors.primary || 'var(--accent-blue)'};
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const InputContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: ${props => props.sidebarCollapsed ? '60px' : '250px'};
  right: 0;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.backgroundLight || 'var(--background-light)'};
  border-top: 1px solid ${({ theme }) => theme.colors.text?.light || 'var(--border-color)'}20;
  transition: left 0.3s ease;

  @media (max-width: 768px) {
    left: ${props => props.sidebarCollapsed ? '0' : '250px'};
  }
`;

const InputWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 16px;
  padding-right: 100px;
  background-color: ${({ theme }) => theme.colors.background || 'var(--background-dark)'};
  border: 1px solid ${({ theme }) => theme.colors.text?.light || 'var(--border-color)'}40;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text?.primary || 'var(--text-primary)'};
  font-size: 0.95rem;
  resize: none;
  min-height: 60px;
  max-height: 200px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary || 'var(--accent-blue)'};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary || 'var(--accent-blue)'}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text?.secondary || 'var(--text-secondary)'};
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.text?.secondary || 'var(--text-secondary)'};
  padding: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary || 'var(--accent-blue)'};
    background-color: ${({ theme }) => theme.colors.background || 'var(--background-dark)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ChatInterface = ({ sidebarCollapsed: initialSidebarCollapsed = false }) => {
  const [sidebarCollapsedState, setSidebarCollapsedState] = useState(initialSidebarCollapsed);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('No token found, redirecting to login');
          window.location.href = '/login';
          return;
        }

        // Get user info
        const response = await client.get('/auth/user/');
        console.log('User info:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    };

    checkAuth();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setLoading(true);
      setLoadingStep('scanning');

      try {
        const formData = new FormData();
        formData.append('file', file);

        const scanResponse = await axios.post(
          'http://localhost:8000/api/analyze/',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );

        const scannedText = scanResponse.data.scanned_text || '';
        setContent(scannedText);
        setMessages([
          ...messages,
          { type: 'user', content: `Uploaded file: ${file.name}` },
          { type: 'assistant', content: scannedText }
        ]);
      } catch (error) {
        console.error('Error scanning document:', error);
        setMessages([
          ...messages,
          { type: 'system', content: 'Error scanning document. Please try again.' }
        ]);
      } finally {
        setLoading(false);
        setLoadingStep('');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim() && !selectedFile) return;
    
    const userMessage = content;
    setMessages([...messages, { type: 'user', content: userMessage }]);
    setContent('');
    setLoading(true);
    setLoadingStep('analyzing');

    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('content', userMessage);
      formData.append('analyze', 'true');

      const response = await axios.post(
        'http://localhost:8000/api/analyze/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      
      // Format the analysis result to maintain structure
      const formattedAnalysis = response.data.analysis
        ? response.data.analysis
            .replace(/--- BEGIN REPORT ---\n/, '')
            .replace(/--- END REPORT ---\n/, '')
            .trim()
        : 'No analysis returned from server.';
      
      setMessages(prev => [...prev, { type: 'assistant', content: formattedAnalysis }]);
    } catch (error) {
      console.error('Analysis failed:', error);
      setMessages(prev => [...prev, { 
        type: 'system', 
        content: `Analysis failed: ${error.response?.data?.error || error.message || 'Please try again.'}`
      }]);
    } finally {
      setLoading(false);
      setLoadingStep('');
      setSelectedFile(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  return (
    <>
      <Sidebar 
        isCollapsed={sidebarCollapsedState} 
        onCollapse={setSidebarCollapsedState} 
      />
      <ChatContainer sidebarCollapsed={sidebarCollapsedState}>
        <ChatHeader>
          <Title>Legal Document Analyzer</Title>
          <ModelSelector>
            <FaSearch size={12} />
            <span>LECUA v1.0</span>
          </ModelSelector>
        </ChatHeader>
        
        <ChatContent>
          <MessageContainer>
            {messages.map((message, index) => (
              <Message key={index} isUser={message.type === 'user'}>
                {message.content}
              </Message>
            ))}
            {loading && (
              <LoadingMessage isUser={false}>
                <LoadingStep className={loadingStep === 'scanning' ? 'active' : ''}>
                  <LoadingSpinner size={14} />
                  {loadingStep === 'scanning' ? 'Scanning document...' : 'Document scanned'}
                </LoadingStep>
                <LoadingStep className={loadingStep === 'analyzing' ? 'active' : ''}>
                  <LoadingSpinner size={14} />
                  {loadingStep === 'analyzing' ? 'Analyzing contract...' : 'Contract analyzed'}
                </LoadingStep>
                <LoadingStep>
                  <LoadingSpinner size={14} />
                  Generating report...
                </LoadingStep>
              </LoadingMessage>
            )}
          </MessageContainer>
        </ChatContent>

        <InputContainer sidebarCollapsed={sidebarCollapsedState}>
          <InputWrapper>
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Upload a legal document or type your question..."
              disabled={loading}
            />
            <ActionButtons>
              <IconButton
                onClick={() => document.getElementById('fileInput').click()}
                disabled={loading}
              >
                <FaPaperclip />
              </IconButton>
              <IconButton
                onClick={handleAnalyze}
                disabled={loading || (!content.trim() && !selectedFile)}
              >
                {loading ? <FaSpinner className="fa-spin" /> : <FaUpload />}
              </IconButton>
            </ActionButtons>
            <FileInput
              id="fileInput"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />
          </InputWrapper>
        </InputContainer>
      </ChatContainer>
    </>
  );
};

export default ChatInterface;