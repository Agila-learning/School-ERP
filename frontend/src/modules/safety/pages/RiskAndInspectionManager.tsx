import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab, Button, Grid, Chip } from '@mui/material';

const RiskAndInspectionManager: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Risk & Inspection Manager</Typography>
        <Button variant="contained" color="primary">Create New</Button>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Risk Register" />
          <Tab label="Hazards" />
          <Tab label="Inspections" />
          <Tab label="Corrective Actions" />
        </Tabs>
        <CardContent sx={{ p: 3, minHeight: 400 }}>
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="h6">Chemical Spill in Lab</Typography>
                      <Chip label="High Risk" color="error" size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">Existing Controls: Spill kits available.</Typography>
                    <Typography variant="body2" color="text.secondary">Mitigation: Monthly training.</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          {tab === 1 && <Typography color="text.secondary">No open hazards reported.</Typography>}
          {tab === 2 && <Typography color="text.secondary">Pending safety inspections will appear here.</Typography>}
          {tab === 3 && <Typography color="text.secondary">No pending corrective actions.</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default RiskAndInspectionManager;
