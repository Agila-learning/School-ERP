import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import PaletteIcon from '@mui/icons-material/Palette';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintIcon from '@mui/icons-material/Print';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import MoodIcon from '@mui/icons-material/Mood';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

// Wing Definitions
type EducationalWing = 'KINDERGARTEN' | 'PRIMARY' | 'SECONDARY' | 'HIGHER_SECONDARY';

interface WingMeta {
  id: EducationalWing;
  label: string;
  icon: string;
  grades: string;
  headmaster: string;
  totalStudents: number;
  totalStaff: number;
}

const WINGS_CONFIG: WingMeta[] = [
  {
    id: 'KINDERGARTEN',
    label: '🧸 Kindergarten / Early Years (Pre-KG, LKG, UKG)',
    icon: '🧸',
    grades: 'Pre-KG, LKG, UKG (Ages 2.5 - 5.5 yrs)',
    headmaster: 'Mrs. Devaki Raman (ECCE Early Childhood Specialist)',
    totalStudents: 0,
    totalStaff: 0
  },
  {
    id: 'PRIMARY',
    label: '🎒 Primary Wing (Grades 1 to 5)',
    icon: '🎒',
    grades: 'Grade 1 through Grade 5',
    headmaster: 'Mr. Anand Chandrasekar (Primary Coordinator)',
    totalStudents: 0,
    totalStaff: 0
  },
  {
    id: 'SECONDARY',
    label: '📚 Secondary Wing (Grades 6 to 10)',
    icon: '📚',
    grades: 'Grade 6 through Grade 10',
    headmaster: 'Mrs. Meenakshi Sunder (Academic Vice Principal)',
    totalStudents: 0,
    totalStaff: 0
  },
  {
    id: 'HIGHER_SECONDARY',
    label: '🎓 Higher Secondary Wing (Grades 11 & 12)',
    icon: '🎓',
    grades: 'Grades 11 & 12 (Science, Commerce, Arts)',
    headmaster: 'Dr. Ramesh Sundaram (Senior Principal)',
    totalStudents: 0,
    totalStaff: 0
  }
];

// Kindergarten Sections Data
interface KGSection {
  id: string;
  grade: 'Pre-KG' | 'LKG' | 'UKG';
  name: string;
  room: string;
  ageGroup: string;
  enrolled: number;
  capacity: number;
  leadTeacher: string;
  assistantTeacher: string;
  caregiverAyah: string;
  theme: string;
}

const INITIAL_KG_SECTIONS: KGSection[] = [];

// Sample Toddlers for Daily Trackers
interface ToddlerTracker {
  id: string;
  name: string;
  section: string;
  photoUrl: string;
  morningSnack: 'Ate All' | 'Ate Half' | 'Picky / Skipped';
  lunch: 'Ate All' | 'Ate Half' | 'Picky / Skipped';
  afternoonSnack: 'Ate All' | 'Ate Half' | 'Picky / Skipped';
  napStatus: 'Sound Asleep' | 'Resting Quietly' | 'Restless' | 'Awake & Reading';
  napMinutes: number;
  mood: 'Very Happy' | 'Playful' | 'A Bit Shy' | 'Cried at Morning Drop';
  sensoryActivity: string;
  toiletIndependence: 'Fully Independent' | 'Assisted by Ayah' | 'Accident Handled Calmly';
  pickupGuardian: string;
  pickupRfid: string;
  pickupRelation: string;
  pickupStatus: 'Verified & Departed' | 'Authorized Guardian Arrived' | 'Awaiting Pickup in Daycare';
  allergyAlert?: string;
  teacherNote: string;
}

const INITIAL_TODDLERS: ToddlerTracker[] = [];

export const KindergartenDashboard: React.FC = () => {
  // 1. Wing Selector (Kindergarten, Primary, Secondary, Higher Secondary)
  const [selectedWing, setSelectedWing] = useState<EducationalWing>('KINDERGARTEN');
  
  // Tabs within Kindergarten
  const [activeTab, setActiveTab] = useState<number>(0);

  // Sections State
  const [sections, setSections] = useState<KGSection[]>(INITIAL_KG_SECTIONS);
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');

  // Toddler Trackers State
  const [toddlers, setToddlers] = useState<ToddlerTracker[]>(INITIAL_TODDLERS);

  // Parent Slip Dialog
  const [selectedToddlerForSlip, setSelectedToddlerForSlip] = useState<ToddlerTracker | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState<boolean>(false);

  // Staff Allocation Modal
  const [isAllocationOpen, setIsAllocationOpen] = useState<boolean>(false);
  const [allocationForm, setAllocationForm] = useState({
    wing: 'KINDERGARTEN',
    grade: 'Pre-KG',
    sectionName: 'Little Stars (Section A)',
    leadTeacher: 'Ms. Keerthana R. (Montessori Dip.)',
    assistantTeacher: 'Ms. Sneha V.',
    caregiverAyah: 'Amudha Amma (Lead Ayah)',
    shiftTiming: 'Full Day (8:00 AM - 3:30 PM)'
  });

  const activeWingMeta = WINGS_CONFIG.find(w => w.id === selectedWing)!;

  // Toddler operational stats calculation
  const totalToddlers = toddlers.length;
  const presentToddlers = toddlers.filter(t => t.pickupStatus !== 'Verified & Departed').length;
  const activePct = totalToddlers > 0 ? Math.round((presentToddlers / totalToddlers) * 100) : 0;
  const fullMealsAte = toddlers.filter(t => t.lunch === 'Ate All').length;
  const soundSleepers = toddlers.filter(t => t.napStatus === 'Sound Asleep' || t.napStatus === 'Resting Quietly').length;
  const departedCount = toddlers.filter(t => t.pickupStatus === 'Verified & Departed').length;

  const handleOpenSlip = (toddler: ToddlerTracker) => {
    setSelectedToddlerForSlip(toddler);
    setIsSlipOpen(true);
  };

  const handleSaveAllocation = () => {
    // If updating a kindergarten section
    if (allocationForm.wing === 'KINDERGARTEN') {
      setSections(prev => prev.map(s => {
        if (s.name.includes(allocationForm.sectionName) || s.grade === allocationForm.grade) {
          return {
            ...s,
            leadTeacher: allocationForm.leadTeacher,
            assistantTeacher: allocationForm.assistantTeacher,
            caregiverAyah: allocationForm.caregiverAyah
          };
        }
        return s;
      }));
    }
    setIsAllocationOpen(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1440, margin: '0 auto' }}>
      {/* Top Educational Wing Bar */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          mb: 3, 
          bgcolor: '#ffffff', 
          border: '1px solid #e2e8f0', 
          borderRadius: 3,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#ec4899', width: 52, height: 52, fontSize: '1.8rem' }}>
                {activeWingMeta.icon}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {selectedWing === 'KINDERGARTEN' ? 'Kindergarten & Early Childhood Command Center' : `${activeWingMeta.label} Overview`}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={activeWingMeta.grades} 
                    sx={{ bgcolor: '#fdf2f8', color: '#db2777', fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Supervisor: <b>{activeWingMeta.headmaster}</b> • Total Enrolled: <b>{activeWingMeta.totalStudents} Students</b> • Teaching & Care Staff: <b>{activeWingMeta.totalStaff}</b>
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Wing Selector Dropdown */}
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1.5 }}>
            <Box sx={{ minWidth: 320 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                Choose Educational Wing / Level:
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedWing}
                onChange={(e) => setSelectedWing(e.target.value as EducationalWing)}
                sx={{
                  bgcolor: '#f8fafc',
                  '& .MuiSelect-select': { fontWeight: 700, py: 1.2 }
                }}
              >
                {WINGS_CONFIG.map(w => (
                  <MenuItem key={w.id} value={w.id} sx={{ py: 1.2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <span>{w.icon}</span>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{w.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{w.grades}</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AssignmentIndIcon />}
              onClick={() => {
                setAllocationForm(prev => ({ ...prev, wing: selectedWing }));
                setIsAllocationOpen(true);
              }}
              sx={{ height: 42, mt: 2.7, fontWeight: 700, borderRadius: 2 }}
            >
              Allocate Staff
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Render NON-KINDERGARTEN Wings if Selected */}
      {selectedWing !== 'KINDERGARTEN' ? (
        <Card sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Box sx={{ maxWidth: 800 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
              {activeWingMeta.label} - Academic Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This wing covers {activeWingMeta.grades}. Curriculum planning, grade-wise class teacher allocation, term syllabus pacing, and exam schedules are managed here.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">TOTAL ENROLLED</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {activeWingMeta.totalStudents}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">FACULTY & STAFF</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
                    {activeWingMeta.totalStaff}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">COORDINATOR / HOD</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {activeWingMeta.headmaster}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="secondary" 
                onClick={() => setSelectedWing('KINDERGARTEN')}
                startIcon={<ChildCareIcon />}
                sx={{ fontWeight: 700 }}
              >
                Return to Kindergarten View
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<AssignmentIndIcon />}
                onClick={() => setIsAllocationOpen(true)}
              >
                Configure Staff for {activeWingMeta.label.split(' ')[1]}
              </Button>
            </Box>
          </Box>
        </Card>
      ) : (
        /* Render KINDERGARTEN Specialized Early Childhood Dashboard */
        <>
          {/* Quick Pre-Primary Operational Stats */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 2.5 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#e11d48', textTransform: 'uppercase' }}>
                        Toddlers Present
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#9f1239', mt: 0.5 }}>
                        {presentToddlers} <Typography component="span" variant="body2" sx={{ color: '#e11d48' }}>/ {totalToddlers}</Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{activePct}% Active In Wing</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f43f5e', width: 48, height: 48 }}>
                      <ChildCareIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 2.5 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                        Nutrition & Lunch
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#92400e', mt: 0.5 }}>
                        {fullMealsAte} <Typography component="span" variant="body2" sx={{ color: '#d97706' }}>/ {totalToddlers}</Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Finished Warm Balanced Lunch</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f59e0b', width: 48, height: 48 }}>
                      <RestaurantIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2.5 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                        Nap Time Rested
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#14532d', mt: 0.5 }}>
                        {soundSleepers} <Typography component="span" variant="body2" sx={{ color: '#16a34a' }}>/ {totalToddlers}</Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Cot & Mat Rest Completed</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#10b981', width: 48, height: 48 }}>
                      <BedtimeIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card sx={{ bgcolor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 2.5 }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                        Dismissal & Pick-Up
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#5b21b6', mt: 0.5 }}>
                        {departedCount} <Typography component="span" variant="body2" sx={{ color: '#7c3aed' }}>Handed Over</Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">All authorized RFID verified</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#8b5cf6', width: 48, height: 48 }}>
                      <VerifiedUserIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Kindergarten Tabs Navigation */}
          <Paper sx={{ mb: 3, borderRadius: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newVal) => setActiveTab(newVal)}
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab icon={<PeopleIcon />} iconPosition="start" label="1. Kindergarten Sections & Classes" sx={{ fontWeight: 700 }} />
              <Tab icon={<RestaurantIcon />} iconPosition="start" label="2. Meals, Naps & Daily Routine" sx={{ fontWeight: 700 }} />
              <Tab icon={<PaletteIcon />} iconPosition="start" label="3. Sensory & Developmental Milestones" sx={{ fontWeight: 700 }} />
              <Tab icon={<SecurityIcon />} iconPosition="start" label="4. Guardian Pick-Up & Safe Dismissal" sx={{ fontWeight: 700 }} />
              <Tab icon={<AssignmentIndIcon />} iconPosition="start" label="5. Staff & Caregiver Allocation" sx={{ fontWeight: 700 }} />
            </Tabs>
          </Paper>

          {/* TAB 0: SECTIONS & CLASSROOMS */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Pre-Primary Class Sections</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Configured with designated lead educators, assistant teachers, and caregiver ayahs for optimal child-to-caregiver ratios.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['ALL', 'Pre-KG', 'LKG', 'UKG'].map(lvl => (
                    <Button
                      key={lvl}
                      size="small"
                      variant={selectedSectionFilter === lvl ? 'contained' : 'outlined'}
                      onClick={() => setSelectedSectionFilter(lvl)}
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                      {lvl}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                {sections.filter(s => selectedSectionFilter === 'ALL' || s.grade === selectedSectionFilter).length === 0 ? (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                      <ChildCareIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#475569' }}>
                        No Pre-Primary Sections Configured
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create kindergarten sections (Pre-KG, LKG, UKG) to manage early childhood nurture and classroom allocation.
                      </Typography>
                    </Box>
                  </Grid>
                ) : (
                  sections
                    .filter(s => selectedSectionFilter === 'ALL' || s.grade === selectedSectionFilter)
                    .map(sec => (
                      <Grid size={{ xs: 12, md: 6, lg: 4 }} key={sec.id}>
                        <Card sx={{ height: '100%', border: '1px solid #e2e8f0', borderRadius: 2.5, boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                          <CardHeader
                            avatar={
                              <Avatar sx={{ bgcolor: sec.grade === 'Pre-KG' ? '#f43f5e' : sec.grade === 'LKG' ? '#eab308' : '#06b6d4', fontWeight: 800 }}>
                                {sec.grade.charAt(0)}
                              </Avatar>
                            }
                            title={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{sec.name}</Typography>}
                            subheader={<Typography variant="caption" color="text.secondary">{sec.ageGroup} • {sec.room}</Typography>}
                            action={
                              <Chip 
                                size="small" 
                                label={`${sec.enrolled}/${sec.capacity}`} 
                                color={sec.enrolled >= sec.capacity ? 'error' : 'success'} 
                                sx={{ fontWeight: 700 }}
                              />
                            }
                          />
                          <Divider />
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                              ALLOCATED TEACHING & NURTURE TEAM:
                            </Typography>
                            
                            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SchoolIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Lead Educator:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{sec.leadTeacher}</Typography>
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SupervisorAccountIcon sx={{ fontSize: 18, color: '#8b5cf6' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Assistant Teacher:</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{sec.assistantTeacher}</Typography>
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <VolunteerActivismIcon sx={{ fontSize: 18, color: '#ec4899' }} />
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Caregiver / Ayah (Washroom & Meals):</Typography>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#be185d' }}>{sec.caregiverAyah}</Typography>
                                </Box>
                              </Box>
                            </Box>

                            <Box sx={{ mt: 2, p: 1.2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                              <Typography variant="caption" color="text.secondary">CURRENT PEDAGOGY THEME:</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                                🎨 {sec.theme}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                )}
              </Grid>
            </Box>
          )}

          {/* TAB 1: MEALS & NAP TIME ROUTINE */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Daily Meals & Nap Time Log</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monitors toddler food intake, dietary allergy restrictions, and afternoon rest quality.
                  </Typography>
                </Box>
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Toddler Details</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Class & Section</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Morning Snack (8:45 AM)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nutritious Lunch (11:45 AM)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Nap Rest (12:30 - 2:00 PM)</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Allergy & Dietary Notes</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Parent Report</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {toddlers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No early year scholars registered in live care tracker today.
                        </TableCell>
                      </TableRow>
                    ) : (
                      toddlers.map(t => (
                      <TableRow key={t.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={t.photoUrl} alt={t.name} />
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{t.id}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={t.section} sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={t.morningSnack} 
                            color={t.morningSnack === 'Ate All' ? 'success' : 'warning'} 
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={t.lunch} 
                            color={t.lunch === 'Ate All' ? 'success' : 'warning'} 
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <BedtimeIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.napStatus}</Typography>
                            <Typography variant="caption" color="text.secondary">({t.napMinutes} mins)</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {t.allergyAlert ? (
                            <Chip size="small" label={t.allergyAlert} color="error" sx={{ fontWeight: 700 }} />
                          ) : (
                            <Typography variant="caption" color="text.secondary">Normal diet (No allergy)</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() => handleOpenSlip(t)}
                            sx={{ fontWeight: 700, borderRadius: 1.5 }}
                          >
                            Parent Slip
                          </Button>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 2: SENSORY & DEVELOPMENTAL MILESTONES */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Early Childhood Milestones & Sensory Engagement</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Holistic tracking of speech, motor skills, sensory table participation, and toilet training independence.
              </Typography>

              <Grid container spacing={2.5}>
                {toddlers.length === 0 ? (
                  <Grid size={{ xs: 12 }}>
                    <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
                      <MoodIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#475569' }}>
                        No Toddler Development Milestones Logged
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Development milestones, sensory activities, and mood updates will appear here when toddlers are enrolled.
                      </Typography>
                    </Box>
                  </Grid>
                ) : (
                  toddlers.map(t => (
                    <Grid size={{ xs: 12, md: 6 }} key={t.id}>
                    <Card sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={t.photoUrl} alt={t.name} sx={{ width: 48, height: 48 }} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{t.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{t.section}</Typography>
                          </Box>
                        </Box>
                        <Chip 
                          size="small" 
                          icon={<MoodIcon />} 
                          label={`Mood: ${t.mood}`} 
                          color="secondary" 
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            TODAY'S SENSORY & MOTOR ACTIVITY:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            🎨 {t.sensoryActivity}
                          </Typography>
                        </Box>

                        <Box sx={{ p: 1, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            WASHROOM & TOILET INDEPENDENCE:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#16a34a' }}>
                            🚽 {t.toiletIndependence}
                          </Typography>
                        </Box>

                        <Box sx={{ p: 1, bgcolor: '#fdf2f8', borderRadius: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                            EDUCATOR'S DAILY ANECDOTAL NOTE:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#831843' }}>
                            "{t.teacherNote}"
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                )))}
              </Grid>
            </Box>
          )}

          {/* TAB 3: GUARDIAN PICK-UP & SAFE DISMISSAL */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Guardian Pick-up & Safe Dismissal Gate Log</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Dual-verification: RFID match, authorized guardian identity verification, and Ayah escort sign-off.
              </Typography>

              <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Toddler</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Authorized Pick-up Person</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Relationship / Mode</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Guardian RFID / PIN</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Dismissal Gate Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {toddlers.map(t => (
                      <TableRow key={t.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={t.photoUrl} alt={t.name} />
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{t.section}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{t.pickupGuardian}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={t.pickupRelation} sx={{ fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: '#e2e8f0', p: 0.5, borderRadius: 1 }}>
                            {t.pickupRfid}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={t.pickupStatus} 
                            color={t.pickupStatus === 'Verified & Departed' ? 'success' : t.pickupStatus === 'Authorized Guardian Arrived' ? 'primary' : 'warning'}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {t.pickupStatus !== 'Verified & Departed' ? (
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => {
                                setToddlers(prev => prev.map(x => x.id === t.id ? { ...x, pickupStatus: 'Verified & Departed' } : x));
                              }}
                              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                            >
                              Verify & Handover
                            </Button>
                          ) : (
                            <Chip size="small" icon={<CheckCircleIcon />} label="Handover Complete" color="default" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* TAB 4: STAFF & CAREGIVER ALLOCATION DESK */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Pre-Primary Staff & Ayah Caregiver Roster</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Ensuring each kindergarten room has an ECCE Lead Educator, an Assistant Teacher, and a dedicated Ayah Caregiver.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setIsAllocationOpen(true)}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  New Staff Allocation
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Grade & Section</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Lead Montessori Educator</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Assistant Teacher</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Dedicated Ayah / Caregiver</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Shift Schedule</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No early childhood sections configured yet. Click "+ Add Section" to configure classes.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sections.map(s => (
                      <TableRow key={s.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{s.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.grade} • {s.room}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.8rem' }}>T</Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.leadTeacher}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{s.assistantTeacher}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small" 
                            label={`Ayah: ${s.caregiverAyah}`} 
                            sx={{ bgcolor: '#fdf2f8', color: '#be185d', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                            Full Day (8:00 AM - 3:30 PM)
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => {
                              setAllocationForm({
                                wing: 'KINDERGARTEN',
                                grade: s.grade,
                                sectionName: s.name,
                                leadTeacher: s.leadTeacher,
                                assistantTeacher: s.assistantTeacher,
                                caregiverAyah: s.caregiverAyah,
                                shiftTiming: 'Full Day (8:00 AM - 3:30 PM)'
                              });
                              setIsAllocationOpen(true);
                            }}
                          >
                            Reassign
                          </Button>
                        </TableCell>
                      </TableRow>
                    )))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}

      {/* Daily Parent Handover Slip Dialog */}
      <Dialog open={isSlipOpen} onClose={() => setIsSlipOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>"My Day at Kindergarten" Parent Slip</span>
          <Button
            size="small"
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
          >
            Print Slip
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {selectedToddlerForSlip && (
            <Paper elevation={0} sx={{ p: 3, border: '2px dashed #f472b6', borderRadius: 3, bgcolor: '#fff5f7' }}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#be185d' }}>
                  🧸 FIC Global Academy - Early Years
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Daily Communication Report • Date: {new Date().toLocaleDateString('en-GB')}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#ffffff', borderRadius: 2, mb: 2 }}>
                <Avatar src={selectedToddlerForSlip.photoUrl} alt={selectedToddlerForSlip.name} sx={{ width: 56, height: 56 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedToddlerForSlip.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedToddlerForSlip.section} • Student ID: {selectedToddlerForSlip.id}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">MORNING SNACK</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                      {selectedToddlerForSlip.morningSnack}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">HOT LUNCH</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>
                      {selectedToddlerForSlip.lunch}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">AFTERNOON NAP</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#6366f1' }}>
                      {selectedToddlerForSlip.napStatus} ({selectedToddlerForSlip.napMinutes} mins)
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">GENERAL MOOD</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#ec4899' }}>
                      {selectedToddlerForSlip.mood}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">SENSORY PLAY TODAY</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      🎨 {selectedToddlerForSlip.sensoryActivity}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">TOILET ROUTINE</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      🚽 {selectedToddlerForSlip.toiletIndependence}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 1.5, bgcolor: '#fff1f2', borderRadius: 1.5, border: '1px solid #fecdd3' }}>
                    <Typography variant="caption" color="text.secondary">TEACHER'S NOTE TO PARENTS:</Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#9f1239', mt: 0.5 }}>
                      "{selectedToddlerForSlip.teacherNote}"
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: '1px dashed #f472b6' }}>
                <Typography variant="caption" color="text.secondary">
                  Class Lead Teacher Signature
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Parent / Guardian Acknowledgment
                </Typography>
              </Box>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsSlipOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Staff Allocation Modal */}
      <Dialog open={isAllocationOpen} onClose={() => setIsAllocationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Allocate Staff to Educational Wing & Class
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label="Educational Wing"
                value={allocationForm.wing}
                onChange={(e) => setAllocationForm({ ...allocationForm, wing: e.target.value })}
              >
                {WINGS_CONFIG.map(w => (
                  <MenuItem key={w.id} value={w.id}>{w.label}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Target Grade"
                value={allocationForm.grade}
                onChange={(e) => setAllocationForm({ ...allocationForm, grade: e.target.value })}
              >
                <MenuItem value="Pre-KG">Pre-KG (Ages 2.5 - 3.5)</MenuItem>
                <MenuItem value="LKG">LKG (Ages 3.5 - 4.5)</MenuItem>
                <MenuItem value="UKG">UKG (Ages 4.5 - 5.5)</MenuItem>
                <MenuItem value="Grade 1">Grade 1 (Primary)</MenuItem>
                <MenuItem value="Grade 6">Grade 6 (Secondary)</MenuItem>
                <MenuItem value="Grade 11">Grade 11 (Higher Secondary)</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Section / Classroom Name"
                value={allocationForm.sectionName}
                onChange={(e) => setAllocationForm({ ...allocationForm, sectionName: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Lead Educator / Class Teacher"
                value={allocationForm.leadTeacher}
                onChange={(e) => setAllocationForm({ ...allocationForm, leadTeacher: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Assistant Teacher / Co-Educator"
                value={allocationForm.assistantTeacher}
                onChange={(e) => setAllocationForm({ ...allocationForm, assistantTeacher: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Caregiver / Ayah (Washroom & Feeding Care)"
                value={allocationForm.caregiverAyah}
                onChange={(e) => setAllocationForm({ ...allocationForm, caregiverAyah: e.target.value })}
                helperText="Crucial for Kindergarten washroom safety and toddler meal assistance."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label="Duty Shift Timing"
                value={allocationForm.shiftTiming}
                onChange={(e) => setAllocationForm({ ...allocationForm, shiftTiming: e.target.value })}
              >
                <MenuItem value="Morning Half Day (8:00 AM - 12:30 PM)">Morning Half Day (8:00 AM - 12:30 PM)</MenuItem>
                <MenuItem value="Full Day (8:00 AM - 3:30 PM)">Full Day (8:00 AM - 3:30 PM)</MenuItem>
                <MenuItem value="Extended Daycare Shift (11:00 AM - 6:00 PM)">Extended Daycare Shift (11:00 AM - 6:00 PM)</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAllocationOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAllocation}
            sx={{ fontWeight: 700, px: 3 }}
          >
            Confirm Staff Allocation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KindergartenDashboard;
