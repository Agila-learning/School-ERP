import React from 'react';
import { Box, Typography, Breadcrumbs, Link, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  primaryAction,
  secondaryAction,
}) => {
  const navigate = useNavigate();
  return (
    <Box sx={{ mb: { xs: 3, md: 4 } }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 1.5, '& .MuiBreadcrumbs-separator': { mx: 0.5 } }}
        >
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast || !item.href ? (
              <Typography key={index} color="text.primary" variant="body2" sx={{ fontWeight: 500 }}>
                {item.label}
              </Typography>
            ) : (
              <Link 
                key={index} 
                color="text.secondary" 
                href={item.href} 
                underline="hover"
                variant="body2"
              >
                {item.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate(-1)} size="small" sx={{ mr: 1, bgcolor: 'grey.100', '&:hover': { bgcolor: 'grey.200' } }}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom={!!description} sx={{ mb: description ? 0.5 : 0 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
                {description}
              </Typography>
            )}
          </Box>
        </Box>

        {(primaryAction || secondaryAction) && (
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
            {secondaryAction}
            {primaryAction}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
