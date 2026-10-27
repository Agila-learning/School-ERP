import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Chip, CircularProgress, Alert
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BackButton from '../../../shared/components/BackButton';
import api from '../../../core/api/axios';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
}

const ParentNoticeBoard: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        // Attempt to fetch from real API if available
        const res = await api.get('/communication/announcements').catch(() => null);
        
        let fetchedData = res?.data?.data || [];
        
        // Mock data injection if API fails or is empty for showcase
        if (fetchedData.length === 0) {
          fetchedData = [
            {
              _id: '1',
              title: 'Annual Sports Day 2026',
              content: 'Dear Parents, we are thrilled to announce our Annual Sports Day on November 15th. Please ensure your child is present in their designated house uniforms. Let us cheer for our young athletes!',
              type: 'EVENT',
              createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
            },
            {
              _id: '2',
              title: 'Change in School Timings',
              content: 'Due to the upcoming winter season, school timings will be revised to 8:30 AM - 2:30 PM effective next Monday. Transport schedules have been updated accordingly.',
              type: 'URGENT',
              createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
            },
            {
              _id: '3',
              title: 'Mid-Term Examination Schedule',
              content: 'The mid-term examination schedule for classes 1 to 12 has been published. Please check the timetable section for subject-wise dates.',
              type: 'ACADEMIC',
              createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), // 10 days ago
            }
          ];
        }

        // Check for Kindergarten wing announcements from localStorage
        try {
          const kgSaved = localStorage.getItem('school_erp_kg_announcements');
          if (kgSaved) {
            const kgNotices = JSON.parse(kgSaved);
            if (Array.isArray(kgNotices) && kgNotices.length > 0) {
              const formattedKg = kgNotices.map((k: any) => ({
                _id: k.id || `kg-${Math.random()}`,
                title: `🧸 [Early Years] ${k.title}`,
                content: `${k.content || k.description || ''} (Target: ${k.targetGrade || 'Kindergarten'} • Posted by: ${k.author || 'Mrs. Devaki Raman'})`,
                type: k.priority === 'URGENT' ? 'URGENT' : (k.category || 'EVENT'),
                createdAt: k.createdAt || new Date().toISOString(),
              }));
              fetchedData = [...formattedKg, ...fetchedData];
            }
          }
        } catch {}

        setAnnouncements(fetchedData);
      } catch (err) {
        console.error(err);
        setError('Failed to load announcements.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'school_erp_kg_announcements') {
        fetchAnnouncements();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'URGENT': return 'error';
      case 'EVENT': return 'info';
      case 'ACADEMIC': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <BackButton to="/parent-portal" />
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, bgcolor: 'teal.50', borderRadius: 2, color: 'teal.600' }}>
          <CampaignIcon sx={{ fontSize: 32 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>Notice Board</Typography>
          <Typography variant="body2" color="text.secondary">School circulars, updates, and important announcements.</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 900 }}>
          {announcements.map((announcement) => (
            <Paper 
              key={announcement._id} 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                border: '1px solid', 
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: 'white'
              }}
            >
              {/* Decorative top border based on type */}
              <Box 
                sx={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4, 
                  bgcolor: announcement.type === 'URGENT' ? 'error.main' : 
                          announcement.type === 'EVENT' ? 'info.main' : 
                          'primary.main' 
                }} 
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, mt: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {announcement.title}
                </Typography>
                <Chip 
                  label={announcement.type} 
                  color={getTypeColor(announcement.type) as any} 
                  size="small" 
                  sx={{ fontWeight: 700, borderRadius: 1 }} 
                />
              </Box>
              
              <Typography variant="body1" sx={{ color: '#475569', mb: 3, lineHeight: 1.6 }}>
                {announcement.content}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <CalendarMonthIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Published: {new Date(announcement.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ParentNoticeBoard;
