import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableHead, TableRow, Paper, Chip, Alert, CircularProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReportIcon from '@mui/icons-material/Report';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const bands = [
  { key: 'dueToday', label: 'Due Today', color: 'info', icon: <AccessTimeIcon /> },
  { key: 'overdue1to7', label: 'Overdue 1–7 Days', color: 'warning', icon: <WarningAmberIcon /> },
  { key: 'overdue8to30', label: 'Overdue 8–30 Days', color: 'error', icon: <ReportIcon /> },
  { key: 'overdue30plus', label: 'Overdue 30+ Days', color: 'error', icon: <ErrorIcon /> },
];

const OverdueManagement: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    import('../../../core/api/axios').then(({ default: axios }) => {
      axios.get('/library/overdue')
        .then(res => setData(res.data.data))
        .catch(() => setError('Failed to load overdue data.'))
        .finally(() => setLoading(false));
    });
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const totalOverdue = data
    ? Object.values(data).reduce((acc: number, arr: any) => acc + arr.length, 0)
    : 0;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Overdue & Fine Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track and manage books not returned on time.
      </Typography>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {bands.map(band => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={band.key}>
            <Card sx={{ borderLeft: `4px solid`, borderLeftColor: `${band.color}.main` }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {band.icon}
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{data?.[band.key]?.length ?? 0}</Typography>
                  <Typography variant="body2" color="text.secondary">{band.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tables per band */}
      {bands.map(band => (
        data?.[band.key]?.length > 0 && (
          <Box key={band.key} sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom color={`${band.color}.main`}>
              {band.label} ({data[band.key].length})
            </Typography>
            <Paper>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Member</TableCell>
                    <TableCell>Book</TableCell>
                    <TableCell>Copy / Barcode</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Days Overdue</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data[band.key].map((issue: any) => {
                    const dueDate = new Date(issue.dueDate);
                    const diffDays = Math.ceil((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <TableRow key={issue._id} hover>
                        <TableCell>
                          {issue.userId?.firstName} {issue.userId?.lastName}
                        </TableCell>
                        <TableCell>{issue.bookId?.title}</TableCell>
                        <TableCell>
                          {issue.copyId?.accessionNumber}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {issue.copyId?.barcode}
                          </Typography>
                        </TableCell>
                        <TableCell>{dueDate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${diffDays} days`}
                            color={diffDays > 30 ? 'error' : diffDays > 7 ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={issue.status} variant="outlined" size="small" />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )
      ))}

      {totalOverdue === 0 && (
        <Alert severity="success">No overdue books at this time.</Alert>
      )}
    </Box>
  );
};

export default OverdueManagement;
