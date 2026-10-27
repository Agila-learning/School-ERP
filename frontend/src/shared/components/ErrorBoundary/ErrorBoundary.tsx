import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Box sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "#f5f5f9"
        }}>
          <Typography variant="h4" color="error" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {this.state.error?.message}
          </Typography>
          <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
