import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Tabs, Tab, Button, Divider
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DownloadIcon from '@mui/icons-material/Download';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const FinancialReportsView: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AssessmentIcon fontSize="large" color="primary" />
          Financial Reports
        </Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />}>Export PDF</Button>
      </Box>

      <Paper elevation={3} sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Profit & Loss" />
            <Tab label="Balance Sheet" />
            <Tab label="Cash Flow" />
            <Tab label="Tax Summary" />
            <Tab label="Budget Variance" />
          </Tabs>
        </Box>
        
        <CustomTabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>Profit & Loss Statement</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography color="text.secondary">Select a date range to generate the Income vs Expense report.</Typography>
          {/* P&L Table here */}
        </CustomTabPanel>
        
        <CustomTabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Balance Sheet</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography color="text.secondary">Assets = Liabilities + Equity</Typography>
          {/* Balance Sheet Table here */}
        </CustomTabPanel>

        <CustomTabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>Cash Flow Statement</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography color="text.secondary">Track operating, investing, and financing activities.</Typography>
        </CustomTabPanel>
      </Paper>
    </Box>
  );
};

export default FinancialReportsView;
