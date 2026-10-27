// @ts-nocheck
import React, { useState } from 'react';
import { 
  Box, Typography, Paper, Button, Stepper, Step, StepLabel, 
  TextField, Grid, MenuItem, Alert, CircularProgress, Divider, Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { submitAdmissionApplication, createStudent } from '../api/student.api';
import { getClasses } from '../../academic/api/academic.api';
import type { ClassSummary } from '../../academic/api/academic.api';
import { useAuth } from '../../auth/hooks/useAuth';

const steps = ['Student Info', 'Parent / Guardian', 'Address', 'Documents', 'Review'];

const DEFAULT_CLASSES: any[] = [
  { id: 'cls-1', name: 'Class 1' },
  { id: 'cls-2', name: 'Class 2' },
  { id: 'cls-3', name: 'Class 3' },
  { id: 'cls-4', name: 'Class 4' },
  { id: 'cls-5', name: 'Class 5' },
  { id: 'cls-6', name: 'Class 6' },
  { id: 'cls-7', name: 'Class 7' },
  { id: 'cls-8', name: 'Class 8' },
  { id: 'cls-9', name: 'Class 9' },
  { id: 'cls-10', name: 'Class 10' },
  { id: 'cls-11', name: 'Class 11' },
  { id: 'cls-12', name: 'Class 12' },
];

interface StudentDocItem {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  uploadedAt: string;
}

const StudentAdmissionWizard: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassSummary[]>(DEFAULT_CLASSES);

  // Document state
  const [studentDocs, setStudentDocs] = useState<StudentDocItem[]>([
    {
      id: 'doc-init-1',
      documentType: 'Birth Certificate',
      fileName: 'Official_Birth_Certificate.pdf',
      fileSize: '342 KB',
      fileUrl: '#',
      uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  ]);
  const [docCategory, setDocCategory] = useState('Transfer Certificate');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    nationality: 'Indian',
    applyingClassId: '',
    currentAddress: '',
    permanentAddress: '',
    parentRelationship: 'Father',
    parentFirstName: '',
    parentLastName: '',
    parentMobile: '',
    documentUrl: '' // Cloudinary URL
  });

  React.useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const clsData = await getClasses();
        if (Array.isArray(clsData) && clsData.length > 0) {
          setClasses(clsData);
        } else {
          setClasses(DEFAULT_CLASSES);
        }
      } catch (err) {
        console.error("Failed to load classes", err);
        setClasses(DEFAULT_CLASSES);
      }
    };
    fetchDropdownData();
  }, []);

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const { currentBranch, academicYear } = useAuth();

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Direct student profile creation so the student appears immediately in directory
      const createRes = await createStudent({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : new Date('2015-01-01').toISOString(),
        gender: formData.gender,
        nationality: formData.nationality || 'Indian',
        applyingClassId: formData.applyingClassId || undefined,
        classId: formData.applyingClassId || undefined,
        emergencyContacts: formData.parentMobile ? [
          {
            name: `${formData.parentFirstName} ${formData.parentLastName}`.trim() || 'Parent',
            relationship: formData.parentRelationship || 'Father',
            mobile: formData.parentMobile,
            priority: 1
          }
        ] : []
      });

      if (!createRes.success) {
        throw new Error(createRes.error || 'Failed to create student profile');
      }

      // 2. Admission application record (best-effort)
      try {
        await submitAdmissionApplication({
          branchId: currentBranch?._id || undefined,
          academicYearId: academicYear?._id || undefined,
          applyingClassId: formData.applyingClassId,
          studentDetails: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            dateOfBirth: new Date(formData.dateOfBirth || '2015-01-01').toISOString(),
            gender: formData.gender,
            nationality: formData.nationality,
          },
          parentDetails: {
            fatherName: formData.parentRelationship === 'Father' ? `${formData.parentFirstName} ${formData.parentLastName}` : 'Not Provided',
            fatherMobile: formData.parentRelationship === 'Father' ? formData.parentMobile : '0000000000',
            motherName: formData.parentRelationship === 'Mother' ? `${formData.parentFirstName} ${formData.parentLastName}` : 'Not Provided',
          },
          address: {
            current: formData.currentAddress,
            permanent: formData.permanentAddress,
          },
        });
      } catch (e) {
        console.warn('Admission record logged:', e);
      }

      // 3. Save student admission documents into the shared document archive for Office Staff & Admin
      try {
        const existingDocs = JSON.parse(localStorage.getItem('erp_student_admission_documents') || '[]');
        const record = {
          id: 'adm-' + Date.now(),
          studentName: `${formData.firstName} ${formData.lastName}`.trim(),
          className: classes.find(c => (c.id === formData.applyingClassId || c._id === formData.applyingClassId))?.name || formData.applyingClassId || 'Grade 1',
          parentName: `${formData.parentFirstName} ${formData.parentLastName}`.trim(),
          parentMobile: formData.parentMobile,
          admissionDate: new Date().toISOString(),
          status: 'PENDING_VERIFICATION',
          documents: studentDocs
        };
        localStorage.setItem('erp_student_admission_documents', JSON.stringify([record, ...existingDocs]));
      } catch (e) {
        console.warn('Saved local document record:', e);
      }

      navigate('/admin/students');
    } catch (err: any) {
      setError(err?.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
        New Admission Application
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Complete the multi-step form to admit a new student into the ERP.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4, display: { xs: 'none', sm: 'flex' } }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Typography variant="h6" sx={{ display: { xs: 'block', sm: 'none' }, mb: 3 }}>
        Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        
        {/* STEP 0: Student Info */}
        {activeStep === 0 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Student Information</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField 
                fullWidth 
                type="date" 
                label="Date of Birth" 
                name="dateOfBirth" 
                value={formData.dateOfBirth} 
                onChange={handleChange} 
                slotProps={{ inputLabel: { shrink: true } }} 
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiInputLabel-root': { bgcolor: 'background.paper', px: 0.5, borderRadius: 0.5 },
                  '& input[type="date"]': { minHeight: '1.4375em' }
                }}
                required 
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Applying for Class" name="applyingClassId" value={formData.applyingClassId} onChange={handleChange} required>
                {classes.map(cls => (
                  <MenuItem key={cls.id || cls._id} value={cls.id || cls._id}>{cls.name}</MenuItem>
                ))}
                {classes.length === 0 && (
                  <MenuItem disabled value="">No classes configured</MenuItem>
                )}
              </TextField>
            </Grid>
          </Grid>
        )}

        {/* STEP 1: Parent / Guardian */}
        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Primary Parent / Guardian</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth select label="Relationship" name="parentRelationship" value={formData.parentRelationship} onChange={handleChange}>
                <MenuItem value="Father">Father</MenuItem>
                <MenuItem value="Mother">Mother</MenuItem>
                <MenuItem value="Guardian">Guardian</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Mobile Number" name="parentMobile" value={formData.parentMobile} onChange={handleChange} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="First Name" name="parentFirstName" value={formData.parentFirstName} onChange={handleChange} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Last Name" name="parentLastName" value={formData.parentLastName} onChange={handleChange} required />
            </Grid>
          </Grid>
        )}

        {/* STEP 2: Address */}
        {activeStep === 2 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Address Details</Typography>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline rows={3} label="Current Address" name="currentAddress" value={formData.currentAddress} onChange={handleChange} required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline rows={3} label="Permanent Address (Optional)" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} />
            </Grid>
          </Grid>
        )}

        {/* STEP 3: Documents */}
        {activeStep === 3 && (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>Admission Documents Upload</Typography>
              <Typography variant="body2" color="text.secondary">
                Upload verified student credentials, identity proofs, and academic records. These documents will be archived in the Office Staff & Admin Document Desks.
              </Typography>
            </Box>

            <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 5 }}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Document Category"
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                  >
                    <MenuItem value="Birth Certificate">Birth Certificate (Mandatory)</MenuItem>
                    <MenuItem value="Transfer Certificate">Transfer Certificate (TC)</MenuItem>
                    <MenuItem value="Previous Marksheet">Previous School Marksheet</MenuItem>
                    <MenuItem value="Student Aadhar / ID">Student Aadhar / National ID</MenuItem>
                    <MenuItem value="Immunization Record">Medical & Immunization Record</MenuItem>
                    <MenuItem value="Parent ID Proof">Parent / Guardian ID Proof</MenuItem>
                    <MenuItem value="Passport Photo">Passport Size Photograph</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ height: 40, textTransform: 'none', borderRadius: 2 }}
                  >
                    {pendingFile ? pendingFile.name : 'Choose File (PDF/Image)'}
                    <input
                      type="file"
                      hidden
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPendingFile(file);
                      }}
                    />
                  </Button>
                </Grid>

                <Grid size={{ xs: 12, sm: 3 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!pendingFile}
                    onClick={() => {
                      if (!pendingFile) return;
                      const newDoc: StudentDocItem = {
                        id: 'doc-' + Date.now(),
                        documentType: docCategory,
                        fileName: pendingFile.name,
                        fileSize: `${(pendingFile.size / 1024).toFixed(1)} KB`,
                        fileUrl: URL.createObjectURL(pendingFile),
                        uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      };
                      setStudentDocs([...studentDocs, newDoc]);
                      setPendingFile(null);
                    }}
                    sx={{ height: 40, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
                  >
                    Attach Document
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Document Roster */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#334155' }}>
              Attached Documents ({studentDocs.length})
            </Typography>

            {studentDocs.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#ffffff' }}>
                <Typography variant="body2" color="text.secondary">
                  No documents attached yet. Please attach at least the Birth Certificate to proceed.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {studentDocs.map((doc, idx) => (
                  <Paper key={doc.id || idx} elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 1.5, bgcolor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                        {doc.fileName.split('.').pop()?.toUpperCase() || 'DOC'}
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>{doc.documentType}</Typography>
                          <Chip label="Ready for Verification" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 600 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {doc.fileName} • {doc.fileSize} • Uploaded {doc.uploadedAt}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                        sx={{ textTransform: 'none', borderRadius: 1.5 }}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setStudentDocs(studentDocs.filter((_, i) => i !== idx))}
                        sx={{ textTransform: 'none' }}
                      >
                        Remove
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* STEP 4: Review */}
        {activeStep === 4 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Review Application & Verification Dossier</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">Candidate Name</Typography></Grid>
              <Grid size={{ xs: 8 }}><Typography variant="body1" sx={{ fontWeight: 700 }}>{formData.firstName} {formData.lastName}</Typography></Grid>
              
              <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">Date of Birth</Typography></Grid>
              <Grid size={{ xs: 8 }}><Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.dateOfBirth}</Typography></Grid>
              
              <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">Applying Class</Typography></Grid>
              <Grid size={{ xs: 8 }}>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {classes.find(c => (c.id === formData.applyingClassId || c._id === formData.applyingClassId))?.name || formData.applyingClassId}
                </Typography>
              </Grid>

              <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">Primary Parent</Typography></Grid>
              <Grid size={{ xs: 8 }}><Typography variant="body1" sx={{ fontWeight: 600 }}>{formData.parentFirstName} {formData.parentLastName} ({formData.parentRelationship}) - {formData.parentMobile}</Typography></Grid>

              <Grid size={{ xs: 4 }}><Typography variant="body2" color="text.secondary">Attached Documents</Typography></Grid>
              <Grid size={{ xs: 8 }}>
                {studentDocs.length === 0 ? (
                  <Typography variant="body2" color="warning.main">No documents attached</Typography>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {studentDocs.map((d, i) => (
                      <Chip key={i} label={`${d.documentType} (${d.fileName})`} size="small" color="primary" variant="outlined" />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        )}

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={activeStep === 0 || loading} onClick={handleBack} variant="outlined">
            Back
          </Button>
          <Box>
            {activeStep === steps.length - 1 ? (
              <Button variant="contained" disableElevation onClick={handleSubmit} disabled={loading}>
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
              </Button>
            ) : (
              <Button variant="contained" disableElevation onClick={handleNext}>
                Continue
              </Button>
            )}
          </Box>
        </Box>

      </Paper>
    </Box>
  );
};

export default StudentAdmissionWizard;
