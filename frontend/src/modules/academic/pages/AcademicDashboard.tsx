import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../api/academic.api';
import type { AcademicDashboardStats } from '../api/academic.api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import SchoolIcon from '@mui/icons-material/School';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupsIcon from '@mui/icons-material/Groups';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AcademicDashboard: React.FC = () => {
  const [stats, setStats] = useState<AcademicDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const classCapacityData = stats?.classCapacityData || [];
  const studentDistribution = stats?.studentDistribution || [];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Academic Command Center
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mt: 1 }}>
            Overview of classes, subjects, and enrollments
          </Typography>
        </div>
      </Box>
      
      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {[
          { label: 'Total Classes', value: stats?.totalClasses || 0, icon: <SchoolIcon sx={{ fontSize: 40, color: '#3b82f6' }}/>, bg: '#eff6ff' },
          { label: 'Total Sections', value: stats?.totalSections || 0, icon: <MeetingRoomIcon sx={{ fontSize: 40, color: '#10b981' }}/>, bg: '#ecfdf5' },
          { label: 'Total Subjects', value: stats?.totalSubjects || 0, icon: <MenuBookIcon sx={{ fontSize: 40, color: '#f59e0b' }}/>, bg: '#fffbeb' },
          { label: 'Enrolled Students', value: stats?.enrolledStudents || 0, icon: <GroupsIcon sx={{ fontSize: 40, color: '#8b5cf6' }}/>, bg: '#f5f3ff' },
        ].map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' } }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Box sx={{ backgroundColor: item.bg, p: 2, borderRadius: 3, mr: 2, display: 'flex' }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                    {item.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                Class Capacity Utilization (%)
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classCapacityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                    <Legend iconType="circle"/>
                    <Bar dataKey="utilized" name="Utilized Capacity" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="available" name="Available Capacity" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', p: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
                Student Distribution
              </Typography>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {studentDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                    <Legend iconType="circle" verticalAlign="bottom"/>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Links */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1e293b' }}>
          Management Modules
        </Typography>
        <Grid container spacing={2}>
          {[
            { label: 'Terms Management', path: '/admin/academics/terms', color: 'primary' },
            { label: 'Subject Groups', path: '/admin/academics/subject-groups', color: 'secondary' },
            { label: 'Syllabus Manager', path: '/admin/academics/syllabuses', color: 'success' },
            { label: 'Classroom Allocations', path: '/admin/academics/classroom-allocations', color: 'warning' },
            { label: 'Events & Holidays', path: '/admin/academics/events', color: 'info' },
          ].map((link, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
              <Button 
                variant="contained" 
                color={link.color as any}
                fullWidth 
                onClick={() => navigate(link.path)} 
                sx={{ 
                  p: 2, 
                  borderRadius: 3, 
                  textTransform: 'none', 
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
                }}
              >
                {link.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AcademicDashboard;
