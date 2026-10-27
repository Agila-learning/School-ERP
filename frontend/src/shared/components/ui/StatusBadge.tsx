import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
  status: StatusType;
  label: string;
}

const getStatusColor = (status: StatusType) => {
  switch (status) {
    case 'success':
      return { bgcolor: '#D1FAE5', color: '#065F46', borderColor: '#A7F3D0' };
    case 'warning':
      return { bgcolor: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' };
    case 'error':
      return { bgcolor: '#FEE2E2', color: '#991B1B', borderColor: '#FECACA' };
    case 'info':
      return { bgcolor: '#DBEAFE', color: '#1E40AF', borderColor: '#BFDBFE' };
    case 'neutral':
    default:
      return { bgcolor: '#F3F4F6', color: '#374151', borderColor: '#E5E7EB' };
  }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, sx, ...props }) => {
  const colors = getStatusColor(status);

  return (
    <Chip
      label={label}
      size="small"
      variant="outlined"
      sx={{
        backgroundColor: colors.bgcolor,
        color: colors.color,
        borderColor: colors.borderColor,
        fontWeight: 600,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        borderRadius: '4px',
        ...sx
      }}
      {...props}
    />
  );
};

export default StatusBadge;
