import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Stepper, Step, StepLabel, Button, 
  Grid, TextField, MenuItem, Divider, CircularProgress, Alert,
  IconButton, Chip, Table, TableBody, TableCell, TableHead, TableRow,
  Card, CardContent
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import SchoolIcon from '@mui/icons-material/School';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import DescriptionIcon from '@mui/icons-material/Description';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { createStaff, getDepartments, getDesignations } from '../api/staff.api';
import api from '../../../core/api/axios';

const steps = ['Personal Info', 'Contact & Address', 'Employment', 'Qualifications & Experience', 'Documents', 'Review'];

interface Qualification {
  degree: string;
  institution: string;
  completionYear: number | string;
  gradeOrPercentage: string;
  specialization?: string;
}

interface Experience {
  organization: string;
  designation: string;
  yearsOfExperience: number | string;
  startDate: string;
  responsibilities?: string;
}

interface DocumentItem {
  documentType: string;
  fileName: string;
  fileUrl: string;
  remarks?: string;
}

const StaffOnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { currentBranch } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [depData, desData] = await Promise.all([getDepartments(), getDesignations()]);
        setDepartments(depData.filter((d: any) => d.status === 'ACTIVE'));
        setDesignations(desData.filter((d: any) => d.status === 'ACTIVE'));
      } catch (err) {
        console.error('Failed to load master data', err);
      }
    };
    fetchMasterData();
  }, []);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    nationality: 'Indian',
    mobile: '',
    email: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    currentAddress: '',
    employeeIdNumber: '',
    joiningDate: '',
    departmentId: '', 
    designation: '', 
    employmentType: 'Permanent',
    branchId: currentBranch?.id || currentBranch?._id || '', 
  });

  // Step 3 state: Qualifications & Experience
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [newQual, setNewQual] = useState<Qualification>({
    degree: '',
    institution: '',
    completionYear: new Date().getFullYear(),
    gradeOrPercentage: '',
    specialization: ''
  });

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExp, setNewExp] = useState<Experience>({
    organization: '',
    designation: '',
    yearsOfExperience: 1,
    startDate: '',
    responsibilities: ''
  });

  // Step 4 state: Documents
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [docType, setDocType] = useState('ID Proof');
  const [docRemarks, setDocRemarks] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddQualification = () => {
    if (!newQual.degree || !newQual.institution) {
      setError('Degree and Institution are required');
      return;
    }
    setError(null);
    setQualifications([...qualifications, newQual]);
    setNewQual({
      degree: '',
      institution: '',
      completionYear: new Date().getFullYear(),
      gradeOrPercentage: '',
      specialization: ''
    });
  };

  const handleRemoveQualification = (idx: number) => {
    setQualifications(qualifications.filter((_, i) => i !== idx));
  };

  const handleAddExperience = () => {
    if (!newExp.organization || !newExp.designation) {
      setError('Organization and Designation are required');
      return;
    }
    setError(null);
    setExperiences([...experiences, newExp]);
    setNewExp({
      organization: '',
      designation: '',
      yearsOfExperience: 1,
      startDate: '',
      responsibilities: ''
    });
  };

  const handleRemoveExperience = (idx: number) => {
    setExperiences(experiences.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocFile(e.target.files[0]);
    }
  };

  const handleAddDocument = () => {
    if (!docFile && !docRemarks) {
      setError('Please select a file to upload');
      return;
    }
    setError(null);
    const fileName = docFile ? docFile.name : `${docType}.pdf`;
    // Create preview or mock cloud storage URL
    const fileUrl = docFile ? URL.createObjectURL(docFile) : `https://docs.school-erp.edu/${docType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    setDocuments([...documents, {
      documentType: docType,
      fileName,
      fileUrl,
      remarks: docRemarks
    }]);

    setDocFile(null);
    setDocRemarks('');
  };

  const handleRemoveDocument = (idx: number) => {
    setDocuments(documents.filter((_, i) => i !== idx));
  };

  const handleNext = () => {
    setError(null);
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => prev - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : undefined,
        gender: formData.gender,
        nationality: formData.nationality,
        mobile: formData.mobile,
        email: formData.email,
        address: { current: formData.currentAddress },
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone
        },
        departmentId: formData.departmentId,
        designationId: formData.designation,
        employmentType: formData.employmentType,
        joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toISOString() : undefined,
        branchId: formData.branchId,
        createUserAccount: true,
        isTeacher: formData.designation === 'Teacher',
      };

      const res = await createStaff(payload);
      const employeeId = res.data?._id || res.data?.id || res._id;

      if (employeeId) {
        // Save qualifications
        for (const q of qualifications) {
          try {
            await api.post(`/hr/employees/${employeeId}/qualifications`, {
              degree: q.degree,
              institution: q.institution,
              completionYear: Number(q.completionYear) || new Date().getFullYear(),
              gradeOrPercentage: q.gradeOrPercentage || 'Passed',
              specialization: q.specialization || ''
            });
          } catch (e) {
            console.error('Failed to save qualification', e);
          }
        }

        // Save experience
        for (const exp of experiences) {
          try {
            await api.post(`/hr/employees/${employeeId}/experience`, {
              organization: exp.organization,
              designation: exp.designation,
              yearsOfExperience: Number(exp.yearsOfExperience) || 1,
              startDate: exp.startDate ? new Date(exp.startDate) : new Date(),
              responsibilities: exp.responsibilities || ''
            });
          } catch (e) {
            console.error('Failed to save experience', e);
          }
        }

        // Save documents
        for (const doc of documents) {
          try {
            await api.post(`/hr/employees/${employeeId}/documents`, {
              documentType: doc.documentType,
              fileUrl: doc.fileUrl,
              remarks: doc.remarks || ''
            });
          } catch (e) {
            console.error('Failed to save document', e);
          }
        }

        // Cache into local staff document vault for instant HR download & viewing
        try {
          const cachedStaffDocs = JSON.parse(localStorage.getItem('erp_staff_onboarded_documents') || '[]');
          cachedStaffDocs.push({
            employeeId,
            employeeName: `${formData.firstName} ${formData.lastName}`.trim(),
            employeeCode: formData.employeeIdNumber || 'EMP-' + Math.floor(1000 + Math.random() * 9000),
            department: departments.find(d => (d._id === formData.departmentId || d.id === formData.departmentId))?.name || 'Academics',
            designation: designations.find(d => (d._id === formData.designation || d.id === formData.designation))?.name || formData.designation || 'Staff',
            joiningDate: formData.joiningDate || new Date().toISOString(),
            documents: documents.map(d => ({
              ...d,
              uploadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              verificationStatus: 'PENDING'
            }))
          });
          localStorage.setItem('erp_staff_onboarded_documents', JSON.stringify(cachedStaffDocs));
        } catch (err) {
          console.warn('Local document sync error:', err);
        }
      }

      navigate('/admin/staff');
    } catch (err: any) {
      console.error(err);
      let errorMessage = err.response?.data?.message || 'Failed to onboard staff. Check all required fields.';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} size="small" required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Middle Name" name="middleName" value={formData.middleName} onChange={handleChange} size="small" />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} size="small" required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Date of Birth" 
                name="dateOfBirth" 
                type="date" 
                value={formData.dateOfBirth} 
                onChange={handleChange} 
                size="small" 
                slotProps={{ inputLabel: { shrink: true } }}
                InputLabelProps={{ shrink: true }} 
                sx={{
                  '& .MuiInputLabel-root': { bgcolor: 'background.paper', px: 0.5, borderRadius: 0.5 },
                  '& input[type="date"]': { minHeight: '1.4375em' }
                }}
                required 
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="Gender" name="gender" value={formData.gender} onChange={handleChange} size="small" required>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} size="small" required />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Mobile Phone" name="mobile" value={formData.mobile} onChange={handleChange} size="small" required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} size="small" required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Current Address" name="currentAddress" multiline rows={2} value={formData.currentAddress} onChange={handleChange} size="small" required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Emergency Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} size="small" required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Relationship" name="emergencyContactRelationship" value={formData.emergencyContactRelationship} onChange={handleChange} size="small" required />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Emergency Contact Phone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} size="small" required />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField 
                fullWidth 
                label="Joining Date" 
                name="joiningDate" 
                type="date" 
                value={formData.joiningDate} 
                onChange={handleChange} 
                size="small" 
                slotProps={{ inputLabel: { shrink: true } }}
                InputLabelProps={{ shrink: true }} 
                sx={{
                  '& .MuiInputLabel-root': { bgcolor: 'background.paper', px: 0.5, borderRadius: 0.5 },
                  '& input[type="date"]': { minHeight: '1.4375em' }
                }}
                required 
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="Department" name="departmentId" value={formData.departmentId} onChange={handleChange} size="small" required>
                <MenuItem value="">Select Department</MenuItem>
                {departments.map(d => <MenuItem key={d._id || d.id} value={d._id || d.id}>{d.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="Designation" name="designation" value={formData.designation} onChange={handleChange} size="small" required>
                <MenuItem value="">Select Designation</MenuItem>
                {designations.map(d => <MenuItem key={d._id || d.id} value={d._id || d.id}>{d.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="Employment Type" name="employmentType" value={formData.employmentType} onChange={handleChange} size="small" required>
                <MenuItem value="Permanent">Permanent</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
                <MenuItem value="Probation">Probation</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Box sx={{ py: 1 }}>
            {/* Educational Qualifications Section */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolIcon color="primary" /> Educational Qualifications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add degrees, certifications, and academic background.
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField 
                    fullWidth size="small" label="Degree / Diploma *" 
                    placeholder="e.g. B.Ed, M.Sc"
                    value={newQual.degree} 
                    onChange={e => setNewQual({ ...newQual, degree: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField 
                    fullWidth size="small" label="Institution / College *" 
                    placeholder="e.g. Delhi University"
                    value={newQual.institution} 
                    onChange={e => setNewQual({ ...newQual, institution: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField 
                    fullWidth size="small" label="Year Completed" 
                    type="number"
                    value={newQual.completionYear} 
                    onChange={e => setNewQual({ ...newQual, completionYear: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField 
                    fullWidth size="small" label="Grade / %" 
                    placeholder="e.g. 85%"
                    value={newQual.gradeOrPercentage} 
                    onChange={e => setNewQual({ ...newQual, gradeOrPercentage: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddQualification}
                    sx={{ height: 40, textTransform: 'none' }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {qualifications.length > 0 && (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Degree</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Institution</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Year</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {qualifications.map((q, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 600 }}>{q.degree}</TableCell>
                        <TableCell>{q.institution}</TableCell>
                        <TableCell>{q.completionYear}</TableCell>
                        <TableCell>{q.gradeOrPercentage || '—'}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => handleRemoveQualification(idx)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Experience Section */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkOutlineIcon color="primary" /> Prior Work Experience
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Add previous schools, organizations, and teaching history.
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField 
                    fullWidth size="small" label="Organization / School *" 
                    placeholder="e.g. St. Xavier's High School"
                    value={newExp.organization} 
                    onChange={e => setNewExp({ ...newExp, organization: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField 
                    fullWidth size="small" label="Designation / Role *" 
                    placeholder="e.g. Primary Teacher"
                    value={newExp.designation} 
                    onChange={e => setNewExp({ ...newExp, designation: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField 
                    fullWidth size="small" label="Experience (Years)" 
                    type="number"
                    value={newExp.yearsOfExperience} 
                    onChange={e => setNewExp({ ...newExp, yearsOfExperience: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button 
                    fullWidth 
                    variant="contained" 
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleAddExperience}
                    sx={{ height: 40, textTransform: 'none' }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {experiences.length > 0 && (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Organization</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Years</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {experiences.map((exp, idx) => (
                      <TableRow key={idx}>
                        <TableCell sx={{ fontWeight: 600 }}>{exp.organization}</TableCell>
                        <TableCell>{exp.designation}</TableCell>
                        <TableCell>{exp.yearsOfExperience} yrs</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" color="error" onClick={() => handleRemoveExperience(idx)}>
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );
      case 4:
        return (
          <Box sx={{ py: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionIcon color="primary" /> Onboarding Documents
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload mandatory identification proofs, certificates, and resumes.
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Document Type *"
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                  >
                    {['ID Proof', 'Resume', 'Degree Certificate', 'Experience Letter', 'Relieving Letter', 'PAN Card', 'Other'].map(t => (
                      <MenuItem key={t} value={t}>{t}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    sx={{ height: 40, textTransform: 'none', justifyContent: 'flex-start' }}
                  >
                    <Typography noWrap variant="body2">
                      {docFile ? docFile.name : 'Choose File...'}
                    </Typography>
                    <input type="file" hidden onChange={handleFileChange} />
                  </Button>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Remarks (Optional)"
                    placeholder="e.g. Verified copy"
                    value={docRemarks}
                    onChange={e => setDocRemarks(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddDocument}
                    sx={{ height: 40, textTransform: 'none' }}
                  >
                    Attach
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {documents.length > 0 ? (
              <Grid container spacing={2}>
                {documents.map((doc, idx) => (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '12px !important' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                          <CheckCircleIcon color="success" />
                          <Box sx={{ overflow: 'hidden' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                              {doc.fileName}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                              <Chip size="small" label={doc.documentType} color="primary" variant="outlined" />
                              {doc.remarks && <Typography variant="caption" color="text.secondary">{doc.remarks}</Typography>}
                            </Box>
                          </Box>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => handleRemoveDocument(idx)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4, border: '2px dashed #cbd5e1', borderRadius: 2 }}>
                <CloudUploadIcon sx={{ fontSize: 40, color: '#94a3b8', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No documents attached yet. Select a document type and click Choose File to attach.
                </Typography>
              </Box>
            )}
          </Box>
        );
      case 5:
        return (
          <Box sx={{ py: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Review & Complete Onboarding</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please review the registered details before submitting. An employee record and login credentials will be generated.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Personal Information</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>{formData.firstName} {formData.middleName} {formData.lastName}</Typography>
                  <Typography variant="body2" color="text.secondary">{formData.email} • {formData.mobile}</Typography>
                  <Typography variant="body2" color="text.secondary">{formData.gender} • {formData.nationality}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Employment Details</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {designations.find(d => (d._id || d.id) === formData.designation)?.name || 'Staff'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dept: {departments.find(d => (d._id || d.id) === formData.departmentId)?.name || 'General'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Type: {formData.employmentType} • Joining: {formData.joiningDate || 'Immediate'}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>{qualifications.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Qualifications Added</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 800 }}>{experiences.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Prior Experiences Added</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 800 }}>{documents.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Documents Attached</Typography>
                </Paper>
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 3, textAlign: 'left' }}>
                {error}
              </Alert>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 950, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Onboard New Staff</Typography>
        <Typography variant="body1" color="text.secondary">Follow the wizard to register an employee, qualifications, and documents.</Typography>
      </Box>

      {error && activeStep !== 5 && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 340 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button variant="contained" color="success" onClick={handleFinish} disableElevation disabled={loading} sx={{ px: 4, py: 1 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Onboarding'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext} disableElevation disabled={loading} sx={{ px: 3 }}>
              Next Step
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default StaffOnboardingWizard;
