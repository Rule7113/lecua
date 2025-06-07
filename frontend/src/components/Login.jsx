import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaLock, FaSpinner, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

// Container styling with gradient background and radial overlay
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    pointer-events: none;
  }
`;

// Form styling with hover effect and backdrop filter
const Form = styled.form`
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transform: translateY(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

// Title styling of the login form
const Title = styled.h1`
  color: #1a1a1a;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 32px;
  text-align: center;
  letter-spacing: -0.5px;
`;

// Styles for form groups containing labels and inputs
const FormGroup = styled.div`
  margin-bottom: 24px;
  position: relative;
`;

// Label styling for form inputs
const Label = styled.label`
  display: block;
  color: #666666;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 500;
`;

// Wrapper for inputs to position icons
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

// Icon wrapper styling for input icons
const IconWrapper = styled.div`
  position: absolute;
  left: 12px;
  color: #666666;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Input styling with focus effects
const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  color: #1a1a1a;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }

  &::placeholder {
    color: #999999;
  }
`;

// Button styling with hover and active state effects
const Button = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: #1565c0;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Styling for error messages if login fails
const ErrorMessage = styled.div`
  color: var(--error);
  font-size: 14px;
  padding: 12px;
  background-color: var(--error-light);
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Styling for success messages if login is successful
const SuccessMessage = styled.div`
  color: var(--success);
  font-size: 14px;
  padding: 12px;
  background-color: var(--success-light);
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Styling for the signup link
const SignupLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 24px;
  color: #1976d2;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;

  &:hover {
    color: #1565c0;
    text-decoration: underline;
  }
`;

// Spinner styling for loading state
const Spinner = styled(FaSpinner)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userData = await login(formData.email, formData.password);
      setSuccess('Login successful! Redirecting...');
      
      // Redirect based on account type
      setTimeout(() => {
        if (userData.account_type === 'admin') {
          navigate('/admin-dashboard');
        } else {
        navigate('/dashboard');
        }
      }, 1500);
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.status === 400) {
        setError('Please fill in all required fields');
        } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>Welcome Back</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        <FormGroup>
          <Label>Email</Label>
          <InputWrapper>
            <IconWrapper>
              <FaEnvelope />
            </IconWrapper>
          <Input
            type="email"
              name="email"
            placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            required
          />
          </InputWrapper>
        </FormGroup>
        <FormGroup>
          <Label>Password</Label>
          <InputWrapper>
            <IconWrapper>
              <FaLock />
            </IconWrapper>
          <Input
            type="password"
              name="password"
            placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            required
          />
          </InputWrapper>
        </FormGroup>
        <Button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
        <SignupLink to="/signup">
          Don't have an account? Sign up
        </SignupLink>
      </Form>
    </Container>
  );
};

export default Login;

