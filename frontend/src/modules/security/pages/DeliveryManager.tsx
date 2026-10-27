import React from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, Grid, LinearProgress } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';

const DeliveryManager: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <LocalShippingIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Delivery & Contractor Access</Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="outlined">Add Contractor</Button>
        <Button variant="contained" startIcon={<AddIcon />}>Record Delivery</Button>
      </Box>
    </Box>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[{ label: 'Deliveries Today', value: 7, color: 'primary.main' }, { label: 'Pending Confirmation', value: 2, color: 'warning.main' }, { label: 'Active Contractors', value: 4, color: 'info.main' }, { label: 'Expiring This Week', value: 1, color: 'error.main' }].map(s => (
        <Grid size={{ xs: 6, md: 3 }} key={s.label}>
          <Card sx={{ borderRadius: 2, borderTop: 4, borderColor: s.color }}>
            <CardContent><Typography color="text.secondary" variant="subtitle2">{s.label}</Typography><Typography variant="h4" sx={{ fontWeight: 700 }}>{s.value}</Typography></CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Today's Deliveries</Typography>
            <Table size="small">
              <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Delivery #</TableCell><TableCell>Company</TableCell><TableCell>Recipient</TableCell><TableCell>Entry</TableCell><TableCell>Status</TableCell><TableCell>Action</TableCell>
              </TableRow></TableHead>
              <TableBody>
                <TableRow><TableCell sx={{ fontFamily: 'monospace' }}>DEL-081</TableCell><TableCell>Amazon Logistics</TableCell><TableCell>IT Department</TableCell><TableCell>09:15 AM</TableCell><TableCell><Chip label="DELIVERED" size="small" color="success" /></TableCell><TableCell><Button size="small">View</Button></TableCell></TableRow>
                <TableRow><TableCell sx={{ fontFamily: 'monospace' }}>DEL-082</TableCell><TableCell>Canteen Supplies Co.</TableCell><TableCell>Canteen</TableCell><TableCell>08:05 AM</TableCell><TableCell><Chip label="INSIDE" size="small" color="info" /></TableCell><TableCell><Button size="small" color="error">Exit</Button></TableCell></TableRow>
                <TableRow><TableCell sx={{ fontFamily: 'monospace' }}>DEL-083</TableCell><TableCell>Textbook Publishers</TableCell><TableCell>Library</TableCell><TableCell>11:30 AM</TableCell><TableCell><Chip label="PENDING_CONFIRMATION" size="small" color="warning" /></TableCell><TableCell><Button size="small" color="success" variant="outlined">Confirm</Button></TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Active Contractor Accesses</Typography>
            {[
              { name: 'Blue Star Electricals', work: 'Science Lab Wiring', area: 'Lab Wing', endDate: 'Aug 12', progress: 60 },
              { name: 'Green Clean Services', work: 'Building Maintenance', area: 'All Blocks', endDate: 'Aug 31', progress: 25 },
              { name: 'TechFix Systems', work: 'CCTV Installation', area: 'Main Building', endDate: 'Aug 11', progress: 85 },
            ].map(c => (
              <Box key={c.name} sx={{ mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{c.name}</Typography>
                  <Typography variant="caption" color="text.secondary">Until {c.endDate}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{c.work} · {c.area}</Typography>
                <LinearProgress variant="determinate" value={c.progress} sx={{ mt: 1, borderRadius: 1 }} />
                <Typography variant="caption" color="text.secondary">{c.progress}% complete</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default DeliveryManager;
