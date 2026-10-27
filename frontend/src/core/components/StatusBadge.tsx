import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

export type StatusType = 
  | 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' 
  | 'completed' | 'cancelled' | 'archived' | 'paid' | 'unpaid' | 'overdue' | 'warning' | 'info' | 'default';

interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
  status: StatusType | string;
  label?: string;
}

const getStatusColor = (status: string | undefined | null): ChipProps['color'] => {
  if (!status) return 'default';
  const s = String(status).toLowerCase();
  if (['active', 'approved', 'completed', 'paid', 'success'].includes(s)) return 'success';
  if (['pending', 'warning', 'overdue', 'partially_paid'].includes(s)) return 'warning';
  if (['rejected', 'cancelled', 'inactive', 'unpaid', 'failed', 'error', 'damaged'].includes(s)) return 'error';
  if (['archived', 'info', 'under_review'].includes(s)) return 'info';
  return 'default';
};

const formatLabel = (status: string | undefined | null) => {
  if (!status) return 'UNKNOWN';
  return String(status).replace(/_/g, ' ').toUpperCase();
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'small', ...props }) => {
  return (
    <Chip
      label={label || formatLabel(status)}
      color={getStatusColor(status)}
      size={size}
      variant="outlined" // If you're using MUI v6 or Joy UI, otherwise 'filled' is default. We'll stick to default MUI 5/6 variant which is filled or outlined. For a SaaS look, standard filled with a customized light background is ideal, but for now we rely on the theme's default Chip styles.
      {...props}
      sx={{
        fontWeight: 600,
        letterSpacing: '0.03em',
        ...props.sx
      }}
    />
  );
};

export default StatusBadge;
