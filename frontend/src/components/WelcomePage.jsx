import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  Description as DocumentIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';

// Styled component for the main container with gradient background
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    pointer-events: none;
  }
`;

// Styled component to wrap the content for centered alignment and spacing
const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
`;

// Styled component for the page header with text alignment and bottom margin
const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

// Styled component for the main title with specific font styling
const Title = styled.h1`
  color: white;
  font-weight: 800;
  margin-bottom: 1rem;
  font-size: 3.5rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

// Styled component for the subtitle with color, margin, and typography settings
const Subtitle = styled.h2`
  color: white;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.25rem;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

// Styled component for grouping buttons with flex properties
const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Styled component for individual buttons with shared and variant-specific styles
const Button = styled.button`
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background-color: white;
    color: #1976d2;
    border: none;
    box-shadow: 0 4px 14px rgba(0,0,0,0.1);

    &:hover {
      background-color: rgba(255, 255, 255, 0.9);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
  }

  &.secondary {
    background-color: transparent;
    color: white;
    border: 2px solid white;

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }
  }
`;

// Styled component to layout feature cards in a grid
const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Styled component for individual feature cards with appearance and behavior
const FeatureCard = styled.div`
  background-color: rgba(255, 255, 255, 0.95);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0,0,0,0.15);
  }
`;

const IconWrapper = styled.div`
  color: #1976d2;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: rgba(25, 118, 210, 0.1);
`;

const FeatureTitle = styled.h3`
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
`;

const FeatureDescription = styled.p`
  color: #666666;
  font-size: 1.1rem;
  line-height: 1.6;
`;

const WelcomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DocumentIcon sx={{ fontSize: 48 }} />,
      title: 'Document Analysis',
      description: 'Upload and analyze legal documents with advanced AI technology',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 48 }} />,
      title: 'Secure Processing',
      description: 'Your documents are processed securely with end-to-end encryption',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 48 }} />,
      title: 'Quick Results',
      description: 'Get instant analysis and insights from your legal documents',
    },
  ];

  return (
    <Container>
      <ContentWrapper>
        <Header>
          <Title>Legal Contract Analysis</Title>
          <Subtitle>AI-powered legal document analysis and insights</Subtitle>
          <ButtonGroup>
            <Button className="primary" onClick={() => navigate('/login')}>
              Get Started
            </Button>
            <Button className="secondary" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </ButtonGroup>
        </Header>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <IconWrapper>{feature.icon}</IconWrapper>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </ContentWrapper>
    </Container>
  );
};

export default WelcomePage;