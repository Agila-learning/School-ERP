import React from 'react';
import { Box, CircularProgress, Typography, Skeleton, Stack } from '@mui/material';

interface LoadingStateProps {
  message?: string;
  type?: 'spinner' | 'skeleton-table' | 'skeleton-card' | 'skeleton-form';
  minHeight?: number | string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...', 
  type = 'spinner',
  minHeight = 400
}) => {
  if (type === 'skeleton-table') {
    return (
      <Box sx={{ width: '100%', p: 2 }}>
        <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 2, borderRadius: 1 }} />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height={56} sx={{ mb: 1, borderRadius: 1 }} />
        ))}
      </Box>
    );
  }

  if (type === 'skeleton-card') {
    return (
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
    );
  }

  if (type === 'skeleton-form') {
    return (
      <Stack spacing={3} sx={{ p: 2, width: '100%', maxWidth: 600 }}>
        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
        <Stack direction="row" spacing={2}>
          <Skeleton variant="rectangular" width="50%" height={56} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="50%" height={56} sx={{ borderRadius: 1 }} />
        </Stack>
        <Skeleton variant="rectangular" width="30%" height={40} sx={{ borderRadius: 1, mt: 2 }} />
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        width: '100%',
      }}
    >
      <CircularProgress size={40} thickness={4} color="primary" />
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 500 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingState;
