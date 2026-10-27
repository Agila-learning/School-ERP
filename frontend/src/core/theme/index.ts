import { createTheme } from '@mui/material/styles';

const primaryColor = '#4F46E5'; // Indigo-600
const primaryLight = '#818CF8';
const primaryDark = '#3730A3';

const secondaryColor = '#10B981'; // Emerald-500
const secondaryLight = '#34D399';
const secondaryDark = '#059669';

const errorColor = '#EF4444';
const warningColor = '#F59E0B';
const infoColor = '#3B82F6';
const successColor = '#10B981';

const backgroundDefault = '#F9FAFB'; // Gray-50
const surfaceColor = '#FFFFFF';

const textPrimary = '#111827'; // Gray-900
const textSecondary = '#6B7280'; // Gray-500
const textMuted = '#9CA3AF'; // Gray-400

const borderColor = '#E5E7EB'; // Gray-200

export const erpTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primaryColor,
      light: primaryLight,
      dark: primaryDark,
      contrastText: '#fff',
    },
    secondary: {
      main: secondaryColor,
      light: secondaryLight,
      dark: secondaryDark,
      contrastText: '#fff',
    },
    error: {
      main: errorColor,
    },
    warning: {
      main: warningColor,
    },
    info: {
      main: infoColor,
    },
    success: {
      main: successColor,
    },
    background: {
      default: backgroundDefault,
      paper: surfaceColor,
    },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      disabled: textMuted,
    },
    divider: borderColor,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', color: textPrimary },
    h2: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em', color: textPrimary },
    h3: { fontSize: '1.25rem', fontWeight: 600, color: textPrimary },
    h4: { fontSize: '1.125rem', fontWeight: 600, color: textPrimary },
    h5: { fontSize: '1rem', fontWeight: 600, color: textPrimary },
    h6: { fontSize: '0.875rem', fontWeight: 600, color: textPrimary },
    subtitle1: { fontSize: '1rem', fontWeight: 500, color: textPrimary },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500, color: textSecondary },
    body1: { fontSize: '0.875rem', lineHeight: 1.5, color: textPrimary }, // Base size for SaaS is often 14px
    body2: { fontSize: '0.8125rem', lineHeight: 1.5, color: textSecondary }, // 13px secondary
    button: { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', color: textMuted },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: backgroundDefault,
          color: textPrimary,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          },
        },

        outlined: {
          borderColor: borderColor,
          color: textPrimary,
          '&:hover': {
            backgroundColor: '#F3F4F6', // Gray-100
            borderColor: '#D1D5DB', // Gray-300
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          border: `1px solid ${borderColor}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: surfaceColor,
            '& fieldset': {
              borderColor: borderColor,
            },
            '&:hover fieldset': {
              borderColor: '#D1D5DB',
            },
            '&.Mui-focused fieldset': {
              borderColor: primaryColor,
              borderWidth: '1px',
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          minWidth: 650,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: textSecondary,
          backgroundColor: '#F9FAFB',
          borderBottom: `1px solid ${borderColor}`,
          padding: '12px 16px',
        },
        body: {
          color: textPrimary,
          borderBottom: `1px solid ${borderColor}`,
          padding: '12px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td, &:last-child th': {
            borderBottom: 0,
          },
          '&:hover': {
            backgroundColor: '#F9FAFB',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
        },
        sizeSmall: {
          fontSize: '0.75rem',
          height: '24px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.125rem',
          fontWeight: 600,
          padding: '24px 24px 16px 24px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px 24px',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${borderColor}`,
        },
        indicator: {
          height: '3px',
          borderTopLeftRadius: '3px',
          borderTopRightRadius: '3px',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minWidth: 0,
          padding: '12px 16px',
          '&.Mui-selected': {
            color: primaryColor,
          },
        },
      },
    },
  },
});
