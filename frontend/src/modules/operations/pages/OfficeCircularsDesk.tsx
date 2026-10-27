import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, Divider,
  InputAdornment, FormControlLabel, Switch, Alert
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

import { useNavigate } from 'react-router-dom';
import Layout from '../../../core/components/Layout';

export type OfficeCircular = {
  id: string;
  circularNo: string;
  title: string;
  category: 'Administrative' | 'Academic' | 'Examination' | 'Fee Notice' | 'Holiday' | 'Discipline';
  targetAudience: 'ALL' | 'STUDENTS' | 'STAFF';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  publishDate: string;
  effectiveUntil: string;
  status: 'PUBLISHED' | 'DRAFT';
  summary: string;
  content: string;
  issuedBy: string;
  attachmentName?: string;
  attachmentSize?: string;
  viewCount: number;
};

export const OfficeCircular = {};

export const DEFAULT_OFFICE_CIRCULARS: OfficeCircular[] = [
  {
    id: 'cir-001',
    circularNo: 'CIR/FIC/2026-27/042',
    title: 'Higher Secondary Public Examination Practical Schedule & Roll Allocations',
    category: 'Examination',
    targetAudience: 'STUDENTS',
    priority: 'URGENT',
    publishDate: '2026-10-18',
    effectiveUntil: '2026-11-30',
    status: 'PUBLISHED',
    summary: 'Practical examinations for Grade 11 & 12 (Maths-Bio, Maths-CS, Microbiology, Commerce) will commence on 5th Nov. Hall tickets are mandatory.',
    content: `All students appearing for the Higher Secondary Public Examination (Grades 11 & 12) are hereby notified that the Board Practical Examinations will commence on 5th November 2026.

1. Laboratory Practical Sessions will be conducted strictly in batches as per board regulations.
2. Students must bring their authenticated Practical Observation Manual and Hall Ticket.
3. Batch allocation and external examiner visits are scheduled between 09:00 AM and 01:00 PM.
4. Students must clear any pending lab breakage penalties before receiving their practical hall tickets.`,
    issuedBy: 'Office of the Principal & Examination Superintendent',
    attachmentName: 'HSC_Board_Practical_Guidelines_2026.pdf',
    attachmentSize: '1.4 MB',
    viewCount: 382
  },
  {
    id: 'cir-002',
    circularNo: 'CIR/FIC/2026-27/041',
    title: 'Mandatory Student "No Due" / Clearance Certificate Protocol',
    category: 'Administrative',
    targetAudience: 'ALL',
    priority: 'HIGH',
    publishDate: '2026-10-15',
    effectiveUntil: '2026-11-20',
    status: 'PUBLISHED',
    summary: 'Office Admin is issuing digital No Due Certificates. All students must obtain sign-offs from Library, Science/Computer Labs, Sports, and Accounts.',
    content: `This is an official memorandum regarding the institutional clearance and No Due certificate protocol for the ongoing academic term.

All students must complete department clearances across:
• Central Library (Return of borrowed books and overdue fine settlements)
• Science & Computer Laboratories (Clearance of apparatus breakage records)
• Physical Education & Sports (Return of school sports kits and equipment)
• Transport / Hostel Affairs (Route clearance and vehicle compliance)
• Accounts Section (Settlement of term tuition fees)

Once all departments have approved, the Office Administrator will issue the Official Institutional No Due Certificate.`,
    issuedBy: 'Registrar & Office Administration Division',
    attachmentName: 'No_Due_Clearance_Form_Template.pdf',
    attachmentSize: '480 KB',
    viewCount: 520
  },
  {
    id: 'cir-003',
    circularNo: 'CIR/FIC/2026-27/040',
    title: 'Staff Assessment Protocol: Dual Role Subject Teachers in Laboratory Classes',
    category: 'Academic',
    targetAudience: 'STAFF',
    priority: 'HIGH',
    publishDate: '2026-10-12',
    effectiveUntil: '2026-11-15',
    status: 'PUBLISHED',
    summary: 'Subject teachers handling practical laboratory classes are instructed to import class rosters directly and upload observation manuals.',
    content: `To optimize laboratory administration, subject teachers handling laboratory practicals (Physics, Chemistry, Biology, Microbiology, and Computer Science) are instructed to:

1. Import enrolled student rosters directly by selecting Class & Section without re-typing student details.
2. Accurately mark attendance during the practical session (Present/Absent/Late).
3. Immediately log any apparatus or equipment damage under the Lab Breakage Penalty module with student roll number.
4. Upload practical observation guidelines and sample problem sheets in Word (.docx) or PDF format for students.`,
    issuedBy: 'Academic Dean & Chief Administrative Officer',
    attachmentName: 'Lab_Staff_Faculty_Operating_SOP.docx',
    attachmentSize: '820 KB',
    viewCount: 164
  },
  {
    id: 'cir-004',
    circularNo: 'CIR/FIC/2026-27/038',
    title: 'Deepavali Institutional Holiday Declaration & Resumption Notice',
    category: 'Holiday',
    targetAudience: 'ALL',
    priority: 'NORMAL',
    publishDate: '2026-10-10',
    effectiveUntil: '2026-11-05',
    status: 'PUBLISHED',
    summary: 'School will observe holidays from 31st Oct to 3rd Nov on account of Deepavali. Regular classes resume 4th Nov.',
    content: `The institution will remain closed for all students, teaching, and non-teaching staff from Thursday, 31st October 2026 to Sunday, 3rd November 2026 in observance of the Deepavali festivities.

All academic, administrative, and laboratory activities will resume promptly on Monday, 4th November 2026 at 08:30 AM.
The school management wishes all students, parents, and staff members a joyful, safe, and prosperous Deepavali!`,
    issuedBy: 'Office of the Principal',
    viewCount: 890
  }
];

export const getStoredCirculars = (): OfficeCircular[] => {
  try {
    const raw = localStorage.getItem('erp_published_circulars');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse stored circulars', e);
  }
  localStorage.setItem('erp_published_circulars', JSON.stringify(DEFAULT_OFFICE_CIRCULARS));
  return DEFAULT_OFFICE_CIRCULARS;
};

export const saveStoredCirculars = (circulars: OfficeCircular[]) => {
  localStorage.setItem('erp_published_circulars', JSON.stringify(circulars));
  // Notify any active dashboards
  window.dispatchEvent(new Event('circulars_updated'));
};

const OfficeCircularsDesk: React.FC = () => {
  const navigate = useNavigate();
  const [circulars, setCirculars] = useState<OfficeCircular[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL_FILTER');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewCircular, setPreviewCircular] = useState<OfficeCircular | null>(null);

  // New circular form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'Administrative' as OfficeCircular['category'],
    targetAudience: 'ALL' as OfficeCircular['targetAudience'],
    priority: 'NORMAL' as OfficeCircular['priority'],
    summary: '',
    content: '',
    issuedBy: 'Office Superintendent & Administrative Head',
    effectiveUntil: '2026-12-31',
    status: 'PUBLISHED' as OfficeCircular['status'],
    attachmentName: ''
  });

  useEffect(() => {
    setCirculars(getStoredCirculars());
  }, []);

  const filteredCirculars = circulars.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.circularNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAudience = audienceFilter === 'ALL_FILTER' ? true : c.targetAudience === audienceFilter;
    const matchesCategory = categoryFilter === 'ALL' ? true : c.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' ? true : c.status === statusFilter;
    return matchesSearch && matchesAudience && matchesCategory && matchesStatus;
  });

  const handleTogglePublish = (id: string) => {
    const updated = circulars.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status: (c.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED') as OfficeCircular['status']
        };
      }
      return c;
    });
    setCirculars(updated);
    saveStoredCirculars(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this office circular?')) {
      const updated = circulars.filter(c => c.id !== id);
      setCirculars(updated);
      saveStoredCirculars(updated);
    }
  };

  const handleCreateCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const newCirc: OfficeCircular = {
      id: 'cir-' + Date.now(),
      circularNo: `CIR/FIC/2026-27/0${circulars.length + 43}`,
      title: formData.title,
      category: formData.category,
      targetAudience: formData.targetAudience,
      priority: formData.priority,
      publishDate: new Date().toISOString().split('T')[0],
      effectiveUntil: formData.effectiveUntil,
      status: formData.status,
      summary: formData.summary || formData.content.slice(0, 120) + '...',
      content: formData.content,
      issuedBy: formData.issuedBy,
      attachmentName: formData.attachmentName || undefined,
      attachmentSize: formData.attachmentName ? '1.2 MB' : undefined,
      viewCount: 0
    };

    const updated = [newCirc, ...circulars];
    setCirculars(updated);
    saveStoredCirculars(updated);
    setCreateModalOpen(false);
    setFormData({
      title: '',
      category: 'Administrative',
      targetAudience: 'ALL',
      priority: 'NORMAL',
      summary: '',
      content: '',
      issuedBy: 'Office Superintendent & Administrative Head',
      effectiveUntil: '2026-12-31',
      status: 'PUBLISHED',
      attachmentName: ''
    });
  };

  const publishedCount = circulars.filter(c => c.status === 'PUBLISHED').length;
  const studentCount = circulars.filter(c => c.targetAudience === 'STUDENTS' || c.targetAudience === 'ALL').length;
  const staffCount = circulars.filter(c => c.targetAudience === 'STAFF' || c.targetAudience === 'ALL').length;

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Navigation & Header */}
        <Box sx={{ mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/office/dashboard')}
            sx={{ textTransform: 'none', color: '#64748b', mb: 1, fontWeight: 600 }}
          >
            Back to Office Dashboard
          </Button>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CampaignIcon sx={{ fontSize: 36, color: '#4f46e5' }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Office Circulars Desk
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Generate official memorandums & notices for instant publication on Student and Staff Dashboards.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              sx={{
                borderRadius: 2.5,
                bgcolor: '#4f46e5',
                fontWeight: 700,
                textTransform: 'none',
                px: 3,
                py: 1.2,
                boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.4)',
                '&:hover': { bgcolor: '#4338ca' }
              }}
            >
              Draft New Circular
            </Button>
          </Box>
        </Box>

        {/* Stats Row */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CampaignIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Active Circulars</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{publishedCount}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #dcfce7', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Visible to Students</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d' }}>{studentCount}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e0f2fe', bgcolor: '#f0f9ff', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BadgeIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0369a1', textTransform: 'uppercase' }}>Visible to Staff / Faculty</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0c4a6e' }}>{staffCount}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fef3c7', bgcolor: '#fffbeb', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GroupsIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>Total Reads Logged</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#b45309' }}>
                  {circulars.reduce((acc, c) => acc + (c.viewCount || 0), 0)}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search circular title, reference number, or keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5, bgcolor: '#f8fafc' } }}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Target Audience"
                value={audienceFilter}
                onChange={e => setAudienceFilter(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="ALL_FILTER">All Audiences</MenuItem>
                <MenuItem value="ALL">All (Students & Staff)</MenuItem>
                <MenuItem value="STUDENTS">Students Only</MenuItem>
                <MenuItem value="STAFF">Staff & Faculty Only</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Category"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                <MenuItem value="Administrative">Administrative</MenuItem>
                <MenuItem value="Academic">Academic</MenuItem>
                <MenuItem value="Examination">Examination</MenuItem>
                <MenuItem value="Fee Notice">Fee Notice</MenuItem>
                <MenuItem value="Holiday">Holiday</MenuItem>
                <MenuItem value="Discipline">Discipline</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="ALL">All Status</MenuItem>
                <MenuItem value="PUBLISHED">Published</MenuItem>
                <MenuItem value="DRAFT">Draft</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Circulars List */}
        {filteredCirculars.length === 0 ? (
          <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
            <CampaignIcon sx={{ fontSize: 52, color: '#94a3b8', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>No circulars match your filter</Typography>
            <Typography variant="body2" color="text.secondary">Create a new circular or adjust your search filter.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {filteredCirculars.map(c => {
              const isPublished = c.status === 'PUBLISHED';
              const isUrgent = c.priority === 'URGENT';
              const isHigh = c.priority === 'HIGH';

              return (
                <Paper
                  key={c.id}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3.5,
                    border: '1px solid',
                    borderColor: isPublished ? (isUrgent ? '#fca5a5' : '#e2e8f0') : '#cbd5e1',
                    bgcolor: isPublished ? '#ffffff' : '#f8fafc',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#6366f1',
                      boxShadow: '0 8px 24px -6px rgba(0,0,0,0.06)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'flex-start' }, gap: 2, mb: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={c.circularNo}
                          size="small"
                          sx={{ fontWeight: 800, bgcolor: '#f1f5f9', color: '#1e293b', borderRadius: 1.5 }}
                        />
                        <Chip
                          label={c.category}
                          size="small"
                          sx={{ fontWeight: 600, bgcolor: '#e0e7ff', color: '#4338ca', borderRadius: 1.5 }}
                        />
                        <Chip
                          label={`Target: ${c.targetAudience === 'ALL' ? 'Everyone (Students & Staff)' : c.targetAudience === 'STUDENTS' ? 'Students Only' : 'Staff Only'}`}
                          size="small"
                          icon={c.targetAudience === 'STUDENTS' ? <SchoolIcon /> : c.targetAudience === 'STAFF' ? <BadgeIcon /> : <GroupsIcon />}
                          sx={{ fontWeight: 600, bgcolor: '#f0fdf4', color: '#166534', borderRadius: 1.5 }}
                        />
                        {isUrgent && (
                          <Chip
                            label="URGENT"
                            size="small"
                            color="error"
                            icon={<PriorityHighIcon />}
                            sx={{ fontWeight: 800, borderRadius: 1.5 }}
                          />
                        )}
                        {isHigh && (
                          <Chip
                            label="HIGH PRIORITY"
                            size="small"
                            color="warning"
                            sx={{ fontWeight: 700, borderRadius: 1.5 }}
                          />
                        )}
                        <Chip
                          label={isPublished ? "PUBLISHED (Live on Dashboards)" : "DRAFT (Hidden)"}
                          size="small"
                          color={isPublished ? "success" : "default"}
                          sx={{ fontWeight: 700, borderRadius: 1.5 }}
                        />
                      </Box>

                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                        {c.title}
                      </Typography>

                      <Typography variant="body2" sx={{ color: '#475569', mb: 1.5 }}>
                        {c.summary}
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, color: '#64748b', fontSize: '0.8rem' }}>
                        <span>Published: <strong>{c.publishDate}</strong></span>
                        <span>•</span>
                        <span>Issued by: <strong>{c.issuedBy}</strong></span>
                        {c.attachmentName && (
                          <>
                            <span>•</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#4f46e5', fontWeight: 600 }}>
                              <AttachFileIcon sx={{ fontSize: 16 }} />
                              {c.attachmentName} ({c.attachmentSize})
                            </span>
                          </>
                        )}
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => setPreviewCircular(c)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, borderColor: '#cbd5e1', color: '#334155' }}
                      >
                        Read Official Notice
                      </Button>

                      <Button
                        size="small"
                        variant="contained"
                        color={isPublished ? "warning" : "success"}
                        onClick={() => handleTogglePublish(c.id)}
                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                      >
                        {isPublished ? "Unpublish" : "Publish to Dashboards"}
                      </Button>

                      <Tooltip title="Delete Circular">
                        <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}

        {/* CREATE CIRCULAR MODAL */}
        <Dialog
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3.5 } }}
        >
          <form onSubmit={handleCreateCircular}>
            <DialogTitle sx={{ fontWeight: 800, pb: 1, borderBottom: '1px solid #e2e8f0' }}>
              Draft New Official Circular
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Circular Subject / Heading"
                    placeholder="e.g. Higher Secondary Public Examination Guidelines & Center Rules"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Target Audience (Visible In)"
                    value={formData.targetAudience}
                    onChange={e => setFormData({ ...formData, targetAudience: e.target.value as any })}
                  >
                    <MenuItem value="ALL">Everyone (Student & Staff Dashboards)</MenuItem>
                    <MenuItem value="STUDENTS">Students Dashboard Only</MenuItem>
                    <MenuItem value="STAFF">Teachers & Staff Dashboards Only</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Notice Category"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                  >
                    <MenuItem value="Administrative">Administrative</MenuItem>
                    <MenuItem value="Academic">Academic</MenuItem>
                    <MenuItem value="Examination">Examination</MenuItem>
                    <MenuItem value="Fee Notice">Fee Notice</MenuItem>
                    <MenuItem value="Holiday">Holiday</MenuItem>
                    <MenuItem value="Discipline">Discipline / Safety</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Priority Level"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    <MenuItem value="NORMAL">Normal</MenuItem>
                    <MenuItem value="HIGH">High Priority</MenuItem>
                    <MenuItem value="URGENT">Urgent / Critical Action</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Issuing Authority Sign-off"
                    value={formData.issuedBy}
                    onChange={e => setFormData({ ...formData, issuedBy: e.target.value })}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    type="date"
                    fullWidth
                    label="Effective Valid Until"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={formData.effectiveUntil}
                    onChange={e => setFormData({ ...formData, effectiveUntil: e.target.value })}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Executive Summary (Shown in dashboard card)"
                    placeholder="Brief 1-2 sentence overview for rapid student and teacher reading..."
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    label="Full Circular Text / Official Clauses"
                    placeholder="Provide full text of the circular, guidelines, batch timings, rules, or instructions..."
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 8 }}>
                  <TextField
                    fullWidth
                    label="Attach Reference Document (PDF/Word filename)"
                    placeholder="e.g. Higher_Secondary_Exam_Schedule_2026.pdf"
                    value={formData.attachmentName}
                    onChange={e => setFormData({ ...formData, attachmentName: e.target.value })}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachFileIcon sx={{ color: '#94a3b8' }} />
                          </InputAdornment>
                        ),
                      }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.status === 'PUBLISHED'}
                        onChange={e => setFormData({ ...formData, status: e.target.checked ? 'PUBLISHED' : 'DRAFT' })}
                        color="success"
                      />
                    }
                    label="Publish Immediately"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <Button onClick={() => setCreateModalOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                sx={{ borderRadius: 2.5, bgcolor: '#4f46e5', fontWeight: 700, textTransform: 'none', px: 3 }}
              >
                Save & Dispatch Circular
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* OFFICIAL LETTERHEAD MEMORANDUM PREVIEW DIALOG */}
        <Dialog
          open={Boolean(previewCircular)}
          onClose={() => setPreviewCircular(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3.5, overflow: 'hidden' } }}
        >
          {previewCircular && (
            <>
              <Box sx={{ p: 2.5, bgcolor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Official Institutional Memorandum • {previewCircular.circularNo}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={() => window.print()}
                    sx={{ bgcolor: '#4f46e5', textTransform: 'none', fontWeight: 700 }}
                  >
                    Print Circular
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setPreviewCircular(null)}
                    sx={{ color: '#ffffff', textTransform: 'none' }}
                  >
                    Close
                  </Button>
                </Box>
              </Box>

              <DialogContent sx={{ p: { xs: 3, md: 5 }, bgcolor: '#ffffff' }}>
                {/* Official Letterhead */}
                <Box sx={{ borderBottom: '3px double #0f172a', pb: 2.5, mb: 3, textAlign: 'center' }}>
                  <Typography variant="overline" sx={{ letterSpacing: 2.5, fontWeight: 800, color: '#4f46e5' }}>
                    CENTRAL BOARD AFFILIATION NO: 1930482 • SCHOOL CODE: 55420
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f172a', fontFamily: 'serif', mt: 0.5 }}>
                    FOUNDATION INTERNATIONAL CENTRAL SCHOOL
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    Administrative Block, Institutional Campus, Tech Valley Road • Contact: office@foundation-erp.edu
                  </Typography>
                  <Box sx={{ display: 'inline-block', bgcolor: '#0f172a', color: '#ffffff', px: 2, py: 0.5, borderRadius: 1, mt: 1.5, fontWeight: 800, fontSize: '0.8rem', letterSpacing: 1.5 }}>
                    OFFICE OF THE CHIEF REGISTRAR & ADMINISTRATIVE SUPERINTENDENT
                  </Box>
                </Box>

                {/* Metadata Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, borderBottom: '1px solid #e2e8f0', pb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      Ref: {previewCircular.circularNo}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Target Group: <strong>{previewCircular.targetAudience === 'ALL' ? 'All Students & Staff Members' : previewCircular.targetAudience}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      Date: {previewCircular.publishDate}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Category: {previewCircular.category}
                    </Typography>
                  </Box>
                </Box>

                {/* Subject */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', textDecoration: 'underline' }}>
                    SUB: {previewCircular.title.toUpperCase()}
                  </Typography>
                </Box>

                {/* Body Content */}
                <Box sx={{ mb: 4, minHeight: 180 }}>
                  <Typography variant="body1" sx={{ color: '#1e293b', whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                    {previewCircular.content}
                  </Typography>
                </Box>

                {/* Attachment note */}
                {previewCircular.attachmentName && (
                  <Paper elevation={0} sx={{ p: 2, mb: 4, bgcolor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AttachFileIcon sx={{ color: '#4f46e5' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        Enclosed Official Attachment: {previewCircular.attachmentName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Document size: {previewCircular.attachmentSize} • Verified digital signature attached.
                      </Typography>
                    </Box>
                  </Paper>
                )}

                {/* Sign-off & Seal */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 3, borderTop: '1px solid #e2e8f0' }}>
                  <Box sx={{ border: '2px solid #cbd5e1', p: 1.5, borderRadius: 2, textAlign: 'center', width: 140 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8', display: 'block' }}>
                      OFFICIAL SEAL
                    </Typography>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', border: '2px dashed #94a3b8', mx: 'auto', my: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SchoolIcon sx={{ color: '#94a3b8', fontSize: 24 }} />
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                      FIC SEC 2026
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'cursive', fontSize: '1.2rem', mb: 0.5 }}>
                      Dr. R. K. Ramanathan
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {previewCircular.issuedBy}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Foundation International Central School
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
            </>
          )}
        </Dialog>

      </Box>
    </Layout>
  );
};

export default OfficeCircularsDesk;
