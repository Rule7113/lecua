// src/styles/GlobalStyle.js
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --background-dark: ${({ theme }) => theme.colors.background};
    --background-light: ${({ theme }) => theme.colors.backgroundLight || '#2D2D2D'};
    --text-primary: ${({ theme }) => theme.colors.text.primary};
    --text-secondary: ${({ theme }) => theme.colors.text.secondary};
    --accent-blue: ${({ theme }) => theme.colors.primary};
    --border-color: #484848;
    --hover-color: #575757;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: var(--background-dark);
    color: var(--text-primary);
    line-height: 1.5;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: var(--background-dark);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--hover-color);
  }
`;

export default GlobalStyle;