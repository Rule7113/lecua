// src/styles/theme.js
export const theme = {
  colors: {
    primary: '#4d6bfe',
    secondary: '#505050',
    background: '#1E1E1E',        // Matching --background-dark
    backgroundLight: '#2D2D2D',   // Matching --background-light
    white: '#FFFFFF',
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    text: {
      primary: '#e8e8e8',
      secondary: '#A3A3A3',       // Matching --text-secondary
      light: '#a8a8a8'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '4rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px'
  },
  typography: {
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600
    },
    body: {
      fontSize: '1rem',
      fontWeight: 400
    }
  },
  shadows: {
    md: '0 4px 6px rgba(0, 0, 0, 0.1)'
  }
};