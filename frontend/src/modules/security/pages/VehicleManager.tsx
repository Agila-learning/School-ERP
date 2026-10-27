import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, Chip, Tabs, Tab } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AddIcon from '@mui/icons-material/Add';

const VehicleManager: React.FC = () => {
  const [tab, setTab] = useState(0);
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DirectionsCarIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Vehicle Management</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>Register Vehicle</Button>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[{ label: 'Vehicles Inside', value: 37, color: 'primary.main' }, { label: 'Parking Available', value: 18, color: 'success.main' }, { label: 'Today\'s Vehicle Entries', value: 52, color: 'info.main' }, { label: 'Blacklisted Vehicles', value: 2, color: 'error.main' }].map(s => (
          <Grid size={{ xs: 6, md: 3 }} key={s.label}>
            <Card sx={{ borderRadius: 2, borderTop: 4, borderColor: s.color }}>
              <CardContent><Typography color="text.secondary" variant="subtitle2">{s.label}</Typography><Typography variant="h4" sx={{ fontWeight: 700 }}>{s.value}</Typography></CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Vehicles Inside" />
        <Tab label="Today's Entries" />
        <Tab label="Registered Vehicles" />
        <Tab label="Parking Areas" />
      </Tabs>

      {tab === 0 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Table>
              <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Registration</TableCell><TableCell>Type</TableCell><TableCell>Driver</TableCell><TableCell>Purpose</TableCell><TableCell>Entry Time</TableCell><TableCell>Parking</TableCell><TableCell>Action</TableCell>
              </TableRow></TableHead>
              <TableBody>
                <TableRow><TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>KA-01-AB-1234</TableCell><TableCell><Chip label="PARENT_VEHICLE" size="small" color="info" variant="outlined" /></TableCell><TableCell>Mr. Suresh</TableCell><TableCell>Parent Pickup</TableCell><TableCell>12:40 PM</TableCell><TableCell>Lot A - Slot 12</TableCell><TableCell><Button size="small" variant="outlined" color="error">Record Exit</Button></TableCell></TableRow>
                <TableRow><TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>TN-09-CD-5678</TableCell><TableCell><Chip label="VENDOR_VEHICLE" size="small" color="warning" variant="outlined" /></TableCell><TableCell>Ravi Kumar</TableCell><TableCell>Canteen Supply</TableCell><TableCell>08:15 AM</TableCell><TableCell>Delivery Bay</TableCell><TableCell><Button size="small" variant="outlined" color="error">Record Exit</Button></TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField size="small" placeholder="Search by registration number..." sx={{ flexGrow: 1 }} />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select label="Type"><MenuItem value="">All</MenuItem><MenuItem value="PARENT">Parent</MenuItem><MenuItem value="STAFF">Staff</MenuItem><MenuItem value="VENDOR">Vendor</MenuItem></Select>
              </FormControl>
            </Box>
            <Table>
              <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell>Registration</TableCell><TableCell>Type</TableCell><TableCell>Owner</TableCell><TableCell>Permit</TableCell><TableCell>Status</TableCell>
              </TableRow></TableHead>
              <TableBody>
                <TableRow><TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>KA-01-AB-1234</TableCell><TableCell>PARENT_VEHICLE</TableCell><TableCell>Mr. Suresh Pillai (Parent)</TableCell><TableCell><Chip label="Valid" size="small" color="success" /></TableCell><TableCell><Chip label="ACTIVE" size="small" color="success" /></TableCell></TableRow>
                <TableRow><TableCell sx={{ fontFamily: 'monospace', fontWeight: 700 }}>DL-03-ZZ-9999</TableCell><TableCell>OTHER</TableCell><TableCell>Unknown</TableCell><TableCell><Chip label="N/A" size="small" color="default" /></TableCell><TableCell><Chip label="BLACKLISTED" size="small" color="error" /></TableCell></TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default VehicleManager;
