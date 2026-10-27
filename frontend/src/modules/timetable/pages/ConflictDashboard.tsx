import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Button, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import { getConflicts, getTimetableVersions } from '../api/timetable.api';
import type { TimetableConflict, TimetableVersion } from '../api/timetable.api';

const ConflictDashboard: React.FC = () => {
  const [conflicts, setConflicts] = useState<TimetableConflict[]>([]);
  const [versions, setVersions] = useState<TimetableVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTimetableVersions().then(data => {
      setVersions(data);
      const draft = data.find(v => v.status === 'DRAFT' || v.status === 'REVIEW');
      if (draft) {
        setSelectedVersion(draft.id || (draft as any)._id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedVersion) return;
    setLoading(true);
    getConflicts(selectedVersion).then(data => {
      setConflicts(data);
      setLoading(false);
    });
  }, [selectedVersion]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'ERROR': return 'error';
      case 'WARNING': return 'warning';
      case 'INFO': return 'info';
      default: return 'default';
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Timetable Conflicts</Typography>
          <Typography variant="body1" color="text.secondary">
            Review and resolve validation issues in the draft timetable.
          </Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Version</InputLabel>
          <Select value={selectedVersion} label="Version" onChange={e => setSelectedVersion(e.target.value as string)}>
            {versions.map(v => (
              <MenuItem key={v.id} value={v.id || (v as any)._id}>{v.name} (v{v.versionNumber})</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {conflicts.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 3, bgcolor: '#f8f9fa' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>No Conflicts Detected</Typography>
          <Typography color="text.secondary">The current draft timetable is perfectly validated.</Typography>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Severity</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Conflict Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Resolution</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conflicts.map(conflict => (
                  <TableRow key={conflict.id} hover>
                    <TableCell>
                      <Chip label={conflict.severity} size="small" color={getSeverityColor(conflict.severity)} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {conflict.conflictType.replace(/_/g, ' ')}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 400 }}>
                      <Typography variant="body2">{conflict.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={conflict.isResolved ? 'Resolved' : 'Unresolved'} 
                        size="small" 
                        variant="outlined"
                        color={conflict.isResolved ? 'success' : 'error'} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      {!conflict.isResolved && (
                        <Button size="small" variant="contained" disableElevation color="primary">
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default ConflictDashboard;
