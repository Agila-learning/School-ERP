import React from 'react';
import { Card, CardContent, Typography, Box, Divider, CircularProgress } from '@mui/material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import type { AttendanceSummary } from '../api/adminDashboard.api';

interface AttendanceChartWidgetProps {
  data: AttendanceSummary | null;
  loading?: boolean;
}

const AttendanceChartWidget: React.FC<AttendanceChartWidgetProps> = ({ data, loading }) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
          Weekly Attendance Trend
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {loading || !data ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.trend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="present" name="Present" fill="#2e7d32" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="absent" name="Absent" fill="#d32f2f" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="late" name="Late" fill="#ed6c02" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceChartWidget;
