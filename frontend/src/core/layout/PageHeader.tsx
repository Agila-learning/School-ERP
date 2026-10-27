import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageAction {
  label: string;
  onClick: () => void;
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: PageAction[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, breadcrumbs, actions }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mb: 4 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 1, '& .MuiBreadcrumbs-li': { fontSize: '0.875rem' } }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                underline="hover"
                color="text.secondary"
                sx={{ cursor: crumb.path ? 'pointer' : 'default' }}
                onClick={() => crumb.path && navigate(crumb.path)}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom={!!description} sx={{ mb: description ? 0.5 : 0 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>

        {actions && actions.length > 0 && (
          <Stack direction="row" spacing={1.5}>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'contained'}
                color={action.color || 'primary'}
                onClick={action.onClick}
                startIcon={action.icon}
                disableElevation
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
