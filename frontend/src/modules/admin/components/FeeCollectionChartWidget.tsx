import React from 'react';
import { Card, CardContent, Typography, Box, Divider, CircularProgress } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import type { FeeSummary } from '../api/adminDashboard.api';

interface FeeCollectionChartWidgetProps {
  data: FeeSummary | null;
  loading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const FeeCollectionChartWidget: React.FC<FeeCollectionChartWidgetProps> = ({ data, loading }) => {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
          Fee Collection Trend
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {loading || !data ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.trend}
                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis 
                  tickFormatter={(val) => `₹${val / 1000}k`} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(value as number), 'Collected']}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#1976d2" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeCollectionChartWidget;
