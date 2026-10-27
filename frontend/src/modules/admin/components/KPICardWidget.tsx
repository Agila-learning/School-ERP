import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import SvgIcon from '@mui/material/SvgIcon';

interface KPICardWidgetProps {
  title: string;
  value: string | number;
  icon: typeof SvgIcon;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
}

const KPICardWidget: React.FC<KPICardWidgetProps> = ({ title, value, icon: Icon, color, loading }) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3, '&:last-child': { pb: 3 } }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: (theme) => theme.palette[color] ? `${theme.palette[color].main}20` : 'rgba(0,0,0,0.05)',
            color: (theme) => theme.palette[color] ? theme.palette[color].main : 'inherit',
            mr: 2
          }}
        >
          <Icon />
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }} gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={24} sx={{ mt: 1 }} />
          ) : (
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICardWidget;
