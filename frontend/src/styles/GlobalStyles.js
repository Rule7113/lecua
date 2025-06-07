import { createGlobalStyle } from 'styled-components';
import theme from './theme';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Colors */
    --primary: ${theme.colors.primary};
    --primary-light: ${theme.colors.primaryLight};
    --primary-dark: ${theme.colors.primaryDark};
    --secondary: ${theme.colors.secondary};
    --secondary-light: ${theme.colors.secondaryLight};
    --secondary-dark: ${theme.colors.secondaryDark};
    --success: ${theme.colors.success};
    --success-light: ${theme.colors.successLight};
    --success-dark: ${theme.colors.successDark};
    --error: ${theme.colors.error};
    --error-light: ${theme.colors.errorLight};
    --error-dark: ${theme.colors.errorDark};
    --warning: ${theme.colors.warning};
    --warning-light: ${theme.colors.warningLight};
    --warning-dark: ${theme.colors.warningDark};
    --info: ${theme.colors.info};
    --info-light: ${theme.colors.infoLight};
    --info-dark: ${theme.colors.infoDark};

    /* Background Colors */
    --background-light: ${theme.colors.background.light};
    --background-main: ${theme.colors.background.main};
    --background-dark: ${theme.colors.background.dark};
    --background-sidebar: ${theme.colors.background.sidebar};
    --background-card: ${theme.colors.background.card};
    --background-modal: ${theme.colors.background.modal};
    --background-overlay: ${theme.colors.background.overlay};

    /* Text Colors */
    --text-primary: ${theme.colors.text.primary};
    --text-secondary: ${theme.colors.text.secondary};
    --text-disabled: ${theme.colors.text.disabled};
    --text-inverse: ${theme.colors.text.inverse};
    --text-error: ${theme.colors.text.error};
    --text-success: ${theme.colors.text.success};
    --text-warning: ${theme.colors.text.warning};
    --text-info: ${theme.colors.text.info};

    /* Border Colors */
    --border-light: ${theme.colors.border.light};
    --border-main: ${theme.colors.border.main};
    --border-dark: ${theme.colors.border.dark};

    /* Hover Colors */
    --hover-light: ${theme.colors.hover.light};
    --hover-main: ${theme.colors.hover.main};
    --hover-dark: ${theme.colors.hover.dark};

    /* Shadows */
    --shadow-sm: ${theme.colors.shadow.sm};
    --shadow-md: ${theme.colors.shadow.md};
    --shadow-lg: ${theme.colors.shadow.lg};
    --shadow-xl: ${theme.colors.shadow.xl};
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    line-height: ${theme.typography.lineHeight.normal};
    color: var(--text-primary);
    background-color: var(--background-main);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.typography.fontWeight.semibold};
    line-height: ${theme.typography.lineHeight.tight};
    color: var(--text-primary);
  }

  h1 {
    font-size: ${theme.typography.fontSize['4xl']};
  }

  h2 {
    font-size: ${theme.typography.fontSize['3xl']};
  }

  h3 {
    font-size: ${theme.typography.fontSize['2xl']};
  }

  h4 {
    font-size: ${theme.typography.fontSize.xl};
  }

  h5 {
    font-size: ${theme.typography.fontSize.lg};
  }

  h6 {
    font-size: ${theme.typography.fontSize.base};
  }

  p {
    margin-bottom: 1rem;
  }

  a {
    color: var(--primary);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--primary-dark);
    }
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  /* Scrollbar Styles */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--background-light);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border-main);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--border-dark);
  }
`;

export default GlobalStyles; 