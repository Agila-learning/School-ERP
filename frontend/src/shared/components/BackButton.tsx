import React from 'react';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  label?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, label = 'Back' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="text"
      color="inherit"
      startIcon={<ArrowBackIcon />}
      onClick={handleBack}
      sx={{ 
        textTransform: 'none', 
        fontWeight: 600, 
        color: 'text.secondary',
        mb: 2,
        '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
      }}
    >
      {label}
    </Button>
  );
};

export default BackButton;