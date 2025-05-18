import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  padding: ${({ theme }) => theme.spacing.xl};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.h2.fontSize};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
`;

const AuthButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`;

// Fix: Properly type the primary prop to prevent it from being passed to DOM
const Button = styled(Link)`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  ${({ primary, theme }) =>
    primary
      ? `
        background: ${theme.colors.primary};
        color: ${theme.colors.white};
        &:hover {
          background: ${theme.colors.primaryDark};
        }
      `
      : `
        color: ${theme.colors.primary};
        &:hover {
          background: ${theme.colors.background};
        }
      `}
`;

// Create a props object for Button to handle the primary prop correctly
// This ensures 'primary' doesn't get passed to the DOM element
Button.defaultProps = {
  primary: false
};

const Hero = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xxl};
  background: linear-gradient(
    135deg,
    ${({ theme }) => `${theme.colors.background} 0%,
    ${theme.colors.white} 100%`}
  );
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.h1.fontSize};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.body.fontSize};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 600px;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  line-height: 1.6;
`;

const Features = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xxl};
`;

const Feature = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: transform 0.2s ease;
  &:hover {
    transform: translateY(-4px);
  }
  h3 {
    font-size: ${({ theme }) => theme.typography.h3.fontSize};
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.xl}`};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`;

export default function WelcomePage() {
  return (
    <Container>
      <Header>
        <Logo>LECUA</Logo>
        <AuthButtons>
          <Button to="/login">Log in</Button>
          <Button to="/signup" primary>Sign up</Button>
        </AuthButtons>
      </Header>
      <Hero>
        <Title>Legal Contract Analysis Made Simple</Title>
        <Subtitle>
          Upload your contracts or type them directly for instant AI-powered analysis,
          insights, and understanding. Get clear, actionable feedback in seconds.
        </Subtitle>
        <CTAButton to="/signup">Get Started</CTAButton>
      </Hero>
      <Features>
        <Feature>
          <h3>Smart Analysis</h3>
          <p>
            Our AI analyzes contracts in seconds, identifying key clauses, potential
            risks, and important terms you need to know about.
          </p>
        </Feature>
        <Feature>
          <h3>Flexible Input</h3>
          <p>
            Upload PDF contracts or type/paste contract text directly. Our system
            handles both with equal precision and insight.
          </p>
        </Feature>
        <Feature>
          <h3>Clear Insights</h3>
          <p>
            Get plain-language explanations and actionable insights about your
            contracts in an easy-to-understand format.
          </p>
        </Feature>
      </Features>
    </Container>
  );
}