import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, LinearProgress, Alert, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const MarksImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleValidate = () => {
    setValidating(true);
    // Connect to actual API in full implementation
    setTimeout(() => {
      setValidating(false);
      setResults({
        total: 0,
        valid: 0,
        invalid: 1,
        errors: [{ row: 0, reason: 'Bulk import API endpoint not implemented in backend yet' }]
      });
    }, 500);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Bulk Marks Import</Typography>
        <Typography variant="body2" color="text.secondary">Import marks from Excel/CSV safely with pre-validation</Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', mb: 3, bgcolor: 'grey.50' }}>
        <input type="file" id="marks-upload" hidden onChange={handleUpload} accept=".xlsx,.csv" />
        <label htmlFor="marks-upload">
          <Button variant="outlined" component="span" startIcon={<CloudUploadIcon />} size="large">
            Select Excel / CSV File
          </Button>
        </label>
        {file && <Typography variant="body2" color="primary" sx={{ mt: 2, fontWeight: 'bold' }}>{file.name}</Typography>}
        <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 'medium' }}>
          Step 1: Download Template
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" disabled={!file || validating} onClick={handleValidate} sx={{ px: 4 }}>
          Validate Data
        </Button>
      </Box>

      {validating && <LinearProgress sx={{ mb: 3 }} />}

      {results && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>Data Mapping</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Total Rows</Typography>
              <Typography variant="h6">{results.total}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Valid</Typography>
              <Typography variant="h6" color="success.main">{results.valid}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Invalid</Typography>
              <Typography variant="h6" color="error.main">{results.invalid}</Typography>
            </Box>
          </Box>

          {results.errors.length > 0 && (
            <Box>
              <Alert severity="error" sx={{ mb: 2 }}>Please fix the following errors before importing.</Alert>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow><TableCell>Row</TableCell><TableCell>Error Reason</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {results.errors.map((e: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{e.row}</TableCell>
                        <TableCell color="error.main">{e.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {results.invalid === 0 && (
            <Button variant="contained" color="success" fullWidth sx={{ mt: 3 }}>Proceed with Import</Button>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default MarksImport;
