import { createTheme } from '@mui/material/styles';

const theme = {
  colors: {
    primary: '#2563eb', // Blue
    primaryLight: '#3b82f6',
    primaryDark: '#1d4ed8',
    secondary: '#64748b', // Slate
    secondaryLight: '#94a3b8',
    secondaryDark: '#475569',
    success: '#22c55e', // Green
    successLight: '#4ade80',
    successDark: '#16a34a',
    error: '#ef4444', // Red
    errorLight: '#f87171',
    errorDark: '#dc2626',
    warning: '#f59e0b', // Amber
    warningLight: '#fbbf24',
    warningDark: '#d97706',
    info: '#0ea5e9', // Sky
    infoLight: '#38bdf8',
    infoDark: '#0284c7',
    sidebar: {
      background: '#1e293b',
      text: '#ffffff',
      icon: '#94a3b8',
      iconActive: '#ffffff',
      border: '#334155',
      hover: '#334155',
      active: '#2563eb'
    },
    background: {
      light: '#ffffff',
      main: '#f8fafc',
      dark: '#f1f5f9',
      sidebar: '#1e293b',
      card: '#ffffff',
      modal: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
      inverse: '#ffffff',
      error: '#ef4444',
      success: '#22c55e',
      warning: '#f59e0b',
      info: '#0ea5e9',
    },
    border: {
      light: '#e2e8f0',
      main: '#cbd5e1',
      dark: '#94a3b8',
    },
    hover: {
      light: '#f1f5f9',
      main: '#e2e8f0',
      dark: '#cbd5e1',
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      secondary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
};

export default theme;

export const muiTheme = createTheme({
  palette: {
    primary: { main: theme.colors.primary, light: theme.colors.primaryLight, dark: theme.colors.primaryDark },
    secondary: { main: theme.colors.secondary, light: theme.colors.secondaryLight, dark: theme.colors.secondaryDark },
    error: { main: theme.colors.error, light: theme.colors.errorLight, dark: theme.colors.errorDark },
    success: { main: theme.colors.success, light: theme.colors.successLight, dark: theme.colors.successDark },
    warning: { main: theme.colors.warning, light: theme.colors.warningLight, dark: theme.colors.warningDark },
    info: { main: theme.colors.info, light: theme.colors.infoLight, dark: theme.colors.infoDark },
    background: {
      default: theme.colors.background.main,
      paper: theme.colors.background.card,
    },
    text: {
      primary: theme.colors.text.primary,
      secondary: theme.colors.text.secondary,
      disabled: theme.colors.text.disabled,
    },
  },
  typography: {
    fontFamily: theme.typography.fontFamily.primary,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export const styledTheme = {
  colors: theme.colors,
  spacing: theme.spacing,
  typography: theme.typography,
  borderRadius: theme.borderRadius,
};

