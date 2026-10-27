const fs = require('fs');
const dir = 'C:/Users/agila/OneDrive/Documents/School-ERP_FIC/frontend/src/modules/lab/pages';

const pages = ['LabDashboard', 'LabSchedule', 'LabEquipment', 'LabInventory', 'LabMaintenance', 'LabBookings'];

pages.forEach(page => {
  const code = `import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, CircularProgress } from '@mui/material';

const ${page}: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API load
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>${page.replace(/([A-Z])/g, ' $1').trim()}</Typography>
        <Button variant="contained" color="primary">Add New</Button>
      </Box>

      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={4} key={item}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Item {item}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Details for ${page} will be displayed here, loaded dynamically from the backend.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ${page};
`;
  fs.writeFileSync(`${dir}/${page}.tsx`, code);
});
console.log('Lab pages generated.');
