import React from 'react';
import { Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, Grid } from '@mui/material';
import FindInPageIcon from '@mui/icons-material/FindInPage';

const AccessAudit: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FindInPageIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Access Audit Log</Typography>
          <Typography variant="body2" color="text.secondary">Tamper-resistant record of all campus access events</Typography>
        </Box>
      </Box>
      <Button variant="outlined">Export CSV</Button>
    </Box>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[{ label: "Today's Events", value: '1,428', color: 'primary.main' }, { label: 'Anomalies', value: 4, color: 'error.main' }, { label: 'Pass Events', value: 38, color: 'info.main' }, { label: 'Lockdown Events', value: 0, color: 'success.main' }].map(s => (
        <Grid size={{ xs: 6, md: 3 }} key={s.label}>
          <Card sx={{ borderRadius: 2, borderTop: 4, borderColor: s.color }}>
            <CardContent><Typography color="text.secondary" variant="subtitle2">{s.label}</Typography><Typography variant="h4" sx={{ fontWeight: 700 }}>{s.value}</Typography></CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Table>
          <TableHead><TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell>Timestamp</TableCell><TableCell>Event Type</TableCell><TableCell>Person</TableCell><TableCell>Gate / Location</TableCell><TableCell>Method</TableCell><TableCell>Pass/Reference</TableCell><TableCell>Result</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {[
              { time: '12:58:04 PM', type: 'STUDENT_RELEASE', person: 'Meera Pillai', loc: 'Reception', method: 'Manual Verification', ref: 'PK-REQ-081', result: 'AUTHORIZED' },
              { time: '12:40:11 PM', type: 'VEHICLE_ENTRY', person: 'Mr. Suresh (KA-01-AB-1234)', loc: 'Main Gate', method: 'Manual', ref: 'VE-082', result: 'AUTHORIZED' },
              { time: '12:15:33 PM', type: 'PASS_REVOKED', person: 'Admin User', loc: 'System', method: 'Admin Action', ref: 'VP-OLD-045', result: 'REVOKED' },
              { time: '11:45:02 AM', type: 'ENTRY_DENIED', person: 'Unknown', loc: 'East Gate', method: 'Manual', ref: 'N/A', result: 'DENIED' },
              { time: '10:05:18 AM', type: 'VISITOR_ENTRY', person: 'Rajesh Kumar', loc: 'Main Gate', method: 'QR Scan', ref: 'VP-M9BZ4R', result: 'AUTHORIZED' },
              { time: '08:30:44 AM', type: 'CONTRACTOR_ENTRY', person: 'Priya Nair (Blue Star)', loc: 'Main Gate', method: 'Manual', ref: 'CA-031', result: 'AUTHORIZED' },
            ].map((row, i) => (
              <TableRow key={i}>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.time}</TableCell>
                <TableCell><Typography variant="caption" sx={{ fontWeight: 600 }}>{row.type}</Typography></TableCell>
                <TableCell>{row.person}</TableCell>
                <TableCell>{row.loc}</TableCell>
                <TableCell>{row.method}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', color: 'primary.main' }}>{row.ref}</TableCell>
                <TableCell>
                  <Chip label={row.result} size="small"
                    color={row.result === 'AUTHORIZED' ? 'success' : row.result === 'DENIED' ? 'error' : row.result === 'REVOKED' ? 'warning' : 'default'} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </Box>
);

export default AccessAudit;
