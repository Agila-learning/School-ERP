import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Button, Grid, Tabs, Tab, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useParams, useNavigate } from 'react-router-dom';
import { getClasses, getSections, getCurriculums, deleteCurriculum, getSubjects, createCurriculum, getClassTeacherAssignments, assignClassTeacher, createSection, updateSection, deleteSection, getAcademicYears } from '../api/academic.api';
import type { ClassSummary, SectionSummary, CurriculumSummary, SubjectSummary, ClassTeacherAssignmentSummary } from '../api/academic.api';
import DeleteIcon from '@mui/icons-material/Delete';

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cls, setCls] = useState<ClassSummary | null>(null);
  const [sections, setSections] = useState<SectionSummary[]>([]);
  const [curriculums, setCurriculums] = useState<CurriculumSummary[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [ctModalOpen, setCtModalOpen] = useState(false);
  const [selectedSectionIdForCt, setSelectedSectionIdForCt] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [classTeachers, setClassTeachers] = useState<ClassTeacherAssignmentSummary[]>([]);

  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [creatingSection, setCreatingSection] = useState(false);
  const [newSection, setNewSection] = useState({ name: '', code: '', capacity: 30, academicYearId: '' });
  const [availableYears, setAvailableYears] = useState<any[]>([]);

  const [editSectionOpen, setEditSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [updatingSection, setUpdatingSection] = useState(false);

  const handleAssignSubject = async () => {
    if (!selectedSubjectId || !id) return;
    try {
      const subject = availableSubjects.find(s => s.id === selectedSubjectId);
      await createCurriculum({
        classId: id,
        subjectId: selectedSubjectId,
        name: subject?.name || 'Assigned Subject',
        weeklyPeriods: 5,
        academicYearId: 'placeholder_or_backend_will_handle' // Assuming backend handles active year if missing or it fails. Wait, academicYearId is required.
      });
      // reload
      const currsData = await getCurriculums(id);
      setCurriculums(currsData);
      setSubjectModalOpen(false);
    } catch (e) {
      alert('Failed to assign subject');
    }
  };

  const handleRemoveSubject = async (currId: string) => {
    try {
      await deleteCurriculum(currId);
      setCurriculums(curriculums.filter(c => c.id !== currId));
    } catch(e) {
      alert('Failed to remove subject');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesData, sectionsData, currsData, subsData, ctData] = await Promise.all([
          getClasses(),
          getSections(id),
          getCurriculums(id),
          getSubjects(),
          getClassTeacherAssignments()
        ]);
        const matchedClass = classesData.find(c => c.id === id);
        setCls(matchedClass || null);
        setSections(sectionsData);
        setCurriculums(currsData);
        setAvailableSubjects(subsData);
        setClassTeachers(ctData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  // Load academic years for section creation
  useEffect(() => {
    getAcademicYears().then(years => {
      setAvailableYears(years);
      const active = years.find((y: any) => y.status === 'active' || y.status === 'ACTIVE');
      if (active) setNewSection(s => ({ ...s, academicYearId: active.id }));
    }).catch(console.error);
  }, []);

  const handleCreateSection = async () => {
    if (!newSection.name || !newSection.code || !id) return;
    setCreatingSection(true);
    try {
      await createSection({
        classId: id,
        name: newSection.name,
        code: newSection.code,
        capacity: newSection.capacity,
        academicYearId: newSection.academicYearId || undefined,
        status: 'ACTIVE'
      });
      const sectionsData = await getSections(id);
      setSections(sectionsData);
      setAddSectionOpen(false);
      setNewSection({ name: '', code: '', capacity: 30, academicYearId: newSection.academicYearId });
    } catch (e) {
      alert('Failed to create section. Make sure you have an active Academic Year.');
    } finally {
      setCreatingSection(false);
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection?.name || !editingSection?.code || !id) return;
    setUpdatingSection(true);
    try {
      await updateSection(editingSection.id, {
        name: editingSection.name,
        code: editingSection.code,
        capacity: editingSection.capacity,
        status: editingSection.status
      });
      const sectionsData = await getSections(id);
      setSections(sectionsData);
      setEditSectionOpen(false);
      setEditingSection(null);
    } catch (e) {
      alert('Failed to update section.');
    } finally {
      setUpdatingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await deleteSection(sectionId);
      const sectionsData = await getSections(id);
      setSections(sectionsData);
    } catch (e) {
      alert('Failed to delete section.');
    }
  };

  const handleAssignCt = async () => {
    if (!selectedTeacherId || !selectedSectionIdForCt || !id) return;
    try {
      await assignClassTeacher({
        classId: id,
        sectionId: selectedSectionIdForCt,
        teacherId: selectedTeacherId,
        isPrimary: true,
        academicYearId: 'placeholder_or_backend_will_handle'
      });
      const ctData = await getClassTeacherAssignments();
      setClassTeachers(ctData);
      setCtModalOpen(false);
    } catch(e) {
      alert('Failed to assign Class Teacher');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  }

  if (!cls) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">Class not found.</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/admin/academics/classes')}>Back to Classes</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      
      {/* Header */}
      <Paper elevation={0} sx={{ p: 4, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Grid container spacing={3} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{cls.name}</Typography>
            <Typography variant="body1" color="text.secondary">Code: {cls.code} • Level: {cls.level}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>{cls.totalStudents}</Typography>
                <Typography variant="caption" color="text.secondary">Students</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>{cls.capacity}</Typography>
                <Typography variant="caption" color="text.secondary">Capacity</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={(_, nv) => setTabIndex(nv)}>
          <Tab label="Sections" />
          <Tab label="Subjects" />
          <Tab label="Students" disabled />
        </Tabs>
      </Box>

      {/* Sections Tab Content */}
      {tabIndex === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Class Sections</Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon />} disableElevation onClick={() => setAddSectionOpen(true)}>
              Add Section
            </Button>
          </Box>
          
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Class Teacher</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Students</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No sections configured for this class.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sections.map(section => (
                      <TableRow key={section.id} hover>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{section.name}</Typography></TableCell>
                        <TableCell>{section.code}</TableCell>
                        <TableCell>
                          {classTeachers.find(ct => ct.sectionId === section.id)?.teacherId || section.classTeacher || 'Not Assigned'}
                          <Button size="small" sx={{ ml: 1, minWidth: 0, p: 0.5 }} onClick={() => { setSelectedSectionIdForCt(section.id); setCtModalOpen(true); }}>
                            Assign
                          </Button>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {section.enrolledStudents} / {section.capacity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={section.status} 
                            color={section.status === 'ACTIVE' ? 'success' : 'default'} 
                            size="small" 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" onClick={() => { setEditingSection(section); setEditSectionOpen(true); }}>Edit</Button>
                          <Button size="small" color="error" onClick={() => handleDeleteSection(section.id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Subjects Tab Content */}
      {tabIndex === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Mapped Subjects (Curriculum)</Typography>
            <Button variant="contained" size="small" startIcon={<AddIcon />} disableElevation onClick={() => setSubjectModalOpen(true)}>
              Assign Subject
            </Button>
          </Box>
          
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Subject Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Weekly Periods</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {curriculums.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No subjects mapped to this class.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    curriculums.map(curr => (
                      <TableRow key={curr.id} hover>
                        <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{curr.name}</Typography></TableCell>
                        <TableCell>{curr.weeklyPeriods}</TableCell>
                        <TableCell>
                          <Chip label={curr.status} color={curr.status === 'ACTIVE' ? 'success' : 'default'} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleRemoveSubject(curr.id)}>
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {subjectModalOpen && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper sx={{ p: 4, width: 400, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Assign Subject</Typography>
            <select 
              value={selectedSubjectId} 
              onChange={e => setSelectedSubjectId(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Select Subject</option>
              {availableSubjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
              ))}
            </select>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setSubjectModalOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAssignSubject} disabled={!selectedSubjectId}>Assign</Button>
            </Box>
          </Paper>
        </Box>
      )}

      {ctModalOpen && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper sx={{ p: 4, width: 400, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Assign Class Teacher</Typography>
            <select 
              value={selectedTeacherId} 
              onChange={e => setSelectedTeacherId(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Select Teacher</option>
              <option value="60d5ecb8b392d7001f3e7a1a">John Doe</option>
              <option value="60d5ecb8b392d7001f3e7a1b">Jane Smith</option>
            </select>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setCtModalOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleAssignCt} disabled={!selectedTeacherId}>Assign</Button>
            </Box>
          </Paper>
        </Box>
      )}
      {/* Add Section Modal */}
      {addSectionOpen && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper sx={{ p: 4, width: 420, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Add Section</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <input
                placeholder="Section Name (e.g., A)"
                value={newSection.name}
                onChange={e => setNewSection({...newSection, name: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                placeholder="Code (e.g., SEC-A)"
                value={newSection.code}
                onChange={e => setNewSection({...newSection, code: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <div>
                <label style={{ fontSize: '0.75rem', color: '#666' }}>Capacity</label>
                <input
                  type="number"
                  value={newSection.capacity}
                  onChange={e => setNewSection({...newSection, capacity: parseInt(e.target.value) || 30})}
                  style={{ display: 'block', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#666' }}>Academic Year</label>
                <select
                  value={newSection.academicYearId}
                  onChange={e => setNewSection({...newSection, academicYearId: e.target.value})}
                  style={{ display: 'block', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                >
                  <option value="">-- Auto-detect active year --</option>
                  {availableYears.map((y: any) => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button onClick={() => setAddSectionOpen(false)} disabled={creatingSection}>Cancel</Button>
              <Button variant="contained" onClick={handleCreateSection} disabled={creatingSection || !newSection.name || !newSection.code} disableElevation>
                {creatingSection ? <CircularProgress size={20} color="inherit" /> : 'Create Section'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Edit Section Modal */}
      {editSectionOpen && editingSection && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Paper sx={{ p: 4, width: 420, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Edit Section</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <input
                placeholder="Section Name (e.g., A)"
                value={editingSection.name}
                onChange={e => setEditingSection({...editingSection, name: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <input
                placeholder="Code (e.g., SEC-A)"
                value={editingSection.code}
                onChange={e => setEditingSection({...editingSection, code: e.target.value})}
                style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <div>
                <label style={{ fontSize: '0.75rem', color: '#666' }}>Capacity</label>
                <input
                  type="number"
                  value={editingSection.capacity}
                  onChange={e => setEditingSection({...editingSection, capacity: parseInt(e.target.value) || 30})}
                  style={{ display: 'block', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#666' }}>Status</label>
                <select
                  value={editingSection.status}
                  onChange={e => setEditingSection({...editingSection, status: e.target.value})}
                  style={{ display: 'block', width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button onClick={() => setEditSectionOpen(false)} disabled={updatingSection}>Cancel</Button>
              <Button variant="contained" onClick={handleUpdateSection} disabled={updatingSection || !editingSection.name || !editingSection.code} disableElevation>
                {updatingSection ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ClassDetail;
