import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material';

const TaskBoard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Universal Task Board</Typography>
        <Button variant="contained">Create Task</Button>
      </Box>

      <Grid container spacing={2}>
        {['Assigned', 'In Progress', 'Completed'].map((column) => (
          <Grid size={{ xs: 12, md: 4 }} key={column}>
            <Card sx={{ bgcolor: 'grey.50', borderRadius: 2, minHeight: '600px' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>{column}</Typography>
                
                {column === 'Assigned' && (
                  <Card sx={{ mb: 2, borderLeft: 4, borderColor: 'error.main' }}>
                    <CardContent>
                      <Typography variant="subtitle2">Review Employee Exit Checklist</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>HR Module • Assigned to: Me</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label="High" size="small" color="error" />
                        <Chip label="Due Today" size="small" color="warning" />
                      </Box>
                    </CardContent>
                  </Card>
                )}
                
                {column === 'In Progress' && (
                  <Card sx={{ mb: 2, borderLeft: 4, borderColor: 'info.main' }}>
                    <CardContent>
                      <Typography variant="subtitle2">Generate End of Term Reports</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Academic Module • Assigned to: Exam Dept</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip label="Medium" size="small" color="info" />
                        <Chip label="3 Subtasks" size="small" variant="outlined" />
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

export default TaskBoard;
