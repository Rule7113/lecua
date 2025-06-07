import client from './client';

// Auth services

// Function to log in a user using their email and password
export const login = async (email, password) => {
  const response = await client.post('/token/', { email, password });
  return response.data;
};

// Function to register a new user with the provided user data
export const register = async (userData) => {
  const response = await client.post('/register/', userData);
  return response.data;
};

// Function to refresh an authentication token using a refresh token
export const refreshToken = async (refresh) => {
  const response = await client.post('/token/refresh/', { refresh });
  return response.data;
};

// Function to retrieve the profile information of the currently authenticated user
export const getUserProfile = async () => {
  const response = await client.get('/user/');
  return response.data;
};

// Document services

// Function to upload a document with the given form data
export const uploadDocument = async (formData) => {
  const response = await client.post('/documents/upload/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Function to fetch the documents associated with the currently authenticated user
export const getUserDocuments = async () => {
  const response = await client.get('/documents/');
  return response.data;
};

// Function to analyze a provided text string
export const analyzeText = async (text) => {
  try {
    const response = await client.post('/analyze-text/', { text });
    return response.data;
  } catch (error) {
    console.error('Error analyzing text:', error);
    throw error;
  }
};

// Function to get the analysis of a document using its document ID
export const getDocumentAnalysis = async (documentId) => {
  const response = await client.get(`/documents/${documentId}/analysis/`);
  return response.data;
};
