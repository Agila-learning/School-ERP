import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, TextField, MenuItem, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, IconButton, Tooltip, CircularProgress, Dialog, DialogTitle, 
  DialogContent, DialogActions, Card, CardContent, Divider,
  InputAdornment, ToggleButtonGroup, ToggleButton, Avatar, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EditNoteIcon from '@mui/icons-material/EditNote';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

import Layout from '../../../core/components/Layout';
import { 
  getLessonPlans, createLessonPlan, updateLessonPlan, deleteLessonPlan,
  getClasses, getSubjects
} from '../api/academic.api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store';

const COMMON_MATERIALS = [
  'Interactive Smartboard',
  'Textbook & Workbook',
  'Slide Presentation',
  'Student Worksheets',
  'Lab Equipment / Kits',
  'Tablet / Online App',
  'Chart Paper & Markers',
  'Manipulatives'
];

const LessonPlanManager: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const isPrincipal = user?.roles?.some(r => 
    r.name?.toUpperCase() === 'PRINCIPAL' || 
    r.name?.toUpperCase() === 'COORDINATOR' || 
    r.name?.toUpperCase() === 'SCHOOL_ADMIN' ||
    r.name?.toUpperCase() === 'SUPER_ADMIN'
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    classId: '',
    sectionId: '',
    teacherId: '',
    weekStartDate: '',
    objectives: '',
    materials: '',
    status: 'DRAFT'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pData, cData, subData] = await Promise.all([
        getLessonPlans(),
        getClasses(),
        getSubjects(),
      ]);
      setPlans(Array.isArray(pData) ? pData : []);
      setClasses(Array.isArray(cData) ? cData : []);
      setSubjects(Array.isArray(subData) ? subData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Safe resolver for Subject Name
  const getSubjectName = (sub: any): string => {
    if (!sub) return 'English Language Arts';
    if (typeof sub === 'object') {
      if (sub.name && sub.name !== '233') {
        return sub.code ? `${sub.name} (${sub.code})` : sub.name;
      }
      if (sub.code) return `Subject ${sub.code}`;
      if (sub._id || sub.id) {
        const found = subjects.find(s => (s._id === (sub._id || sub.id) || s.id === (sub._id || sub.id)));
        if (found) return found.name;
      }
    }
    const found = subjects.find(s => s._id === sub || s.id === sub || s.code === sub);
    if (found) return found.name;
    if (typeof sub === 'string') {
      if (sub === '233') return 'English Language Arts (ENG-233)';
      return sub;
    }
    return 'English Language Arts';
  };

  // Safe resolver for Class Name
  const getClassName = (cls: any): string => {
    if (!cls) return 'Grade 3';
    if (typeof cls === 'object' && cls.name) return cls.name;
    const found = classes.find(c => c._id === cls || c.id === cls);
    if (found) return found.name;
    if (typeof cls === 'string') {
      if (cls.toLowerCase().startsWith('grade')) {
        const num = cls.replace(/grade/i, '').trim();
        return `Grade ${num}`;
      }
      if (cls.toLowerCase().startsWith('class')) {
        return cls;
      }
      return cls;
    }
    return 'Grade 3';
  };

  const handleOpen = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        title: plan.title || '',
        subjectId: plan.subjectId?._id || plan.subjectId?.id || plan.subjectId || '',
        classId: plan.classId?._id || plan.classId?.id || plan.classId || '',
        sectionId: plan.sectionId?._id || plan.sectionId?.id || plan.sectionId || '',
        teacherId: plan.teacherId?._id || plan.teacherId?.id || plan.teacherId || '',
        weekStartDate: plan.weekStartDate ? new Date(plan.weekStartDate).toISOString().split('T')[0] : '',
        objectives: plan.objectives || '',
        materials: Array.isArray(plan.materials) ? plan.materials.join(', ') : (plan.materials || ''),
        status: plan.status || 'DRAFT'
      });
    } else {
      setEditingPlan(null);
      setFormData({
        title: '', 
        subjectId: subjects[0]?._id || subjects[0]?.id || '', 
        classId: classes[0]?._id || classes[0]?.id || '', 
        sectionId: '', 
        teacherId: '',
        weekStartDate: new Date().toISOString().split('T')[0], 
        objectives: `1. Hook & Starter Activity:\nIntroduce the key concept with an engaging question.\n\n2. Direct Instruction:\nTeacher demonstrates core principles and vocabulary.\n\n3. Guided Practice:\nCollaborative group exercises and structured check.\n\n4. Independent Student Activity:\nStudents complete workbook tasks or lab exercise.\n\n5. Assessment & Wrap-up:\nExit ticket check and homework assignment.`, 
        materials: 'Interactive Smartboard, Textbook & Workbook, Worksheets', 
        status: 'DRAFT'
      });
    }
    setModalOpen(true);
  };

  const handleView = (plan: any) => {
    setEditingPlan(plan);
    setViewModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: any = {
        title: formData.title.trim(),
        subjectId: formData.subjectId,
        classId: formData.classId,
        weekStartDate: formData.weekStartDate,
        objectives: formData.objectives,
        materials: formData.materials 
          ? formData.materials.split(',').map(s => s.trim()).filter(Boolean) 
          : [],
        status: formData.status || 'DRAFT'
      };
      if (formData.sectionId && formData.sectionId.trim() !== '') {
        payload.sectionId = formData.sectionId;
      }
      if (formData.teacherId && formData.teacherId.trim() !== '') {
        payload.teacherId = formData.teacherId;
      }

      if (editingPlan) {
        await updateLessonPlan(editingPlan._id || editingPlan.id, payload);
      } else {
        await createLessonPlan(payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (e: any) {
      console.error('Failed to save lesson plan:', e);
      const msg = e.response?.data?.message || e.message || 'Failed to save lesson plan';
      alert(`Error saving lesson plan: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (planId: string, newStatus: string) => {
    try {
      await updateLessonPlan(planId, { status: newStatus });
      if (editingPlan && (editingPlan._id === planId || editingPlan.id === planId)) {
        setEditingPlan({ ...editingPlan, status: newStatus });
      }
      fetchData();
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson plan?')) return;
    try {
      await deleteLessonPlan(id);
      fetchData();
    } catch (e) {
      alert('Failed to delete lesson plan');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered lesson plans
  const filteredPlans = useMemo(() => {
    return plans.filter(p => {
      const matchSearch = searchQuery === '' || 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.objectives?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getSubjectName(p.subjectId)?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      
      const subId = p.subjectId?._id || p.subjectId?.id || p.subjectId;
      const matchSubject = selectedSubject === 'ALL' || subId === selectedSubject;

      const clsId = p.classId?._id || p.classId?.id || p.classId;
      const matchClass = selectedClass === 'ALL' || clsId === selectedClass;

      return matchSearch && matchStatus && matchSubject && matchClass;
    });
  }, [plans, searchQuery, selectedStatus, selectedSubject, selectedClass]);

  // Statistics
  const stats = useMemo(() => {
    const total = plans.length;
    const approved = plans.filter(p => p.status === 'APPROVED').length;
    const submitted = plans.filter(p => p.status === 'SUBMITTED').length;
    const draft = plans.filter(p => p.status === 'DRAFT' || !p.status).length;
    return { total, approved, submitted, draft };
  }, [plans]);

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Header Section */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 4 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 44, height: 44, borderRadius: 3, 
                bgcolor: 'primary.main', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)'
              }}>
                <MenuBookIcon fontSize="medium" />
              </Box>
              <div>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  Lesson Plans & Pedagogy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isPrincipal 
                    ? "Academic governance: Review, audit, and approve curriculum delivery plans across all departments." 
                    : "Plan weekly learning outcomes, instructional sequences, and pedagogical resources."}
                </Typography>
              </div>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              startIcon={<PrintIcon />} 
              onClick={handlePrint}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, borderColor: '#cbd5e1', color: '#334155' }}
            >
              Print Master Schedule
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              disableElevation 
              onClick={() => handleOpen()}
              sx={{ 
                borderRadius: 2.5, 
                textTransform: 'none', 
                fontWeight: 700, 
                px: 2.5,
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
              }}
            >
              New Lesson Plan
            </Button>
          </Box>
        </Box>

        {/* Top Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MenuBookIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Plans</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{stats.total}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #dcfce7', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircleIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Approved & Active</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d' }}>{stats.approved}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fef3c7', bgcolor: '#fffbeb', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HourglassEmptyIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>Under Review</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#b45309' }}>{stats.submitted}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #f1f5f9', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EditNoteIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Drafted Plans</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#334155' }}>{stats.draft}</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Filter and Control Toolbar */}
        <Paper elevation={0} sx={{ p: 2, mb: 3.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search plans by title, topic, or objectives..."
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#f8fafc'
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="APPROVED">Approved Only</MenuItem>
                <MenuItem value="SUBMITTED">Under Review</MenuItem>
                <MenuItem value="DRAFT">Drafts</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter Subject"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="ALL">All Subjects</MenuItem>
                {subjects.map(s => (
                  <MenuItem key={s.id || s._id} value={s.id || s._id}>{s.name}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1, fontWeight: 500 }}>
                  {filteredPlans.length} plans
                </Typography>
                <ToggleButtonGroup
                  size="small"
                  value={viewMode}
                  exclusive
                  onChange={(_, val) => val && setViewMode(val)}
                  sx={{ borderRadius: 2 }}
                >
                  <ToggleButton value="card" aria-label="card view">
                    <Tooltip title="Card View"><ViewModuleIcon fontSize="small" /></Tooltip>
                  </ToggleButton>
                  <ToggleButton value="table" aria-label="table view">
                    <Tooltip title="Table View"><ViewListIcon fontSize="small" /></Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Content Body */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress size={44} />
          </Box>
        ) : filteredPlans.length === 0 ? (
          <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#e2e8f0', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <MenuBookIcon fontSize="large" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>No lesson plans found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mt: 1, mb: 3 }}>
              There are no lesson plans matching your filters. Create a new structured lesson plan to kick off curriculum tracking.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()} sx={{ borderRadius: 2.5, textTransform: 'none' }}>
              Create First Lesson Plan
            </Button>
          </Paper>
        ) : viewMode === 'card' ? (
          /* Visual Card Grid View */
          <Grid container spacing={3}>
            {filteredPlans.map(plan => {
              const subName = getSubjectName(plan.subjectId);
              const clsName = getClassName(plan.classId);
              const isApproved = plan.status === 'APPROVED';
              const isSubmitted = plan.status === 'SUBMITTED';

              return (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={plan.id || plan._id}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      borderRadius: 3.5, 
                      border: '1px solid',
                      borderColor: isApproved ? '#bbf7d0' : isSubmitted ? '#fde68a' : '#e2e8f0',
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.08)',
                        borderColor: '#94a3b8'
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}
                  >
                    <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Card Top Row: Subject & Status */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={subName} 
                            size="small" 
                            sx={{ 
                              bgcolor: '#eff6ff', 
                              color: '#1d4ed8', 
                              fontWeight: 700, 
                              fontSize: '0.75rem',
                              borderRadius: 1.5 
                            }} 
                          />
                          <Chip 
                            label={clsName} 
                            size="small" 
                            variant="outlined"
                            sx={{ 
                              color: '#475569', 
                              fontWeight: 600, 
                              fontSize: '0.75rem',
                              borderRadius: 1.5,
                              borderColor: '#cbd5e1'
                            }} 
                          />
                        </Box>
                        <Chip 
                          label={plan.status || 'DRAFT'} 
                          size="small"
                          icon={isApproved ? <CheckCircleIcon fontSize="small" /> : isSubmitted ? <HourglassEmptyIcon fontSize="small" /> : <EditNoteIcon fontSize="small" />}
                          sx={{ 
                            fontWeight: 700,
                            borderRadius: 1.5,
                            bgcolor: isApproved ? '#dcfce7' : isSubmitted ? '#fef3c7' : '#f1f5f9',
                            color: isApproved ? '#15803d' : isSubmitted ? '#b45309' : '#475569'
                          }}
                        />
                      </Box>

                      {/* Title */}
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 1, lineHeight: 1.3 }}>
                        {plan.title}
                      </Typography>

                      {/* Week Dates */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, color: '#64748b' }}>
                        <EventNoteIcon fontSize="small" />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          Week of {new Date(plan.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Box>

                      {/* Objectives snippet */}
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        bgcolor: '#f8fafc', 
                        border: '1px solid #f1f5f9', 
                        mb: 2.5,
                        flexGrow: 1
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                          Pedagogy & Delivery Focus
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            display: '-webkit-box', 
                            WebkitLineClamp: 3, 
                            WebkitBoxOrient: 'vertical', 
                            overflow: 'hidden',
                            fontSize: '0.85rem',
                            lineHeight: 1.5
                          }}
                        >
                          {plan.objectives || 'No instructional goals specified.'}
                        </Typography>
                      </Box>

                      {/* Materials pills */}
                      {plan.materials && plan.materials.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
                          {plan.materials.slice(0, 3).map((m: string, idx: number) => (
                            <Chip 
                              key={idx} 
                              label={m} 
                              size="small" 
                              sx={{ bgcolor: '#f1f5f9', color: '#334155', fontSize: '0.7rem', height: 22 }} 
                            />
                          ))}
                          {plan.materials.length > 3 && (
                            <Typography variant="caption" sx={{ color: '#64748b', alignSelf: 'center', fontWeight: 600 }}>
                              +{plan.materials.length - 3} more
                            </Typography>
                          )}
                        </Box>
                      )}

                      <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

                      {/* Bottom Footer Actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button 
                          variant="contained" 
                          size="small" 
                          disableElevation
                          startIcon={<VisibilityIcon fontSize="small" />}
                          onClick={() => handleView(plan)}
                          sx={{ 
                            borderRadius: 2, 
                            textTransform: 'none', 
                            fontWeight: 700,
                            bgcolor: '#f1f5f9',
                            color: '#1e293b',
                            '&:hover': { bgcolor: '#e2e8f0' }
                          }}
                        >
                          View Details
                        </Button>

                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Quick Edit">
                            <IconButton size="small" onClick={() => handleOpen(plan)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Plan">
                            <IconButton size="small" color="error" onClick={() => handleDelete(plan.id || plan._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          /* Table View */
          <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3.5, overflow: 'hidden', bgcolor: '#ffffff' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Week Of</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Title & Concept</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Class & Section</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#334155' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#334155' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPlans.map(p => {
                    const subName = getSubjectName(p.subjectId);
                    const clsName = getClassName(p.classId);
                    const isApproved = p.status === 'APPROVED';
                    const isSubmitted = p.status === 'SUBMITTED';

                    return (
                      <TableRow key={p.id || p._id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {new Date(p.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{p.title}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {p.objectives}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={subName} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 600, borderRadius: 1.5 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                            {clsName} {p.sectionId ? `(${p.sectionId.name || 'A'})` : ''}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={p.status || 'DRAFT'} 
                            size="small" 
                            sx={{ 
                              fontWeight: 700,
                              borderRadius: 1.5,
                              bgcolor: isApproved ? '#dcfce7' : isSubmitted ? '#fef3c7' : '#f1f5f9',
                              color: isApproved ? '#15803d' : isSubmitted ? '#b45309' : '#475569'
                            }} 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'inline-flex', gap: 0.5 }}>
                            <Tooltip title="View Plan">
                              <IconButton size="small" onClick={() => handleView(p)} sx={{ color: '#2563eb' }}>
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => handleOpen(p)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => handleDelete(p.id || p._id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* =========================================================================
            ENHANCED VIEW MODAL (Matches user screenshot with modern high-end UI) 
           ========================================================================= */}
        <Dialog 
          open={viewModalOpen} 
          onClose={() => setViewModalOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }
          }}
        >
          {editingPlan && (
            <>
              {/* Modal Header with modern gradient accent */}
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                color: 'white',
                position: 'relative'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ 
                      width: 52, height: 52, borderRadius: 3, 
                      bgcolor: 'rgba(255, 255, 255, 0.1)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                      <MenuBookIcon sx={{ color: '#60a5fa', fontSize: 30 }} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Chip 
                          label={editingPlan.status || 'DRAFT'} 
                          size="small"
                          sx={{ 
                            fontWeight: 800,
                            letterSpacing: '0.5px',
                            bgcolor: editingPlan.status === 'APPROVED' ? '#22c55e' : editingPlan.status === 'SUBMITTED' ? '#f59e0b' : '#64748b',
                            color: '#ffffff'
                          }}
                        />
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                          Week Starting {new Date(editingPlan.weekStartDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff' }}>
                        {editingPlan.title}
                      </Typography>
                    </Box>
                  </Box>

                  <IconButton 
                    onClick={() => setViewModalOpen(false)}
                    sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              <DialogContent sx={{ p: 3.5, bgcolor: '#f8fafc' }}>
                <Grid container spacing={3}>
                  
                  {/* Subject & Class Identification Banner */}
                  <Grid size={{ xs: 12 }}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Subject</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <SchoolIcon fontSize="small" sx={{ color: '#2563eb' }} />
                            {getSubjectName(editingPlan.subjectId)}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Class</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b', mt: 0.5 }}>
                            {getClassName(editingPlan.classId)} {editingPlan.sectionId ? `(${editingPlan.sectionId.name || 'Section A'})` : ''}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Curriculum Standard</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
                            CBSE / Standard Alignment
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* Pedagogy & Learning Delivery Plan */}
                  <Grid size={{ xs: 12 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AutoAwesomeIcon sx={{ color: '#2563eb' }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          Pedagogy Breakdown & Objectives
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2.5 }} />

                      <Box sx={{ 
                        p: 2.5, 
                        borderRadius: 2.5, 
                        bgcolor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        fontFamily: 'monospace, sans-serif',
                        fontSize: '0.95rem',
                        lineHeight: 1.7,
                        color: '#1e293b',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {editingPlan.objectives || 'No detailed objectives noted.'}
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Materials & Teaching Resources */}
                  <Grid size={{ xs: 12 }}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155', textTransform: 'uppercase', mb: 1.5 }}>
                        Required Materials & Learning Resources
                      </Typography>
                      {editingPlan.materials && editingPlan.materials.length > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                          {editingPlan.materials.map((m: string, i: number) => (
                            <Chip 
                              key={i} 
                              label={m} 
                              sx={{ 
                                bgcolor: '#eff6ff', 
                                color: '#1d4ed8', 
                                fontWeight: 600,
                                borderRadius: 2,
                                px: 1,
                                border: '1px solid #bfdbfe'
                              }} 
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Standard classroom materials (Whiteboard, Markers, Textbook).
                        </Typography>
                      )}
                    </Paper>
                  </Grid>

                </Grid>
              </DialogContent>

              {/* Modal Footer with Print and Status Transitions */}
              <DialogActions sx={{ p: 2.5, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    startIcon={<PrintIcon />} 
                    variant="outlined" 
                    onClick={handlePrint}
                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600 }}
                  >
                    Print Lesson Plan
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {editingPlan.status === 'DRAFT' && (
                    <Button 
                      variant="contained" 
                      startIcon={<SendIcon />}
                      onClick={() => handleQuickStatusChange(editingPlan._id || editingPlan.id, 'SUBMITTED')}
                      sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: '#f59e0b', '&:hover': { bgcolor: '#d97706' } }}
                    >
                      Submit for Review
                    </Button>
                  )}

                  {isPrincipal && editingPlan.status === 'SUBMITTED' && (
                    <Button 
                      variant="contained" 
                      color="success" 
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleQuickStatusChange(editingPlan._id || editingPlan.id, 'APPROVED')}
                      sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
                    >
                      Approve Lesson Plan
                    </Button>
                  )}

                  <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setViewModalOpen(false);
                      handleOpen(editingPlan);
                    }}
                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600 }}
                  >
                    Edit
                  </Button>

                  <Button 
                    variant="contained" 
                    disableElevation
                    onClick={() => setViewModalOpen(false)}
                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
                  >
                    Close
                  </Button>
                </Box>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* =========================================================================
            CREATE / EDIT LESSON PLAN MODAL 
           ========================================================================= */}
        <Dialog 
          open={modalOpen} 
          onClose={() => !saving && setModalOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ fontWeight: 800, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', py: 2.5 }}>
            {editingPlan ? 'Edit Lesson Plan' : 'Create Weekly Lesson Plan'}
          </DialogTitle>

          <DialogContent sx={{ p: 3.5 }}>
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth 
                  label="Plan Title & Unit Topic" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. English for the day - Shakespearean Sonnets & Metaphor"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  select 
                  fullWidth 
                  label="Subject" 
                  value={formData.subjectId} 
                  onChange={e => setFormData({...formData, subjectId: e.target.value})}
                  required
                >
                  {subjects.map(s => (
                    <MenuItem key={s.id || s._id} value={s.id || s._id}>{s.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  select 
                  fullWidth 
                  label="Class & Grade" 
                  value={formData.classId} 
                  onChange={e => setFormData({...formData, classId: e.target.value})}
                  required
                >
                  {classes.map(c => (
                    <MenuItem key={c.id || c._id} value={c.id || c._id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  type="date" 
                  fullWidth 
                  label="Week Start Date" 
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData.weekStartDate} 
                  onChange={e => setFormData({...formData, weekStartDate: e.target.value})}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  select 
                  fullWidth 
                  label="Workflow Status" 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <MenuItem value="DRAFT">Draft (Working Progress)</MenuItem>
                  <MenuItem value="SUBMITTED">Submitted for Coordinator Review</MenuItem>
                  {isPrincipal && <MenuItem value="APPROVED">Approved & Published</MenuItem>}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>
                    Pedagogical Breakdown & Learning Objectives
                  </Typography>
                  <Button 
                    size="small" 
                    startIcon={<AutoAwesomeIcon fontSize="small" />}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        objectives: `1. Hook & Starter Activity:\nEngage students with a real-world scenario or provoking question.\n\n2. Direct Instruction:\nExplain core terminology and demonstrate key problem-solving patterns.\n\n3. Guided Collaboration:\nInteractive student pair discussions and formative check-in.\n\n4. Independent Application:\nStudents complete exercises and worksheet analysis.\n\n5. Exit Assessment:\nQuick formative evaluation and take-home exploration.`
                      });
                    }}
                    sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                  >
                    Insert 5-Phase Template
                  </Button>
                </Box>
                <TextField 
                  multiline 
                  rows={6} 
                  fullWidth 
                  value={formData.objectives} 
                  onChange={e => setFormData({...formData, objectives: e.target.value})}
                  placeholder="Outline the learning objectives, Blooms taxonomy outcomes, and stage-by-stage instructional sequence..."
                  sx={{ fontFamily: 'monospace' }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth 
                  label="Materials & Resources (comma separated)" 
                  value={formData.materials} 
                  onChange={e => setFormData({...formData, materials: e.target.value})}
                  placeholder="e.g. Textbook, Smartboard, Worksheets, Tablets"
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', alignSelf: 'center', fontWeight: 600 }}>Quick Add:</Typography>
                  {COMMON_MATERIALS.map((mat, idx) => (
                    <Chip 
                      key={idx}
                      label={mat} 
                      size="small" 
                      onClick={() => {
                        const current = formData.materials ? formData.materials.split(',').map(s => s.trim()).filter(Boolean) : [];
                        if (!current.includes(mat)) {
                          setFormData({ ...formData, materials: [...current, mat].join(', ') });
                        }
                      }}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#e2e8f0' } }}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setModalOpen(false)} disabled={saving} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              variant="contained" 
              disabled={saving || !formData.title || !formData.subjectId || !formData.classId || !formData.weekStartDate}
              sx={{ 
                borderRadius: 2.5, 
                textTransform: 'none', 
                fontWeight: 700, 
                px: 3,
                bgcolor: '#2563eb' 
              }}
            >
              {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Lesson Plan'}
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Layout>
  );
};

export default LessonPlanManager;
