import { Box, Typography, Paper, Grid, Card, CardContent, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import WarningIcon from '@mui/icons-material/Warning';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

export default function VehicleMaintenanceDesk() {
  const stats = {
    activeVehicles: 24,
    underMaintenance: 3,
    totalExpenses: 4500, // Monthly
    upcomingServices: 5
  };

  const maintenanceLogs = [
    { id: 'MNT001', vehicleId: 'BUS-01 (NY-1234)', type: 'Scheduled Service', date: '2026-08-25', cost: 450, status: 'Completed', mechanic: 'AutoCare Garage' },
    { id: 'MNT002', vehicleId: 'BUS-05 (NY-9876)', type: 'Tire Replacement', date: '2026-09-01', cost: 1200, status: 'In Progress', mechanic: 'City Tires' },
    { id: 'MNT003', vehicleId: 'VAN-02 (NY-5555)', type: 'Brake Inspection', date: '2026-09-05', cost: 0, status: 'Scheduled', mechanic: 'In-House' },
    { id: 'MNT004', vehicleId: 'BUS-08 (NY-3333)', type: 'Engine Repair', date: '2026-08-28', cost: 2850, status: 'Completed', mechanic: 'HeavyDuty Motors' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
          Vehicle Maintenance & Tracking
        </Typography>
        <Button variant="contained" startIcon={<AddCircleIcon />} sx={{ textTransform: 'none', px: 3, borderRadius: 2 }}>
          Log Maintenance
        </Button>
      </Box>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '4px solid #3b82f6' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <DirectionsBusIcon sx={{ color: '#3b82f6', mr: 1 }} />
                <Typography variant="subtitle1" sx={{ color: '#64748b', fontWeight: 600 }}>Active Fleet</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>{stats.activeVehicles}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '4px solid #ef4444' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BuildIcon sx={{ color: '#ef4444', mr: 1 }} />
                <Typography variant="subtitle1" sx={{ color: '#64748b', fontWeight: 600 }}>In Maintenance</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>{stats.underMaintenance}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '4px solid #f59e0b' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon sx={{ color: '#f59e0b', mr: 1 }} />
                <Typography variant="subtitle1" sx={{ color: '#64748b', fontWeight: 600 }}>Upcoming Services</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>{stats.upcomingServices}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderLeft: '4px solid #10b981' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalGasStationIcon sx={{ color: '#10b981', mr: 1 }} />
                <Typography variant="subtitle1" sx={{ color: '#64748b', fontWeight: 600 }}>Monthly Expenses</Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>${stats.totalExpenses.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>
            Recent Maintenance Logs
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField select label="Filter Status" size="small" slotProps={{ htmlInput: { native: true } }} sx={{ minWidth: 150 }}>
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
            </TextField>
          </Box>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Log ID</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Vehicle</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Maintenance Type</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Provider</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Cost</TableCell>
                <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenanceLogs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#64748b' }}>{log.id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{log.vehicleId}</Typography>
                  </TableCell>
                  <TableCell>{log.type}</TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.mechanic}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>${log.cost}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={log.status} 
                      size="small" 
                      color={log.status === 'Completed' ? 'success' : log.status === 'In Progress' ? 'warning' : 'info'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
