import React, { useState, useEffect } from 'react';
import { 
  Box, Stepper, Step, StepLabel, Button, Typography, Paper, 
  FormControl, InputLabel, Select, MenuItem, Grid, CircularProgress, Alert
} from '@mui/material';
import { 
  getAcademicYears, getClasses, getSections, getEnrollments, bulkPromote 
} from '../api/academic.api';
import type { AcademicYear, ClassSummary, SectionSummary, EnrollmentSummary } from '../api/academic.api';

const steps = ['Select Source', 'Select Target', 'Preview & Validation', 'Confirm'];

const BulkPromotionWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  
  const [sourceYear, setSourceYear] = useState('');
  const [sourceClass, setSourceClass] = useState('');
  const [sourceSections, setSourceSections] = useState<SectionSummary[]>([]);
  const [sourceSection, setSourceSection] = useState('');
  
  const [targetYear, setTargetYear] = useState('');
  const [targetClass, setTargetClass] = useState('');
  const [targetSections, setTargetSections] = useState<SectionSummary[]>([]);
  const [targetSection, setTargetSection] = useState('');

  const [studentsToPromote, setStudentsToPromote] = useState<EnrollmentSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [years, cls] = await Promise.all([getAcademicYears(), getClasses()]);
        setAcademicYears(years);
        setClasses(cls);
      } catch (err) {
        console.error('Failed to load initial data', err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (sourceClass) {
      getSections(sourceClass).then(setSourceSections).catch(console.error);
    }
  }, [sourceClass]);

  useEffect(() => {
    if (targetClass) {
      getSections(targetClass).then(setTargetSections).catch(console.error);
    }
  }, [targetClass]);

  const handleNext = async () => {
    setError(null);
    if (activeStep === 1) {
      // Fetch students for preview
      setLoading(true);
      try {
        const enrollments = await getEnrollments(sourceYear, sourceSection);
        setStudentsToPromote(enrollments);
        if (enrollments.length === 0) {
          setError('No active students found in the source section.');
          setLoading(false);
          return;
        }
      } catch (err) {
        setError('Failed to fetch students.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const submitPromotion = async () => {
    setLoading(true);
    setError(null);
    try {
      await bulkPromote({
        studentIds: studentsToPromote.map(s => s.studentId._id),
        currentAcademicYearId: sourceYear,
        newAcademicYearId: targetYear,
        newClassId: targetClass,
        newSectionId: targetSection,
        remarks: 'Bulk promoted via Wizard'
      });
      setSuccess(true);
      setActiveStep(0);
      setSourceYear(''); setSourceClass(''); setSourceSection('');
      setTargetYear(''); setTargetClass(''); setTargetSection('');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to promote students');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step: number) => {
    switch(step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Current Academic Year</InputLabel>
                <Select value={sourceYear} onChange={(e) => setSourceYear(e.target.value as string)} label="Current Academic Year">
                  {academicYears.map(y => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth disabled={!sourceYear}>
                <InputLabel>Current Class</InputLabel>
                <Select value={sourceClass} onChange={(e) => setSourceClass(e.target.value as string)} label="Current Class">
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth disabled={!sourceClass}>
                <InputLabel>Current Section</InputLabel>
                <Select value={sourceSection} onChange={(e) => setSourceSection(e.target.value as string)} label="Current Section">
                  {sourceSections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Target Academic Year</InputLabel>
                <Select value={targetYear} onChange={(e) => setTargetYear(e.target.value as string)} label="Target Academic Year">
                  {academicYears.filter(y => y.id !== sourceYear).map(y => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth disabled={!targetYear}>
                <InputLabel>Target Class</InputLabel>
                <Select value={targetClass} onChange={(e) => setTargetClass(e.target.value as string)} label="Target Class">
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth disabled={!targetClass}>
                <InputLabel>Target Section</InputLabel>
                <Select value={targetSection} onChange={(e) => setTargetSection(e.target.value as string)} label="Target Section">
                  {targetSections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 2:
        return <Typography>Validation passed. {studentsToPromote.length} students ready for promotion.</Typography>;
      case 3:
        return <Typography>Confirm the bulk promotion. This action will generate new Academic Enrollments and mark existing ones as PROMOTED.</Typography>;
      default: return null;
    }
  };

  const isNextDisabled = () => {
    if (activeStep === 0) return !sourceYear || !sourceClass || !sourceSection;
    if (activeStep === 1) return !targetYear || !targetClass || !targetSection;
    return false;
  };

  return (
    <Box sx={{ p: 4, width: '100%' }}>
      <Typography variant="h4" gutterBottom>Bulk Promotion Wizard</Typography>
      
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>Successfully promoted students!</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>
      
      <Paper sx={{ p: 4 }}>
        {getStepContent(activeStep)}
        
        <Box sx={{ display: 'flex', mt: 4 }}>
          <Button disabled={activeStep === 0 || loading} onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
          <Box sx={{ flex: "1" }} />
          <Button 
            variant="contained" 
            onClick={activeStep === steps.length - 1 ? submitPromotion : handleNext}
            disabled={isNextDisabled() || loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : (activeStep === steps.length - 1 ? 'Execute Promotion' : 'Next')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default BulkPromotionWizard;
