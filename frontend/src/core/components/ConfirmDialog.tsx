import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={!isLoading ? onCancel : undefined}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { p: 1 } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        {isDestructive && <WarningAmberIcon color="error" />}
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ pt: 2 }}>
        <Button 
          onClick={onCancel} 
          disabled={isLoading}
          color="inherit"
          sx={{ color: 'text.secondary' }}
        >
          {cancelLabel}
        </Button>
        <Button 
          onClick={onConfirm} 
          color={isDestructive ? 'error' : 'primary'} 
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
