import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBug, FaTimes, FaPaperPlane } from 'react-icons/fa';
import client, { endpoints } from '../api/client';

// Styled container for the report panel
const ReportContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 400px;
  background-color: var(--background-light);
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`;

// Styled header for the report panel
const ReportHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Title styling for the report panel
const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 12px;
`;

// Styled button to close the report panel
const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--hover);
  }
`;

// Styled content area for the form within the report panel
const ReportContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
`;

// Styled form component for submitting an issue
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

// Wrapper for form groupings
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Label styling for form fields
const Label = styled.label`
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
`;

// Styled input for text inputs in the form
const Input = styled.input`
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-dark);
  color: var(--text-primary);
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

// Styled textarea for larger text inputs
const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-dark);
  color: var(--text-primary);
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

// Styled select dropdown for choosing options
const Select = styled.select`
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--background-dark);
  color: var(--text-primary);
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
  }
`;

// Styled submit button for the form
const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: var(--text-secondary);
    cursor: not-allowed;
    transform: none;
  }
`;

// Styled message component for displaying errors
const ErrorMessage = styled.div`
  color: var(--error);
  font-size: 14px;
  padding: 8px;
  background-color: var(--error-light);
  border-radius: 4px;
  margin-top: 8px;
`;

// Styled message component for displaying success messages
const SuccessMessage = styled.div`
  color: var(--success);
  font-size: 14px;
  padding: 8px;
  background-color: var(--success-light);
  border-radius: 4px;
  margin-top: 8px;
`;

// Main component for reporting an issue
const ReportIssue = ({ onClose }) => {
  // Form state management
  const [formData, setFormData] = useState({
    type: 'bug',
    title: '',
    description: '',
    steps: '',
    priority: 'medium',
    status: 'pending',
    user_id: null,
    username: '',
    submitted_at: null
  });

  // Loading state management
  const [loading, setLoading] = useState(false);

  // Error state management
  const [error, setError] = useState('');

  // Success state management
  const [success, setSuccess] = useState('');

  // Load user information from local storage
  useEffect(() => {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setFormData(prev => ({
      ...prev,
      user_id: user.id,
      username: user.username
    }));
  }, []);

  // Handler for form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Add submission timestamp
      const reportData = {
        ...formData,
        submitted_at: new Date().toISOString()
      };

      // Submit report to backend
      const response = await client.post(endpoints.reports.create, reportData);
      
      // Notify admins about new report
      try {
        await client.post(endpoints.notifications.create, {
        type: 'new_report',
        report_id: response.data.id,
        title: formData.title,
        priority: formData.priority
      });
      } catch (notifyError) {
        console.error('Failed to notify admins:', notifyError);
        // Continue with success message even if notification fails
      }

      setSuccess('Report submitted successfully. An admin will review it shortly.');
      setFormData({
        type: 'bug',
        title: '',
        description: '',
        steps: '',
        priority: 'medium',
        status: 'pending',
        user_id: formData.user_id,
        username: formData.username,
        submitted_at: null
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReportContainer>
      <ReportHeader>
        <Title>
          <FaBug />
          Report an Issue
        </Title>
        <CloseButton onClick={onClose}>×</CloseButton>
      </ReportHeader>

      <ReportContent>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Issue Type</Label>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="bug">Bug</option>
              <option value="feature">Feature Request</option>
              <option value="improvement">Improvement</option>
              <option value="other">Other</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Title</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief description of the issue"
          required
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of the issue"
          required
            />
          </FormGroup>

          <FormGroup>
            <Label>Steps to Reproduce</Label>
            <TextArea
              name="steps"
              value={formData.steps}
              onChange={handleChange}
              placeholder="1. First step&#10;2. Second step&#10;3. ..."
            />
          </FormGroup>

          <FormGroup>
            <Label>Priority</Label>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Select>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <SubmitButton type="submit" disabled={loading}>
            <FaPaperPlane />
            {loading ? 'Submitting...' : 'Submit Report'}
          </SubmitButton>
        </Form>
      </ReportContent>
    </ReportContainer>
  );
};

export default ReportIssue;