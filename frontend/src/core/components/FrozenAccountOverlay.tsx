import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, Typography, Button, Box, Stack, Chip
} from '@mui/material';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../modules/auth/hooks/useAuth';

interface FrozenDetail {
  code?: string;
  message?: string;
  status?: string;
}

export const FrozenAccountOverlay: React.FC = () => {
  const [frozen, setFrozen] = useState<FrozenDetail | null>(null);
  const { isSuperAdmin, handleLogout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleFrozenEvent = (e: any) => {
      if (e.detail) {
        setFrozen(e.detail);
      }
    };

    window.addEventListener('erp:account-frozen', handleFrozenEvent);
    return () => {
      window.removeEventListener('erp:account-frozen', handleFrozenEvent);
    };
  }, []);

  if (!frozen) return null;

  return (
    <Dialog
      open={Boolean(frozen)}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }
      }}
    >
      <DialogContent sx={{ maxWidth: 540, width: '100%', textAlign: 'center', p: 0 }}>
        <Box
          sx={{
            p: 4.5,
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Frozen Ice Decorative Banner */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: 'linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)',
            }}
          />

          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'rgba(56, 189, 248, 0.12)',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
              border: '2px solid rgba(56, 189, 248, 0.3)'
            }}
          >
            <AcUnitIcon sx={{ fontSize: 38, animation: 'spin 12s linear infinite' }} />
          </Box>

          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1.5 }}>
            <Chip
              icon={<LockOutlinedIcon sx={{ fontSize: 14 }} />}
              label="ACCOUNT FROZEN"
              color="error"
              size="small"
              sx={{ fontWeight: 800, letterSpacing: '0.05em' }}
            />
            <Chip
              label="1-DAY TRIAL / PLAN EXPIRED"
              variant="outlined"
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
            Dashboard Access Suspended
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
            {frozen.message || 'Your school subscription or 1-day free trial has expired. To maintain confidential data boundaries and platform billing compliance, this tenant dashboard has been frozen.'}
          </Typography>

          <Stack spacing={1.5}>
            {isSuperAdmin && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<AdminPanelSettingsIcon />}
                onClick={() => {
                  setFrozen(null);
                  navigate('/super-admin/subscriptions');
                }}
                sx={{ borderRadius: 2, fontWeight: 700, py: 1.2 }}
              >
                Manage & Unfreeze in Super Admin
              </Button>
            )}

            <Button
              variant="outlined"
              color="inherit"
              size="large"
              startIcon={<ContactSupportIcon />}
              onClick={() => {
                window.location.href = 'mailto:support@edunexus.io?subject=School%20Subscription%20Renewal';
              }}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Contact Platform Administrator / Renewal
            </Button>

            <Button
              variant="text"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ fontWeight: 600 }}
            >
              Log Out of School Session
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
