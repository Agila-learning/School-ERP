import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip } from '@mui/material';

const WorkOrderKanban: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Work Orders Kanban</Typography>

      <Grid container spacing={2}>
        {['Assigned', 'In Progress', 'Waiting on Parts', 'Completed'].map((column) => (
          <Grid size={{ xs: 12, md: 3 }} key={column}>
            <Card sx={{ bgcolor: 'grey.50', borderRadius: 2, minHeight: '600px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{column}</Typography>
                
                {column === 'In Progress' && (
                  <Card sx={{ mb: 2, borderLeft: 4, borderColor: 'info.main' }}>
                    <CardContent>
                      <Typography variant="subtitle2">Fix Projector in Room 101</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Assigned to: IT Team</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label="High" size="small" color="error" />
                        <Chip label="AST-10043" size="small" variant="outlined" />
                      </Box>
                    </CardContent>
                  </Card>
                )}
                
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WorkOrderKanban;
