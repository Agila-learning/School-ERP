import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, Divider,
  InputAdornment, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Alert
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ScienceIcon from '@mui/icons-material/Science';
import ComputerIcon from '@mui/icons-material/Computer';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import PrintIcon from '@mui/icons-material/Print';
import DocumentPreviewModal, { type DocumentPreviewData } from '../../documents/components/DocumentPreviewModal';

export type PracticalObservation = {
  id: string;
  title: string;
  labSubject: 'Physics' | 'Chemistry' | 'Biology' | 'Microbiology' | 'Computer Science';
  streamGroup: string;
  className: string;
  postedDate: string;
  submissionDueDate: string;
  postedByTeacher: string;
  format: 'WORD' | 'PDF';
  fileName: string;
  fileSize: string;
  fileUrl: string;
  aim: string;
  apparatusRequired: string;
  formula: string;
  status: 'PUBLISHED' | 'DRAFT';
};

export const PracticalObservation = {};

export const DEFAULT_OBSERVATIONS: PracticalObservation[] = [
  {
    id: 'obs-01',
    title: 'Experiment 04: Verification of Focal Length of Concave Mirror via u-v Method',
    labSubject: 'Physics',
    streamGroup: 'Group 101 & 102: Maths-Bio & Maths-CS',
    className: 'Grade 12',
    postedDate: '2026-10-16',
    submissionDueDate: '2026-10-25',
    postedByTeacher: 'Dr. P. Sundaram (PGT Physics & Lab Incharge)',
    format: 'PDF',
    fileName: 'Physics_Practical_Exp4_ConcaveMirror.pdf',
    fileSize: '1.2 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    aim: 'To determine the focal length of a concave mirror by finding the value of v for different values of u and plotting 1/u vs 1/v graph.',
    apparatusRequired: 'Concave mirror, optical bench with four uprights, pin, half-metre scale, spirit level.',
    formula: '1/f = 1/v + 1/u  =>  f = (u * v) / (u + v)',
    status: 'PUBLISHED'
  },
  {
    id: 'obs-02',
    title: 'Experiment 06: Acid-Base Volumetric Titration — KMnO4 vs Oxalic Acid',
    labSubject: 'Chemistry',
    streamGroup: 'Group 101, 102 & 103 (Science Streams)',
    className: 'Grade 12',
    postedDate: '2026-10-15',
    submissionDueDate: '2026-10-24',
    postedByTeacher: 'Mrs. Jayashree Raman (PGT Chemistry & Lab Coordinator)',
    format: 'WORD',
    fileName: 'Chemistry_Exp6_Titration_Observation.docx',
    fileSize: '840 KB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    aim: 'To prepare 250 mL of 0.05 M oxalic acid solution and determine molarity & strength of supplied potassium permanganate.',
    apparatusRequired: 'Burette 50ml, Pipette 20ml, Conical flask 250ml, chemical balance, burette stand, bunsen burner.',
    formula: '2 KMnO4 + 3 H2SO4 + 5 (COOH)2 -> K2SO4 + 2 MnSO4 + 8 H2O + 10 CO2',
    status: 'PUBLISHED'
  },
  {
    id: 'obs-03',
    title: 'Experiment 05: Bacterial Smear Preparation & Gram Staining Technique',
    labSubject: 'Microbiology',
    streamGroup: 'Group 103: Pure Science / Microbiology',
    className: 'Grade 12',
    postedDate: '2026-10-18',
    submissionDueDate: '2026-10-28',
    postedByTeacher: 'Dr. Savitha Nair (Microbiology Dept)',
    format: 'PDF',
    fileName: 'Microbiology_Exp5_Gram_Staining_Guide.pdf',
    fileSize: '2.1 MB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    aim: 'To differentiate bacterial species into Gram-positive and Gram-negative by cell wall peptidoglycan staining.',
    apparatusRequired: 'Compound light microscope, inoculating loop, crystal violet, iodine solution, safranin, ethanol.',
    formula: 'Gram positive (purple/blue), Gram negative (pink/red)',
    status: 'PUBLISHED'
  },
  {
    id: 'obs-04',
    title: 'Experiment 07: Implementation of Binary Search Tree & Graph Traversals in C++',
    labSubject: 'Computer Science',
    streamGroup: 'Group 102 & 104 (Computer Science Streams)',
    className: 'Grade 12',
    postedDate: '2026-10-19',
    submissionDueDate: '2026-10-29',
    postedByTeacher: 'Mr. Arvind Krishnan (PGT Computer Science & System Head)',
    format: 'WORD',
    fileName: 'CS_Practical_Exp7_BST_Traversal.docx',
    fileSize: '760 KB',
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    aim: 'To design a C++ program implementing dynamic memory nodes for Binary Search Tree insertion, deletion, and inorder traversal.',
    apparatusRequired: 'Linux workstation, GCC compiler / Visual Studio Code, GDB debugger.',
    formula: 'Time Complexity: Average O(log N), Worst O(N). Space Complexity: O(H)',
    status: 'PUBLISHED'
  }
];

export const getStoredObservations = (): PracticalObservation[] => {
  try {
    const raw = localStorage.getItem('erp_lab_observations');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  localStorage.setItem('erp_lab_observations', JSON.stringify(DEFAULT_OBSERVATIONS));
  return DEFAULT_OBSERVATIONS;
};

export const saveStoredObservations = (obs: PracticalObservation[]) => {
  localStorage.setItem('erp_lab_observations', JSON.stringify(obs));
  window.dispatchEvent(new Event('observations_updated'));
};

export const LabObservationsDesk: React.FC = () => {
  const [observations, setObservations] = useState<PracticalObservation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewDetailModal, setViewDetailModal] = useState<PracticalObservation | null>(null);

  // In-app document preview
  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewData | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    labSubject: 'Physics' as PracticalObservation['labSubject'],
    streamGroup: 'Group 101 & 102: Maths-Bio & Maths-CS',
    className: 'Grade 12',
    submissionDueDate: '2026-11-10',
    postedByTeacher: 'Subject Teacher & Lab Incharge',
    format: 'PDF' as 'PDF' | 'WORD',
    aim: '',
    apparatusRequired: '',
    formula: '',
    fileName: ''
  });

  useEffect(() => {
    setObservations(getStoredObservations());
  }, []);

  const filtered = observations.filter(o => {
    const matchesSearch = o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.aim.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.postedByTeacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'ALL' ? true : o.labSubject === subjectFilter;
    return matchesSearch && matchesSubject;
  });

  const handleDownload = (obs: PracticalObservation) => {
    const anchor = document.createElement('a');
    anchor.href = obs.fileUrl;
    anchor.download = obs.fileName;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleCreateObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.aim) return;

    const extension = formData.format === 'PDF' ? '.pdf' : '.docx';
    const computedFileName = formData.fileName || `${formData.title.replace(/\s+/g, '_').slice(0, 30)}${extension}`;

    const newObs: PracticalObservation = {
      id: 'obs-' + Date.now(),
      title: formData.title,
      labSubject: formData.labSubject,
      streamGroup: formData.streamGroup,
      className: formData.className,
      postedDate: new Date().toISOString().split('T')[0],
      submissionDueDate: formData.submissionDueDate,
      postedByTeacher: formData.postedByTeacher,
      format: formData.format,
      fileName: computedFileName,
      fileSize: formData.format === 'PDF' ? '1.4 MB' : '920 KB',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      aim: formData.aim,
      apparatusRequired: formData.apparatusRequired || 'Standard Laboratory Kit & Workstation',
      formula: formData.formula || 'As specified in Board Practical Syllabus',
      status: 'PUBLISHED'
    };

    const updated = [newObs, ...observations];
    setObservations(updated);
    saveStoredObservations(updated);
    setCreateModalOpen(false);
    setFormData({
      title: '',
      labSubject: 'Physics',
      streamGroup: 'Group 101 & 102: Maths-Bio & Maths-CS',
      className: 'Grade 12',
      submissionDueDate: '2026-11-10',
      postedByTeacher: 'Subject Teacher & Lab Incharge',
      format: 'PDF',
      aim: '',
      apparatusRequired: '',
      formula: '',
      fileName: ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this observation document?')) {
      const updated = observations.filter(o => o.id !== id);
      setObservations(updated);
      saveStoredObservations(updated);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Action Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Practical Observations & Teacher Manuals Desk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Subject teachers & lab staff can upload observations as Word (.docx) or PDF (.pdf) for respective class students to view and download.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
          sx={{
            borderRadius: 2.5,
            bgcolor: '#0f766e',
            fontWeight: 700,
            textTransform: 'none',
            px: 3,
            '&:hover': { bgcolor: '#115e59' }
          }}
        >
          Post Practical Observation
        </Button>
      </Box>

      {/* Filter Row */}
      <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search practical by title, experiment aim, or teacher name..."
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

          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Laboratory Subject"
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            >
              <MenuItem value="ALL">All Laboratories</MenuItem>
              <MenuItem value="Physics">Physics Lab</MenuItem>
              <MenuItem value="Chemistry">Chemistry Lab</MenuItem>
              <MenuItem value="Biology">Biology Lab</MenuItem>
              <MenuItem value="Microbiology">Microbiology Lab</MenuItem>
              <MenuItem value="Computer Science">Computer Science Lab</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Observations Grid */}
      <Grid container spacing={2.5}>
        {filtered.map(obs => {
          const isPdf = obs.format === 'PDF';

          return (
            <Grid size={{ xs: 12, md: 6 }} key={obs.id}>
              <Card
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  border: '1px solid #e2e8f0',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#0f766e',
                    boxShadow: '0 8px 20px -4px rgba(15, 118, 110, 0.15)'
                  }
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip
                        label={obs.labSubject}
                        size="small"
                        sx={{ fontWeight: 800, bgcolor: '#ccfbf1', color: '#0f766e' }}
                      />
                      <Chip
                        label={obs.format === 'PDF' ? 'PDF Document' : 'Word Document (.docx)'}
                        size="small"
                        icon={isPdf ? <PictureAsPdfIcon fontSize="small" /> : <DescriptionIcon fontSize="small" />}
                        sx={{ fontWeight: 700, bgcolor: isPdf ? '#fee2e2' : '#e0e7ff', color: isPdf ? '#991b1b' : '#3730a3' }}
                      />
                    </Box>

                    <Chip
                      label="Live on Student Portal"
                      size="small"
                      color="success"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                    />
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                    {obs.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#475569', mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    <strong>Aim:</strong> {obs.aim}
                  </Typography>

                  <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 2, border: '1px solid #f1f5f9', mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 0.5 }}>
                      <strong>Target:</strong> {obs.className} • {obs.streamGroup}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      <strong>Formula / Rule:</strong> {obs.formula}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <span>By: <strong>{obs.postedByTeacher}</strong></span>
                    <span>Due: <strong>{obs.submissionDueDate}</strong></span>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon fontSize="small" />}
                      onClick={() => setPreviewDoc({
                        id: obs.id,
                        documentType: `Practical Observation (${obs.labSubject})`,
                        fileName: obs.fileName,
                        fileUrl: obs.fileUrl,
                        fileSize: obs.fileSize,
                        uploadDate: obs.postedDate,
                        verificationStatus: 'VERIFIED',
                        ownerName: obs.postedByTeacher,
                        ownerRole: `${obs.className} • ${obs.streamGroup}`,
                        ownerId: `Exp Due: ${obs.submissionDueDate}`,
                        remarks: `AIM: ${obs.aim}\n\nAPPARATUS: ${obs.apparatusRequired}\n\nFORMULA: ${obs.formula}`,
                        verifiedBy: 'Senior Laboratory Faculty & Academic Head'
                      })}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#0f766e', bgcolor: '#ccfbf1', '&:hover': { bgcolor: '#99f6e4' } }}
                    >
                      View
                    </Button>

                    <Button
                      size="small"
                      startIcon={<FileDownloadIcon fontSize="small" />}
                      onClick={() => handleDownload(obs)}
                      sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', color: '#2563eb' }}
                    >
                      Download ({obs.fileSize})
                    </Button>
                  </Box>

                  <IconButton size="small" color="error" onClick={() => handleDelete(obs.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* CREATE PRACTICAL OBSERVATION MODAL */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5 } }}
      >
        <form onSubmit={handleCreateObservation}>
          <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #e2e8f0' }}>
            Publish Practical Observation & Student Laboratory Manual
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Experiment Title / Heading"
                  placeholder="e.g. Experiment 05: Verification of Focal Length of Concave Mirror"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Laboratory Discipline"
                  value={formData.labSubject}
                  onChange={e => setFormData({ ...formData, labSubject: e.target.value as any })}
                >
                  <MenuItem value="Physics">Physics Laboratory</MenuItem>
                  <MenuItem value="Chemistry">Chemistry Laboratory</MenuItem>
                  <MenuItem value="Biology">Biology Laboratory</MenuItem>
                  <MenuItem value="Microbiology">Microbiology Laboratory</MenuItem>
                  <MenuItem value="Computer Science">Computer Science Laboratory</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Target Higher Secondary Stream"
                  value={formData.streamGroup}
                  onChange={e => setFormData({ ...formData, streamGroup: e.target.value })}
                >
                  <MenuItem value="Group 101 & 102: Maths-Bio & Maths-CS">Group 101 & 102: Maths-Bio & Maths-CS</MenuItem>
                  <MenuItem value="Group 103: Pure Science / Microbiology">Group 103: Pure Science / Microbiology</MenuItem>
                  <MenuItem value="Group 104: Commerce & Computer Applications">Group 104: Commerce & CS</MenuItem>
                  <MenuItem value="All Senior Secondary Science Students">All Senior Secondary Science Students</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  select
                  fullWidth
                  label="Document Format"
                  value={formData.format}
                  onChange={e => setFormData({ ...formData, format: e.target.value as any })}
                >
                  <MenuItem value="PDF">PDF (.pdf document)</MenuItem>
                  <MenuItem value="WORD">Word (.docx document)</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  type="date"
                  fullWidth
                  label="Practical Submission Deadline"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData.submissionDueDate}
                  onChange={e => setFormData({ ...formData, submissionDueDate: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Author / Subject Teacher"
                  value={formData.postedByTeacher}
                  onChange={e => setFormData({ ...formData, postedByTeacher: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Aim of Experiment"
                  placeholder="State the objective, hypothesis, and parameters to be verified..."
                  value={formData.aim}
                  onChange={e => setFormData({ ...formData, aim: e.target.value })}
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Apparatus Required"
                  placeholder="List tools, optical components, chemical reagents, or software tools..."
                  value={formData.apparatusRequired}
                  onChange={e => setFormData({ ...formData, apparatusRequired: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Formulae & Governing Principles"
                  placeholder="e.g. 1/f = 1/v + 1/u or Reaction stoichiometry..."
                  value={formData.formula}
                  onChange={e => setFormData({ ...formData, formula: e.target.value })}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Attached File Name (Word or PDF)"
                  placeholder="e.g. Physics_Lab_Observation_Mirror.pdf"
                  value={formData.fileName}
                  onChange={e => setFormData({ ...formData, fileName: e.target.value })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <UploadFileIcon sx={{ color: '#0f766e' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#0f766e', fontWeight: 700, textTransform: 'none', px: 3 }}>
              Publish to Student Dashboards
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* In-App Document Preview Modal */}
      <DocumentPreviewModal
        open={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </Box>
  );
};

export default LabObservationsDesk;
