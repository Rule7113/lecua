// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { theme } from './styles/theme';
import WelcomePage from './components/WelcomePage';
import Login from './components/Login';
import Signup from './components/Signup';
import ChatInterface from './components/ChatInterface';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalStyle from './styles/GlobalStyle';

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: var(--background-dark);
`;

const ContentWrapper = styled.div`
  flex: 1;
  transition: margin-left 0.3s ease;

  @media (max-width: 768px) {
  }
`;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <ContentWrapper>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <ChatInterface />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ContentWrapper>
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;