import React, { useState } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, Button, Chip, Grid, Card, CardContent,
  Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

interface TabPanelProps { children?: React.ReactNode; value: number; index: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>
);

const LibraryReports: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [error, setError] = useState('');

  const [circulation, setCirculation] = useState<any[]>([]);
  const [fines, setFines] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { default: axios } = await import('../../../core/api/axios');
        if (tabIndex === 0) {
          const res = await axios.get('/v1/library/reports/issued');
          setCirculation(res.data.data || []);
        } else if (tabIndex === 1) {
          const res = await axios.get('/v1/library/reports/overdue');
          setOverdue(res.data.data || []);
        } else if (tabIndex === 2) {
          const res = await axios.get('/v1/library/reports/fines');
          setFines(res.data.data || []);
        } else if (tabIndex === 3) {
          const res = await axios.get('/v1/library/reports/overview');
          setPopular(res.data.data?.mostBorrowed || []);
        }
      } catch (err: any) {
        console.error(err);
        setError('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [tabIndex]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Library Reports</Typography>
        <Button startIcon={<DownloadIcon />} variant="outlined">Export</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Circulation" />
          <Tab label="Overdue" />
          <Tab label="Fines" />
          <Tab label="Most Borrowed" />
          <Tab label="Member Activity" />
          <Tab label="Inventory" />
        </Tabs>
      </Paper>

      {/* Circulation */}
      <TabPanel value={tabIndex} index={0}>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Book</TableCell>
                <TableCell>Issue Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow> : circulation.map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell>{row.userId?.firstName} {row.userId?.lastName}</TableCell>
                  <TableCell>{row.bookId?.title}</TableCell>
                  <TableCell>{new Date(row.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(row.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={row.status === 'ACTIVE' ? 'success' : 'error'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* Overdue */}
      <TabPanel value={tabIndex} index={1}>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Book</TableCell>
                <TableCell>Days Overdue</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={3} align="center">Loading...</TableCell></TableRow> : overdue.map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell>{row.userId?.firstName} {row.userId?.lastName}</TableCell>
                  <TableCell>{row.bookId?.title}</TableCell>
                  <TableCell><Chip label={`${Math.floor((new Date().getTime() - new Date(row.dueDate).getTime()) / (1000*3600*24))} days`} color="error" size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* Fines */}
      <TabPanel value={tabIndex} index={2}>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Book</TableCell>
                <TableCell>Days Overdue</TableCell>
                <TableCell>Amount (₹)</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={5} align="center">Loading...</TableCell></TableRow> : fines.map((row, i) => (
                <TableRow key={i} hover>
                  <TableCell>{row.userId?.firstName} {row.userId?.lastName}</TableCell>
                  <TableCell>{row.copyId?.accessionNumber || 'N/A'}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>₹{row.netAmount}</TableCell>
                  <TableCell>
                    <Chip label={row.status} color={row.status === 'PAID' ? 'success' : 'warning'} size="small" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* Most Borrowed */}
      <TabPanel value={tabIndex} index={3}>
        <Grid container spacing={2}>
          {loading ? <Grid size={{xs:12}}><Typography>Loading...</Typography></Grid> : popular.map((book, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>{i + 1}</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>{book.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{book.borrowCount} times borrowed</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Member Activity */}
      <TabPanel value={tabIndex} index={4}>
        <Alert severity="info">Member activity data will be populated from live circulation records once books are issued.</Alert>
      </TabPanel>

      {/* Inventory */}
      <TabPanel value={tabIndex} index={5}>
        <Alert severity="info">Inventory reports will display after conducting stock verification audits.</Alert>
      </TabPanel>
    </Box>
  );
};

export default LibraryReports;
