import React, { useState, useEffect, createContext, useContext } from 'react';
import styled from 'styled-components';
import { FaUpload, FaSpinner, FaPaperclip, FaSearch, FaFileExport } from 'react-icons/fa';
import axios from 'axios';
import client, { endpoints } from '../api/client';
import Sidebar from './Sidebar';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Create ChatContext
export const ChatContext = createContext();

// ChatProvider component
export const ChatProvider = ({ children }) => {
  // State variables for chat data
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Reset chat function
  const resetChat = () => {
    setMessages([]);
    setSelectedFile(null);
  };

  // Value object to be passed to Context Provider
  const value = {
    messages,
    setMessages,
    loading,
    setLoading,
    loadingStep,
    setLoadingStep,
    selectedFile,
    setSelectedFile,
    resetChat,
  };

  // Return ChatContext provider with value and children
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use ChatContext
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Styled components
const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--background-dark);
  margin-left: ${props => props.$sidebarCollapsed ? '60px' : '250px'};
  transition: margin-left 0.3s ease;
  @media (max-width: 768px) {
    margin-left: ${props => props.$sidebarCollapsed ? '0' : '250px'};
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
  color: #ffffff;
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
  color: #ffffff;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.background || 'var(--background-dark)'};
`;
const ChatContent = styled.div`
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: ${({ theme }) => theme.colors.background || 'var(--background-dark)'};
  margin-bottom: 2rem;
`;
const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
  margin: 2rem auto; 
  width: 100%;
  height: 100%;
`;
const Message = styled.div`
  background-color: ${props => props.$isUser ? 'transparent' : 'var(--background-light)'};
  padding: 16px 24px;
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-wrap;
  box-shadow: ${({ $isUser, theme }) => !$isUser ? theme.shadows?.sm || '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  border: ${({ $isUser, theme }) => !$isUser ? `1px solid ${theme.colors.text?.light || 'var(--border-color)'}20` : 'none'};
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
  bottom: 0;
  left: ${props => props.$sidebarCollapsed ? '60px' : '250px'};
  right: 0;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.backgroundLight || 'var(--background-light)'};
  border-top: 1px solid ${({ theme }) => theme.colors.text?.light || 'var(--border-color)'}20;
  transition: left 0.3s ease;
  margin-top: 2rem;
  @media (max-width: 768px) {
    left: ${props => props.$sidebarCollapsed ? '0' : '250px'};
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
  background-color: ${({ theme }) => theme.colors.backgroundDark || 'var(--background-dark)'};
  border: 1px solid ${({ theme }) => theme.colors.text?.light || 'var(--border-color)'}40;
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.95rem;
  resize: none;
  overflow-y: auto;
  min-height: 60px;
  max-height: 60vh;
  height: auto;
  margin-top: 12px;
  transition: all 0.3s ease;
  
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
  color: #ffffff;
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
const ExportButton = styled(IconButton)`
  position: absolute;
  right: 120px;
  bottom: 12px;
  background-color: ${({ theme }) => theme.colors.primary || 'var(--accent-blue)'};
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark || 'var(--accent-blue-dark)'};
  }
  
  span {
    display: ${props => props.$sidebarCollapsed ? 'none' : 'inline'};
  }
`;
const ExportMenu = styled.div`
  position: absolute;
  right: 120px;
  bottom: 60px;
  background:rgb(74, 149, 219);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: ${props => props.$show ? 'block' : 'none'};
  z-index: 1000;
`;
const ExportMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: bold;
  padding: 8px 16px;
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-primary);
  
  &:hover {
    background: var(--hover);
  }
`;
const ChatInterface = ({ sidebarCollapsed: initialSidebarCollapsed = false }) => {
  const [sidebarCollapsedState, setSidebarCollapsedState] = useState(initialSidebarCollapsed);
  const [content, setContent] = useState('');
  const [user, setUser] = useState(null);
  const {
    messages,
    setMessages,
    loading,
    setLoading,
    loadingStep,
    setLoadingStep,
    selectedFile,
    setSelectedFile,
    resetChat,
  } = useChat();
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('No token found, redirecting to login');
          window.location.href = '/login';
          return;
        }
        const response = await client.get(endpoints.auth.user);
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
        const response = await client.post(
          endpoints.analysis.upload,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          }
        );
        console.log('File upload response:', response.data);
        const scannedText = response.data.content;
        if (scannedText) {
        setContent(scannedText);
          // Adjust textarea height after content is set
          setTimeout(() => {
            const textarea = document.querySelector('textarea');
            if (textarea) {
              textarea.style.height = 'auto';
              const newHeight = Math.min(textarea.scrollHeight, window.innerHeight * 0.6);
              textarea.style.height = `${newHeight}px`;
            }
          }, 0);
        setMessages([
          ...messages,
          { type: 'user', content: `Uploaded file: ${file.name}` }
        ]);
        } else {
          throw new Error('No content extracted from file');
        }
      } catch (error) {
        console.error('Error scanning document:', error);
        setMessages([
          ...messages,
          { type: 'system', content: `Error scanning document: ${error.message || 'Please try again.'}` }
        ]);
      } finally {
        setLoading(false);
        setLoadingStep('');
      }
    }
  };
  const handleAnalyze = async () => {
    if (!content.trim()) return;
    const userMessage = content;
    setMessages([...messages, { type: 'user', content: userMessage }]);
    setContent('');
    setLoading(true);
    setLoadingStep('analyzing');
    try {
      const response = await client.post(
        endpoints.analysis.analyze,
        { text: userMessage }
      );
      const formattedAnalysis = response.data.result
        ? response.data.result
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
  const handleInput = (e) => {
    const target = e.target;
    target.style.height = 'auto';
    const newHeight = Math.min(target.scrollHeight, window.innerHeight * 0.6);
    target.style.height = `${newHeight}px`;
    setContent(target.value);
  };
  const exportToPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    
    messages.forEach((message, index) => {
      const text = `${message.type === 'user' ? 'User' : 'Assistant'}: ${message.content}`;
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 20, y);
      y += splitText.length * 7;
      
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    
    doc.save('chat-analysis.pdf');
  };

  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: messages.map(message => 
          new Paragraph({
            children: [
              new TextRun({
                text: `${message.type === 'user' ? 'User' : 'Assistant'}: ${message.content}`,
                bold: message.type === 'user'
              })
            ]
          })
        )
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, 'chat-analysis.docx');
  };

  return (
    <>
      <Sidebar 
        isCollapsed={sidebarCollapsedState} 
        onCollapse={setSidebarCollapsedState} 
      />
      <ChatContainer $sidebarCollapsed={sidebarCollapsedState}>
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
              <Message key={index} $isUser={message.type === 'user'}>
                {message.content}
              </Message>
            ))}
            {loading && (
              <LoadingMessage $isUser={false}>
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
        <InputContainer $sidebarCollapsed={sidebarCollapsedState}>
          <InputWrapper>
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onInput={handleInput}
              onKeyPress={handleKeyPress}
              placeholder="Upload a legal document or paste your contract..."
              disabled={loading}
            />
            {messages.length > 0 && (
              <>
                <ExportButton
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  $sidebarCollapsed={sidebarCollapsedState}
                >
                  <FaFileExport />
                  {!sidebarCollapsedState && <span>Export</span>}
                </ExportButton>
                <ExportMenu $show={showExportMenu}>
                  <ExportMenuItem onClick={() => {
                    exportToPDF();
                    setShowExportMenu(false);
                  }}>
                    Export as PDF
                  </ExportMenuItem>
                  <ExportMenuItem onClick={() => {
                    exportToWord();
                    setShowExportMenu(false);
                  }}>
                    Export as Word
                  </ExportMenuItem>
                </ExportMenu>
              </>
            )}
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