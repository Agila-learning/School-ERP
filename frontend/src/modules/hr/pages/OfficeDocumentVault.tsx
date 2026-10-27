import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Chip, IconButton, Tooltip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, Divider,
  Avatar, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import SchoolIcon from '@mui/icons-material/School';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { useNavigate } from 'react-router-dom';
import Layout from '../../../core/components/Layout';
import { getClasses } from '../../academic/api/academic.api';
import { 
  getStudentDocuments, 
  createStudentDocument, 
  updateStudentDocument, 
  deleteStudentDocument 
} from '../../students/api/student.api';
import DocumentPreviewModal, { type DocumentPreviewData } from '../../documents/components/DocumentPreviewModal';

export interface StudentDocItem {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  uploadedAt: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED';
  remarks?: string;
  expiryDate?: string;
}

export interface StudentAdmissionDossier {
  id: string;
  studentName: string;
  admissionNo: string;
  className: string;
  parentName: string;
  parentMobile: string;
  admissionDate: string;
  status: 'VERIFIED' | 'PENDING_VERIFICATION';
  documents: StudentDocItem[];
}

const DEFAULT_STUDENT_DOSSIERS: StudentAdmissionDossier[] = [
  {
    id: 'adm-01',
    studentName: 'Aarav Patel',
    admissionNo: 'ADM-2026-081',
    className: 'Grade 3',
    parentName: 'Rajesh Patel (Father)',
    parentMobile: '+91 98220 11223',
    admissionDate: '2026-09-15',
    status: 'VERIFIED',
    documents: [
      { id: 'sd-1', documentType: 'Birth Certificate', fileName: 'Aarav_Municipal_Birth_Cert.pdf', fileSize: '520 KB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-09-15', verificationStatus: 'VERIFIED', remarks: 'Verified against municipal portal.' },
      { id: 'sd-2', documentType: 'Transfer Certificate (TC)', fileName: 'Official_School_Leaving_TC.pdf', fileSize: '840 KB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-09-15', verificationStatus: 'VERIFIED', remarks: 'Counter-signed by District Education Office.' },
      { id: 'sd-3', documentType: 'Previous School Marksheet', fileName: 'Grade2_Report_Card.pdf', fileSize: '1.1 MB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-09-16', verificationStatus: 'VERIFIED', remarks: 'A Grade score verified.' },
      { id: 'sd-4', documentType: 'Immunization & Health Record', fileName: 'Vaccination_Record_Book.pdf', fileSize: '410 KB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-09-16', verificationStatus: 'VERIFIED', remarks: 'All routine vaccines up to date.' }
    ]
  },
  {
    id: 'adm-02',
    studentName: 'Zara Siddiqui',
    admissionNo: 'ADM-2026-094',
    className: 'Grade 5',
    parentName: 'Farhan Siddiqui (Father)',
    parentMobile: '+91 98450 99887',
    admissionDate: '2026-10-01',
    status: 'PENDING_VERIFICATION',
    documents: [
      { id: 'sd-5', documentType: 'Birth Certificate', fileName: 'Birth_Certificate_Attested.pdf', fileSize: '650 KB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-10-01', verificationStatus: 'VERIFIED', remarks: 'Original attested copy sighted.' },
      { id: 'sd-6', documentType: 'Previous School Marksheet', fileName: 'Grade4_Annual_Evaluation.pdf', fileSize: '1.2 MB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-10-01', verificationStatus: 'VERIFIED', remarks: 'Annual marksheet validated.' },
      { id: 'sd-7', documentType: 'Transfer Certificate (TC)', fileName: 'Pending_TC_PreviousSchool.pdf', fileSize: '320 KB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-10-02', verificationStatus: 'PENDING', remarks: 'Awaiting original hardcopy from previous institution.' }
    ]
  },
  {
    id: 'adm-03',
    studentName: 'Rohan Deshmukh',
    admissionNo: 'ADM-2026-110',
    className: 'Grade 8',
    parentName: 'Sunita Deshmukh (Mother)',
    parentMobile: '+91 97654 33221',
    admissionDate: '2026-10-12',
    status: 'VERIFIED',
    documents: [
      { id: 'sd-8', documentType: 'Birth Certificate', fileName: 'Rohan_Birth_Certificate.pdf', fileSize: '480 KB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-10-12', verificationStatus: 'VERIFIED', remarks: 'Municipal registration authenticated.' },
      { id: 'sd-9', documentType: 'Transfer Certificate (TC)', fileName: 'Countersigned_TC_StateBoard.pdf', fileSize: '950 KB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-10-12', verificationStatus: 'VERIFIED', remarks: 'Clearance approved.' },
      { id: 'sd-10', documentType: 'National ID / Aadhar', fileName: 'Student_Aadhar_Front_Back.pdf', fileSize: '350 KB', fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploadedAt: '2026-10-13', verificationStatus: 'VERIFIED', remarks: 'UIDAI numbers masked and verified.' }
    ]
  }
];

const OfficeDocumentVault: React.FC = () => {
  const navigate = useNavigate();
  const [dossiers, setDossiers] = useState<StudentAdmissionDossier[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Dossier Modal
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [activeDossier, setActiveDossier] = useState<StudentAdmissionDossier | null>(null);

  // Store / Upload Modal (Create)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState<string>('NEW');
  const [customStudentName, setCustomStudentName] = useState('');
  const [customAdmissionNo, setCustomAdmissionNo] = useState('');
  const [customClass, setCustomClass] = useState('Grade 1');
  const [docType, setDocType] = useState('Transfer Certificate (TC)');
  const [docTitle, setDocTitle] = useState('');
  const [docRemarks, setDocRemarks] = useState('');
  const [docInitialStatus, setDocInitialStatus] = useState<'VERIFIED' | 'PENDING'>('VERIFIED');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Edit Document Modal (Update)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<StudentDocItem | null>(null);
  const [editDocType, setEditDocType] = useState('');
  const [editFileName, setEditFileName] = useState('');
  const [editStatus, setEditStatus] = useState<'VERIFIED' | 'PENDING' | 'REJECTED'>('PENDING');
  const [editRemarks, setEditRemarks] = useState('');

  // Delete Confirmation Modal (Delete)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [deletingDocName, setDeletingDocName] = useState<string>('');

  // In-app Document Preview Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewData | null>(null);

  const syncDossiersToStorage = (updated: StudentAdmissionDossier[]) => {
    setDossiers(updated);
    localStorage.setItem('erp_office_student_dossiers', JSON.stringify(updated));
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const clsData = await getClasses();
        setClasses(Array.isArray(clsData) ? clsData : []);

        // 1. Try local storage first
        const saved = localStorage.getItem('erp_office_student_dossiers');
        if (saved) {
          try {
            setDossiers(JSON.parse(saved));
            setLoading(false);
            return;
          } catch (e) {
            console.error(e);
          }
        }

        // 2. Fetch from backend student documents API
        try {
          const apiDocs = await getStudentDocuments();
          if (Array.isArray(apiDocs) && apiDocs.length > 0) {
            // Group by student / candidate
            const groupedMap: Record<string, StudentAdmissionDossier> = {};
            apiDocs.forEach((d: any) => {
              const studentKey = d.admissionNo || d.studentId?._id || 'cand-' + d._id;
              if (!groupedMap[studentKey]) {
                const sName = d.studentName || (d.studentId ? `${d.studentId.firstName} ${d.studentId.lastName}` : 'Candidate');
                groupedMap[studentKey] = {
                  id: studentKey,
                  studentName: sName,
                  admissionNo: d.admissionNo || d.studentId?.studentIdNumber || 'ADM-2026',
                  className: d.className || 'Grade 1',
                  parentName: 'Parent / Guardian',
                  parentMobile: '+91 98000 00000',
                  admissionDate: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '2026-10-01',
                  status: 'PENDING_VERIFICATION',
                  documents: []
                };
              }
              groupedMap[studentKey].documents.push({
                id: d._id || d.id,
                documentType: d.documentType,
                fileName: d.fileName || d.title || 'document.pdf',
                fileSize: d.fileSize || '600 KB',
                fileUrl: d.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                uploadedAt: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '2026-10-01',
                verificationStatus: d.verificationStatus || (d.isVerified ? 'VERIFIED' : 'PENDING'),
                remarks: d.remarks || ''
              });
            });

            const loadedList = Object.values(groupedMap);
            loadedList.forEach(s => {
              s.status = s.documents.every(d => d.verificationStatus === 'VERIFIED') ? 'VERIFIED' : 'PENDING_VERIFICATION';
            });
            syncDossiersToStorage([...loadedList, ...DEFAULT_STUDENT_DOSSIERS]);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.warn('Backend student docs fetch fallback to default dossiers:', apiErr);
        }

        // Fallback default dossiers
        syncDossiersToStorage(DEFAULT_STUDENT_DOSSIERS);
      } catch (e) {
        console.error(e);
        syncDossiersToStorage(DEFAULT_STUDENT_DOSSIERS);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleDownloadIndividual = (doc: StudentDocItem, studentName: string) => {
    const anchor = document.createElement('a');
    anchor.href = doc.fileUrl;
    anchor.download = `${studentName.replace(/\s+/g, '_')}_${doc.fileName}`;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleOpenDossier = (student: StudentAdmissionDossier) => {
    setActiveDossier(student);
    setDossierModalOpen(true);
  };

  // QUICK TOGGLE VERIFICATION STATUS (UPDATE)
  const handleToggleVerification = async (studentId: string, docId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
    
    // Call backend API in background
    try {
      await updateStudentDocument(docId, { verificationStatus: newStatus });
    } catch (e) {
      console.warn('Backend status update fallback to local:', e);
    }

    const updated = dossiers.map(s => {
      if (s.id === studentId) {
        const updatedDocs = s.documents.map(d => d.id === docId ? { ...d, verificationStatus: newStatus as any } : d);
        const allVerified = updatedDocs.every(d => d.verificationStatus === 'VERIFIED');
        return {
          ...s,
          documents: updatedDocs,
          status: (allVerified ? 'VERIFIED' : 'PENDING_VERIFICATION') as any
        };
      }
      return s;
    });

    syncDossiersToStorage(updated);
  };

  // OPEN UPLOAD MODAL FOR EXISTING OR NEW STUDENT (CREATE)
  const handleOpenUploadForStudent = (student?: StudentAdmissionDossier) => {
    if (student) {
      setTargetStudentId(student.id);
      setCustomStudentName(student.studentName);
      setCustomAdmissionNo(student.admissionNo);
      setCustomClass(student.className);
    } else {
      setTargetStudentId('NEW');
      setCustomStudentName('');
      setCustomAdmissionNo('');
      setCustomClass('Grade 1');
    }
    setDocType('Transfer Certificate (TC)');
    setDocTitle('');
    setDocRemarks('');
    setSelectedFile(null);
    setUploadModalOpen(true);
  };

  // SAVE NEW STUDENT DOCUMENT (CREATE)
  const handleSaveNewDocument = async () => {
    const docName = selectedFile ? selectedFile.name : (docTitle ? `${docTitle.replace(/\s+/g, '_')}.pdf` : `${docType.replace(/\s+/g, '_')}.pdf`);
    const docUrl = selectedFile ? URL.createObjectURL(selectedFile) : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    const fileSizeStr = selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '680 KB';
    const today = new Date().toISOString().split('T')[0];

    // Backend payload
    const payload = {
      studentName: targetStudentId === 'NEW' ? (customStudentName || 'New Student') : dossiers.find(d => d.id === targetStudentId)?.studentName,
      admissionNo: targetStudentId === 'NEW' ? (customAdmissionNo || 'ADM-' + Math.floor(1000 + Math.random() * 9000)) : dossiers.find(d => d.id === targetStudentId)?.admissionNo,
      className: targetStudentId === 'NEW' ? customClass : dossiers.find(d => d.id === targetStudentId)?.className,
      documentType: docType,
      title: docTitle || docType,
      fileName: docName,
      fileSize: fileSizeStr,
      fileUrl: docUrl,
      verificationStatus: docInitialStatus,
      remarks: docRemarks
    };

    let backendDocId = 'sd-' + Date.now();
    try {
      const res = await createStudentDocument(payload);
      if (res.success && res.data?._id) {
        backendDocId = res.data._id;
      }
    } catch (e) {
      console.warn('Backend create student doc fallback:', e);
    }

    const newDocItem: StudentDocItem = {
      id: backendDocId,
      documentType: docType,
      fileName: docName,
      fileSize: fileSizeStr,
      fileUrl: docUrl,
      uploadedAt: today,
      verificationStatus: docInitialStatus,
      remarks: docRemarks
    };

    let updated: StudentAdmissionDossier[];

    if (targetStudentId === 'NEW') {
      const newDossier: StudentAdmissionDossier = {
        id: 'adm-' + Date.now(),
        studentName: customStudentName || 'Candidate Student',
        admissionNo: customAdmissionNo || 'ADM-' + Math.floor(1000 + Math.random() * 9000),
        className: customClass || 'Grade 1',
        parentName: 'Parent / Guardian',
        parentMobile: '+91 98000 00000',
        admissionDate: today,
        status: docInitialStatus === 'VERIFIED' ? 'VERIFIED' : 'PENDING_VERIFICATION',
        documents: [newDocItem]
      };
      updated = [newDossier, ...dossiers];
    } else {
      updated = dossiers.map(s => {
        if (s.id === targetStudentId) {
          const newDocList = [newDocItem, ...s.documents];
          const allVerified = newDocList.every(d => d.verificationStatus === 'VERIFIED');
          return {
            ...s,
            documents: newDocList,
            status: (allVerified ? 'VERIFIED' : 'PENDING_VERIFICATION') as any
          };
        }
        return s;
      });
    }

    syncDossiersToStorage(updated);
    setUploadModalOpen(false);
    setSelectedFile(null);
  };

  // OPEN EDIT DOCUMENT MODAL (UPDATE)
  const handleOpenEditDoc = (studentId: string, doc: StudentDocItem) => {
    setEditingStudentId(studentId);
    setEditingDoc(doc);
    setEditDocType(doc.documentType);
    setEditFileName(doc.fileName);
    setEditStatus(doc.verificationStatus);
    setEditRemarks(doc.remarks || '');
    setEditModalOpen(true);
  };

  // SAVE EDITED DOCUMENT (UPDATE)
  const handleSaveEditDoc = async () => {
    if (!editingStudentId || !editingDoc) return;

    try {
      await updateStudentDocument(editingDoc.id, {
        documentType: editDocType,
        fileName: editFileName,
        verificationStatus: editStatus,
        remarks: editRemarks
      });
    } catch (e) {
      console.warn('Backend update doc fallback to local:', e);
    }

    const updated = dossiers.map(s => {
      if (s.id === editingStudentId) {
        const updatedDocs = s.documents.map(d => d.id === editingDoc.id ? {
          ...d,
          documentType: editDocType,
          fileName: editFileName,
          verificationStatus: editStatus,
          remarks: editRemarks
        } : d);

        const allVerified = updatedDocs.every(d => d.verificationStatus === 'VERIFIED');
        return {
          ...s,
          documents: updatedDocs,
          status: (allVerified ? 'VERIFIED' : 'PENDING_VERIFICATION') as any
        };
      }
      return s;
    });

    syncDossiersToStorage(updated);
    setEditModalOpen(false);
    setEditingDoc(null);
  };

  // OPEN DELETE CONFIRMATION MODAL (DELETE)
  const handleOpenDeleteConfirm = (studentId: string, doc: StudentDocItem) => {
    setDeletingStudentId(studentId);
    setDeletingDocId(doc.id);
    setDeletingDocName(doc.fileName);
    setDeleteModalOpen(true);
  };

  // CONFIRM DELETE DOCUMENT (DELETE)
  const handleConfirmDeleteDoc = async () => {
    if (!deletingStudentId || !deletingDocId) return;

    try {
      await deleteStudentDocument(deletingDocId);
    } catch (e) {
      console.warn('Backend delete doc fallback to local:', e);
    }

    const updated = dossiers.map(s => {
      if (s.id === deletingStudentId) {
        const filteredDocs = s.documents.filter(d => d.id !== deletingDocId);
        const allVerified = filteredDocs.length > 0 && filteredDocs.every(d => d.verificationStatus === 'VERIFIED');
        return {
          ...s,
          documents: filteredDocs,
          status: (allVerified ? 'VERIFIED' : 'PENDING_VERIFICATION') as any
        };
      }
      return s;
    });

    syncDossiersToStorage(updated);
    setDeleteModalOpen(false);
    setDeletingStudentId(null);
    setDeletingDocId(null);
  };

  const filteredDossiers = useMemo(() => {
    return dossiers.filter(s => {
      const matchSearch = searchQuery === '' ||
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.documents.some(d => d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || d.documentType.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchClass = selectedClass === 'ALL' || s.className.toLowerCase().includes(selectedClass.toLowerCase());
      const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

      return matchSearch && matchClass && matchStatus;
    });
  }, [dossiers, searchQuery, selectedClass, selectedStatus]);

  const stats = useMemo(() => {
    const totalStudents = dossiers.length;
    let totalDocs = 0;
    let verifiedCount = 0;
    let pendingCount = 0;

    dossiers.forEach(d => {
      totalDocs += d.documents.length;
      if (d.status === 'VERIFIED') verifiedCount++;
      else pendingCount++;
    });

    return { totalStudents, totalDocs, verifiedCount, pendingCount };
  }, [dossiers]);

  const studentDocCategories = [
    'Birth Certificate',
    'Transfer Certificate (TC)',
    'Previous School Marksheet',
    'National ID / Aadhar',
    'Immunization & Health Record',
    'Caste / Special Category Certificate',
    'Migration Certificate',
    'Conduct & Character Certificate',
    'Passport Photo & Identification'
  ];

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

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 52, height: 52, borderRadius: 3, 
                bgcolor: '#0284c7', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.4)'
              }}>
                <SchoolIcon fontSize="large" />
              </Box>
              <div>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  Student Admission Documents & Archives Vault
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Front Office Command: Store, review, verify, update, and manage official student admission certificates with full CRUD operations.
                </Typography>
              </div>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />} 
                onClick={() => window.print()}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, borderColor: '#cbd5e1', color: '#334155' }}
              >
                Print Verification Roster
              </Button>
              <Button 
                variant="contained" 
                startIcon={<CloudUploadIcon />} 
                onClick={() => handleOpenUploadForStudent()}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' } }}
              >
                Store Student Document
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Informational Role Banner */}
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5, bgcolor: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1' }}>
          <strong>Front-Office & Office Admin Authority:</strong> Office staff and office administrators have full CRUD access to store admission files, view certificates in-browser, edit metadata/status, and delete outdated student records.
        </Alert>

        {/* Top KPI Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Admission Profiles</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{stats.totalStudents}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #dcfce7', bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <VerifiedUserIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Fully Verified Candidates</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d' }}>{stats.verifiedCount}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fef3c7', bgcolor: '#fffbeb', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HourglassEmptyIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#b45309', textTransform: 'uppercase' }}>Pending Document Review</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#b45309' }}>{stats.pendingCount}</Typography>
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, bgcolor: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DescriptionIcon />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Uploaded Documents</Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>{stats.totalDocs}</Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField 
                fullWidth
                size="small"
                placeholder="Search candidate name, admission number, certificate type..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <SearchIcon sx={{ color: '#94a3b8', mr: 1 }} />
                    )
                  }
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Class"
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="ALL">All Classes</MenuItem>
                {classes.length > 0 ? (
                  classes.map(c => <MenuItem key={c._id || c.name} value={c.name}>{c.name}</MenuItem>)
                ) : (
                  ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'].map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))
                )}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Status"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="VERIFIED">Fully Verified</MenuItem>
                <MenuItem value="PENDING_VERIFICATION">Pending Document Check</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Student Dossiers List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
            <CircularProgress size={44} />
          </Box>
        ) : filteredDossiers.length === 0 ? (
          <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc' }}>
            <DescriptionIcon sx={{ fontSize: 52, color: '#94a3b8', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>No student documents found</Typography>
            <Typography variant="body2" color="text.secondary">Try adjusting your filters or click "Store Student Document" to upload a new record.</Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {filteredDossiers.map(student => {
              const isVerified = student.status === 'VERIFIED';
              return (
                <Card 
                  key={student.id}
                  elevation={0}
                  sx={{ 
                    borderRadius: 3.5, 
                    border: '1px solid',
                    borderColor: isVerified ? '#cbd5e1' : '#fde68a',
                    bgcolor: '#ffffff',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ 
                    p: 2.5, 
                    bgcolor: '#f8fafc', 
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { md: 'center' },
                    gap: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: '#0284c7', fontWeight: 700 }}>
                        {student.studentName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>{student.studentName}</Typography>
                          <Chip label={student.admissionNo} size="small" sx={{ fontWeight: 700, bgcolor: '#e2e8f0', color: '#334155', borderRadius: 1 }} />
                          <Chip label={student.className} size="small" sx={{ fontWeight: 700, bgcolor: '#e0f2fe', color: '#0369a1', borderRadius: 1 }} />
                          <Chip 
                            label={isVerified ? "Verified Dossier" : "Action Needed"}
                            size="small"
                            color={isVerified ? "success" : "warning"}
                            sx={{ fontWeight: 700, borderRadius: 1 }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                          Parent: {student.parentName} ({student.parentMobile}) • Admitted {student.admissionDate}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenUploadForStudent(student)}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                      >
                        Attach Certificate
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => handleOpenDossier(student)}
                        sx={{ 
                          borderRadius: 2, 
                          textTransform: 'none', 
                          fontWeight: 700, 
                          bgcolor: '#0284c7', 
                          '&:hover': { bgcolor: '#0369a1' } 
                        }}
                      >
                        Download Admission Dossier (Whole PDF)
                      </Button>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2.5 }}>
                    <Grid container spacing={2}>
                      {student.documents.map(doc => {
                        const docVerified = doc.verificationStatus === 'VERIFIED';
                        return (
                          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={doc.id}>
                            <Paper 
                              elevation={0}
                              sx={{ 
                                p: 2, 
                                borderRadius: 2.5, 
                                border: '1px solid #e2e8f0', 
                                bgcolor: docVerified ? '#ffffff' : '#fffbeb',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                height: '100%'
                              }}
                            >
                              <Box sx={{ mb: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                    {doc.documentType}
                                  </Typography>
                                  <Chip 
                                    label={doc.verificationStatus} 
                                    size="small" 
                                    color={docVerified ? "success" : "warning"}
                                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                                  />
                                </Box>
                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block', wordBreak: 'break-all' }}>
                                  {doc.fileName}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                                  {doc.fileSize} • Uploaded {doc.uploadedAt}
                                </Typography>
                                {doc.remarks && (
                                  <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                    Note: {doc.remarks}
                                  </Typography>
                                )}
                              </Box>

                              <Divider sx={{ my: 1, borderColor: '#f1f5f9' }} />

                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Button
                                    size="small"
                                    startIcon={<VisibilityIcon fontSize="small" />}
                                    onClick={() => setPreviewDoc({
                                      id: doc.id,
                                      documentType: doc.documentType,
                                      fileName: doc.fileName,
                                      fileUrl: doc.fileUrl,
                                      fileSize: doc.fileSize,
                                      uploadDate: doc.uploadedAt,
                                      verificationStatus: doc.verificationStatus as any,
                                      ownerName: student.studentName,
                                      ownerRole: `${student.className} • ${student.admissionNo}`,
                                      ownerId: student.admissionNo,
                                      remarks: doc.remarks || `Parent: ${student.parentName} (${student.parentMobile})`,
                                      verifiedBy: docVerified ? 'Office Superintendent / Admin' : 'Pending Review'
                                    })}
                                    sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#0284c7', bgcolor: '#e0f2fe', '&:hover': { bgcolor: '#bae6fd' } }}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="small"
                                    startIcon={<FileDownloadIcon fontSize="small" />}
                                    onClick={() => handleDownloadIndividual(doc, student.studentName)}
                                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}
                                  >
                                    Get
                                  </Button>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {/* Quick Verify Toggle */}
                                  <Button
                                    size="small"
                                    color={docVerified ? "inherit" : "success"}
                                    onClick={() => handleToggleVerification(student.id, doc.id, doc.verificationStatus)}
                                    sx={{ textTransform: 'none', fontSize: '0.7rem', fontWeight: 700 }}
                                  >
                                    {docVerified ? "Unverify" : "Verify"}
                                  </Button>

                                  {/* Edit Document Metadata (UPDATE) */}
                                  <Tooltip title="Edit Document Metadata">
                                    <IconButton 
                                      size="small" 
                                      color="primary"
                                      onClick={() => handleOpenEditDoc(student.id, doc)}
                                      sx={{ p: 0.5 }}
                                    >
                                      <EditIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>

                                  {/* Delete Document (DELETE) */}
                                  <Tooltip title="Delete Document">
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => handleOpenDeleteConfirm(student.id, doc)}
                                      sx={{ p: 0.5 }}
                                    >
                                      <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {/* STUDENT ADMISSION WHOLE DOSSIER MODAL */}
        <Dialog 
          open={dossierModalOpen} 
          onClose={() => setDossierModalOpen(false)} 
          maxWidth="md" 
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: 3.5, overflow: 'hidden' } } }}
        >
          {activeDossier && (
            <>
              <Box sx={{ p: 3, bgcolor: '#0369a1', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SchoolIcon sx={{ color: '#ffffff', fontSize: 32 }} />
                  <div>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Student Admission Archive & Credentials Dossier</Typography>
                    <Typography variant="caption" sx={{ color: '#e0f2fe' }}>
                      Official Front-Office Enrollment Records
                    </Typography>
                  </div>
                </Box>
                <IconButton onClick={() => setDossierModalOpen(false)} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <DialogContent sx={{ p: 4, bgcolor: '#ffffff' }}>
                <Box sx={{ textAlign: 'center', pb: 3, mb: 3, borderBottom: '2px solid #0369a1' }}>
                  <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', color: '#0369a1' }}>
                    Central School Office of Admissions
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontWeight: 600 }}>
                    Official Student Enrollment & Verification File
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Application Ref: {activeDossier.admissionNo} • Class: {activeDossier.className} • Date: {activeDossier.admissionDate}
                  </Typography>
                </Box>

                <Paper elevation={0} sx={{ p: 2.5, mb: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', mb: 2 }}>
                    Candidate & Guardian Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Student Name</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{activeDossier.studentName}</Typography></Grid>
                    <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Admission Number</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{activeDossier.admissionNo}</Typography></Grid>
                    <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Admitted Class</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{activeDossier.className}</Typography></Grid>
                    <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Parent / Guardian</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{activeDossier.parentName}</Typography></Grid>
                    <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Contact Number</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{activeDossier.parentMobile}</Typography></Grid>
                    <Grid size={{ xs: 6, sm: 4 }}><Typography variant="caption" color="text.secondary">Dossier Status</Typography><Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>VERIFIED BY OFFICE</Typography></Grid>
                  </Grid>
                </Paper>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', mb: 1.5 }}>
                  Verified Admission Certificates ({activeDossier.documents.length} Records)
                </Typography>
                <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                      <tr>
                        <th style={{ padding: '10px 14px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Document Category</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Attached File</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Size</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Archived On</th>
                        <th style={{ padding: '10px 14px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Verification</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeDossier.documents.map((d, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600 }}>{d.documentType}</td>
                          <td style={{ padding: '10px 14px', color: '#475569' }}>{d.fileName}</td>
                          <td style={{ padding: '10px 14px', color: '#64748b' }}>{d.fileSize}</td>
                          <td style={{ padding: '10px 14px', color: '#64748b' }}>{d.uploadedAt}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ 
                              padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                              backgroundColor: d.verificationStatus === 'VERIFIED' ? '#dcfce7' : '#fef3c7',
                              color: d.verificationStatus === 'VERIFIED' ? '#166534' : '#b45309'
                            }}>
                              {d.verificationStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Paper>
              </DialogContent>

              <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  Ready to print or save as official PDF enrollment dossier.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Button 
                    variant="contained" 
                    startIcon={<PrintIcon />} 
                    onClick={() => window.print()}
                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: '#0284c7' }}
                  >
                    Print / Save Whole PDF
                  </Button>
                  <Button variant="outlined" onClick={() => setDossierModalOpen(false)} sx={{ borderRadius: 2.5, textTransform: 'none' }}>
                    Close
                  </Button>
                </Box>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* UPLOAD / STORE NEW STUDENT DOCUMENT MODAL (CREATE) */}
        <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            {targetStudentId === 'NEW' ? 'Store Document for New Student' : `Attach Certificate for ${dossiers.find(d => d.id === targetStudentId)?.studentName}`}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              
              {/* Select Target Student or New Student */}
              <Grid size={{ xs: 12 }}>
                <TextField 
                  select 
                  fullWidth 
                  label="Select Candidate Profile" 
                  value={targetStudentId} 
                  onChange={e => setTargetStudentId(e.target.value)}
                >
                  <MenuItem value="NEW">+ Register Document for New Student / Candidate</MenuItem>
                  {dossiers.map(d => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.studentName} ({d.admissionNo} • {d.className})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* If New Candidate, show Name, Admission No, and Class */}
              {targetStudentId === 'NEW' && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Student Candidate Name" 
                      value={customStudentName} 
                      onChange={e => setCustomStudentName(e.target.value)} 
                      required 
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      fullWidth 
                      label="Admission / Application No" 
                      value={customAdmissionNo} 
                      onChange={e => setCustomAdmissionNo(e.target.value)} 
                      placeholder="e.g. ADM-2026-150"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField 
                      select 
                      fullWidth 
                      label="Class" 
                      value={customClass} 
                      onChange={e => setCustomClass(e.target.value)}
                    >
                      {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'].map(cls => (
                        <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </>
              )}

              <Grid size={{ xs: 12, sm: targetStudentId === 'NEW' ? 6 : 12 }}>
                <TextField 
                  select 
                  fullWidth 
                  label="Certificate / Document Category" 
                  value={docType} 
                  onChange={e => setDocType(e.target.value)}
                >
                  {studentDocCategories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth 
                  label="Custom Document Title (Optional)" 
                  value={docTitle} 
                  onChange={e => setDocTitle(e.target.value)} 
                  placeholder="e.g. Municipal Birth Certificate with Seal"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  select 
                  fullWidth 
                  label="Initial Verification Status" 
                  value={docInitialStatus} 
                  onChange={e => setDocInitialStatus(e.target.value as any)}
                >
                  <MenuItem value="VERIFIED">Verified by Front Office</MenuItem>
                  <MenuItem value="PENDING">Pending Hardcopy Verification</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth 
                  label="Notes / Attestation Remarks" 
                  value={docRemarks} 
                  onChange={e => setDocRemarks(e.target.value)} 
                  placeholder="e.g. Original sighted & verified"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button variant="outlined" component="label" fullWidth sx={{ py: 2, borderRadius: 2, borderStyle: 'dashed' }}>
                  {selectedFile ? `Selected File: ${selectedFile.name}` : 'Click to Browse & Select Student Certificate (PDF / Image)'}
                  <input type="file" hidden accept="image/*,.pdf" onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setUploadModalOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveNewDocument} 
              sx={{ bgcolor: '#0284c7', textTransform: 'none', fontWeight: 700 }}
            >
              Store Document Record
            </Button>
          </DialogActions>
        </Dialog>

        {/* EDIT STUDENT DOCUMENT MODAL (UPDATE) */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Edit Student Document Record</DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField 
                  select 
                  fullWidth 
                  label="Certificate Category" 
                  value={editDocType} 
                  onChange={e => setEditDocType(e.target.value)}
                >
                  {studentDocCategories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth 
                  label="File Name / Reference Title" 
                  value={editFileName} 
                  onChange={e => setEditFileName(e.target.value)} 
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  select 
                  fullWidth 
                  label="Verification Status" 
                  value={editStatus} 
                  onChange={e => setEditStatus(e.target.value as any)}
                >
                  <MenuItem value="VERIFIED">VERIFIED</MenuItem>
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="REJECTED">REJECTED</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth 
                  label="Verification Remarks / Notes" 
                  value={editRemarks} 
                  onChange={e => setEditRemarks(e.target.value)} 
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveEditDoc} 
              sx={{ bgcolor: '#0284c7', textTransform: 'none', fontWeight: 700 }}
            >
              Update Record
            </Button>
          </DialogActions>
        </Dialog>

        {/* DELETE DOCUMENT CONFIRMATION MODAL (DELETE) */}
        <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
          <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>Delete Student Document?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to permanently delete <strong>{deletingDocName}</strong>? This will remove the document file from the candidate's admission archive.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleConfirmDeleteDoc}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* In-App Document Preview Modal */}
        <DocumentPreviewModal
          open={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          document={previewDoc}
        />

      </Box>
    </Layout>
  );
};

export default OfficeDocumentVault;
