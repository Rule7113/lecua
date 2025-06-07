import styled, { keyframes } from 'styled-components';

export const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
`;

export const Title = styled.h1`
  color: #2c3e50;
  text-align: center;
  margin-bottom: 2rem;
`;

export const Form = styled.form`
  background: #f9f9f9;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const TextArea = styled.textarea`
  width: 100%;
  height: 200px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 2px solid #3498db;
  border-radius: 4px;
  resize: vertical;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #2980b9;
  }
`;

export const Button = styled.button`
  background: ${props => props.loading ? '#95a5a6' : '#3498db'};
  color: white;
  padding: 0.8rem 2rem;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.loading ? 'not-allowed' : 'pointer'};
  font-size: 16px;
  transition: background 0.3s ease;

  &:hover {
    background: ${props => props.loading ? '#95a5a6' : '#2980b9'};
  }
`;

export const ResultSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export const ResultTitle = styled.h3`
  color: #27ae60;
  margin-bottom: 1rem;
`;

export const ResultContent = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  color: #2c3e50;
`;

export const FileUpload = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 2px dashed #ccc;
  border-radius: 5px;
  background-color: #f8f9fa;
  cursor: pointer;
  
  &:hover {
    border-color: #007bff;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const WelcomeMessage = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #007bff;
  color: white;
  padding: 15px 30px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;
  z-index: 1000;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 500;
`;

export const FileInfo = styled.div`
  margin: 10px 0;
  padding: 8px 12px;
  background-color: #e9ecef;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #495057;
`;