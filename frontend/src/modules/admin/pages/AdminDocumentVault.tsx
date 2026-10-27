import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, MenuItem, Button,
  Chip, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Card, CardContent, Tabs, Tab,
  RadioGroup, FormControlLabel, Radio, FormControl, FormLabel,
  Alert, Divider
} from '@mui/material';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useNavigate } from 'react-router-dom';
import Layout from '../../../core/components/Layout';
import DocumentPreviewModal, { type DocumentPreviewData } from '../../documents/components/DocumentPreviewModal';

export type VaultScopeMode = 'SCHOOL_ONLY' | 'SCHOOL_AND_OFFICE';

export interface VaultDoc {
  id: string;
  scope: 'SCHOOL' | 'OFFICE';
  category: string;
  title: string;
  issuingAuthority: string;
  validFrom: string;
  expiryDate: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'RENEWAL_REQUIRED';
  fileName: string;
  fileSize: string;
  remarks?: string;
}

const DEFAULT_SCHOOL_DOCS: VaultDoc[] = [
  {
    id: 'inst-1',
    scope: 'SCHOOL',
    category: 'Regulatory Affiliation',
    title: 'Central Board Affiliation Extension Certificate',
    issuingAuthority: 'Central Board of Secondary Education (CBSE)',
    validFrom: '2023-04-01',
    expiryDate: '2028-03-31',
    status: 'VALID',
    fileName: 'CBSE_Affiliation_Extension_2028.pdf',
    fileSize: '2.8 MB',
    remarks: 'Official board affiliation valid for Senior Secondary level.'
  },
  {
    id: 'inst-2',
    scope: 'SCHOOL',
    category: 'Safety & Infrastructure',
    title: 'Fire Safety Clearance & NOC Certificate',
    issuingAuthority: 'State Fire & Rescue Services Directorate',
    validFrom: '2025-11-01',
    expiryDate: '2026-10-31',
    status: 'EXPIRING_SOON',
    fileName: 'Fire_Safety_NOC_Renewal_2026.pdf',
    fileSize: '1.4 MB',
    remarks: 'Annual inspection due by next month.'
  },
  {
    id: 'inst-3',
    scope: 'SCHOOL',
    category: 'Safety & Infrastructure',
    title: 'Public Works Structural Stability Certificate',
    issuingAuthority: 'PWD Executive Engineer Division',
    validFrom: '2024-06-15',
    expiryDate: '2027-06-14',
    status: 'VALID',
    fileName: 'PWD_Structural_Safety_Certificate.pdf',
    fileSize: '3.1 MB',
    remarks: 'Covers Academic Block A, Block B, and Auditorium.'
  },
  {
    id: 'inst-4',
    scope: 'SCHOOL',
    category: 'Health & Sanitation',
    title: 'Drinking Water Quality & Sanitation Certificate',
    issuingAuthority: 'Public Health & Municipal Corporation',
    validFrom: '2026-01-10',
    expiryDate: '2027-01-09',
    status: 'VALID',
    fileName: 'Water_Hygiene_Sanitation_Report.pdf',
    fileSize: '820 KB',
    remarks: 'All 8 RO water stations tested and certified potable.'
  },
  {
    id: 'inst-5',
    scope: 'SCHOOL',
    category: 'Trust Governance',
    title: 'Educational Society Registration & Trust Deed',
    issuingAuthority: 'Registrar of Societies & Public Trusts',
    validFrom: '2010-08-20',
    expiryDate: 'Permanent / Registered',
    status: 'VALID',
    fileName: 'Educational_Trust_Deed_Registered.pdf',
    fileSize: '5.2 MB',
    remarks: 'Registered non-profit educational charter.'
  }
];

const DEFAULT_OFFICE_DOCS: VaultDoc[] = [
  {
    id: 'off-1',
    scope: 'OFFICE',
    category: 'Vendor Contracts & AMCs',
    title: 'Campus Security & Guard Force Service Agreement',
    issuingAuthority: 'Apex Integrated Security Services Pvt Ltd',
    validFrom: '2026-04-01',
    expiryDate: '2027-03-31',
    status: 'VALID',
    fileName: 'Campus_Security_Force_MOU_2026.pdf',
    fileSize: '1.8 MB',
    remarks: '24/7 Gate security, surveillance & day shift patrols.'
  },
  {
    id: 'off-2',
    scope: 'OFFICE',
    category: 'Financial Audit & Tax Clearances',
    title: 'Income Tax 12A & 80G Statutory Exemption Clearance',
    issuingAuthority: 'Central Board of Direct Taxes (CBDT)',
    validFrom: '2024-04-01',
    expiryDate: '2029-03-31',
    status: 'VALID',
    fileName: 'Tax_Exemption_12A_80G_Certificate.pdf',
    fileSize: '950 KB',
    remarks: 'Allows donor tax benefits and institutional non-profit status.'
  },
  {
    id: 'off-3',
    scope: 'OFFICE',
    category: 'Property & Utility Leases',
    title: 'School Campus Premises Master Lease Agreement',
    issuingAuthority: 'Urban Land Development Authority & Lessor',
    validFrom: '2020-01-01',
    expiryDate: '2035-12-31',
    status: 'VALID',
    fileName: 'Premises_Registered_Lease_Deed.pdf',
    fileSize: '4.6 MB',
    remarks: '15-Year Institutional campus lease registered with Sub-Registrar.'
  },
  {
    id: 'off-4',
    scope: 'OFFICE',
    category: 'Office Circulars & Policies',
    title: 'Standard Operating Procedures & Office Administration Manual',
    issuingAuthority: 'Office of the School Director / Registrar',
    validFrom: '2026-06-01',
    expiryDate: '2027-05-31',
    status: 'VALID',
    fileName: 'Office_Administration_SOP_2026.pdf',
    fileSize: '1.2 MB',
    remarks: 'Staff duties, fee collection timings, and procurement rules.'
  },
  {
    id: 'off-5',
    scope: 'OFFICE',
    category: 'Equipment Warranties & AMCs',
    title: 'Campus High-Speed Fiber Internet & Telecom Contract',
    issuingAuthority: 'National Telecom Infrastructure Provider',
    validFrom: '2025-10-01',
    expiryDate: '2026-09-30',
    status: 'EXPIRING_SOON',
    fileName: 'Telecom_Fiber_LeasedLine_Contract.pdf',
    fileSize: '640 KB',
    remarks: '1 Gbps dedicated leased line contract due for renewal.'
  }
];

const AdminDocumentVault: React.FC = () => {
  const navigate = useNavigate();
  
  // Vault Customization: School Documents Only vs School + Office Documents
  const [vaultScope, setVaultScope] = useState<VaultScopeMode>(() => {
    return (localStorage.getItem('erp_admin_vault_scope') as VaultScopeMode) || 'SCHOOL_AND_OFFICE';
  });

  const [tabIndex, setTabIndex] = useState(0);
  const [schoolDocs, setSchoolDocs] = useState<VaultDoc[]>(() => {
    const saved = localStorage.getItem('erp_admin_school_docs');
    return saved ? JSON.parse(saved) : DEFAULT_SCHOOL_DOCS;
  });
  const [officeDocs, setOfficeDocs] = useState<VaultDoc[]>(() => {
    const saved = localStorage.getItem('erp_admin_office_docs');
    return saved ? JSON.parse(saved) : DEFAULT_OFFICE_DOCS;
  });

  const [previewDoc, setPreviewDoc] = useState<DocumentPreviewData | null>(null);

  // Upload modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [newDocScope, setNewDocScope] = useState<'SCHOOL' | 'OFFICE'>('SCHOOL');
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'Regulatory Affiliation',
    issuingAuthority: '',
    validFrom: '',
    expiryDate: '',
    remarks: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sync vault scope changes to localStorage
  const handleScopeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScope = e.target.value as VaultScopeMode;
    setVaultScope(newScope);
    localStorage.setItem('erp_admin_vault_scope', newScope);
    if (newScope === 'SCHOOL_ONLY' && tabIndex === 1) {
      setTabIndex(0);
    }
  };

  const handleDownload = (doc: VaultDoc) => {
    const anchor = document.createElement('a');
    anchor.href = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    anchor.download = doc.fileName;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleDeleteDoc = (docId: string, isOffice: boolean) => {
    if (window.confirm('Are you sure you want to delete this document from the vault?')) {
      if (isOffice) {
        const updated = officeDocs.filter(d => d.id !== docId);
        setOfficeDocs(updated);
        localStorage.setItem('erp_admin_office_docs', JSON.stringify(updated));
      } else {
        const updated = schoolDocs.filter(d => d.id !== docId);
        setSchoolDocs(updated);
        localStorage.setItem('erp_admin_school_docs', JSON.stringify(updated));
      }
    }
  };

  const handleSaveDoc = () => {
    if (!newDoc.title || !newDoc.issuingAuthority) return;

    const added: VaultDoc = {
      id: (newDocScope === 'OFFICE' ? 'off-' : 'inst-') + Date.now(),
      scope: newDocScope,
      category: newDoc.category,
      title: newDoc.title,
      issuingAuthority: newDoc.issuingAuthority,
      validFrom: newDoc.validFrom || new Date().toISOString().split('T')[0],
      expiryDate: newDoc.expiryDate || '2028-12-31',
      status: 'VALID',
      fileName: selectedFile ? selectedFile.name : `${newDoc.title.replace(/\s+/g, '_')}.pdf`,
      fileSize: selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : '1.5 MB',
      remarks: newDoc.remarks || ''
    };

    if (newDocScope === 'OFFICE') {
      const updated = [added, ...officeDocs];
      setOfficeDocs(updated);
      localStorage.setItem('erp_admin_office_docs', JSON.stringify(updated));
    } else {
      const updated = [added, ...schoolDocs];
      setSchoolDocs(updated);
      localStorage.setItem('erp_admin_school_docs', JSON.stringify(updated));
    }

    setModalOpen(false);
    setSelectedFile(null);
    setNewDoc({ title: '', category: 'Regulatory Affiliation', issuingAuthority: '', validFrom: '', expiryDate: '', remarks: '' });
  };

  // Categories list based on selected scope
  const schoolCategories = [
    'Regulatory Affiliation',
    'Safety & Infrastructure',
    'Health & Sanitation',
    'Trust Governance',
    'State Board Recognition'
  ];

  const officeCategories = [
    'Vendor Contracts & AMCs',
    'Financial Audit & Tax Clearances',
    'Property & Utility Leases',
    'Office Circulars & Policies',
    'Equipment Warranties & AMCs',
    'Legal & Statutory Filings'
  ];

  return (
    <Layout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: 'auto' }}>
        
        {/* Navigation & Header */}
        <Box sx={{ mb: 3 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/admin/dashboard')}
            sx={{ textTransform: 'none', color: '#64748b', mb: 1, fontWeight: 600 }}
          >
            Back to Admin Dashboard
          </Button>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: 52, height: 52, borderRadius: 3, 
                bgcolor: '#0f172a', color: 'white', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 16px -4px rgba(15, 23, 42, 0.4)'
              }}>
                <FolderSpecialIcon fontSize="large" />
              </Box>
              <div>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  Institutional Governance & Document Vault
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Central administrator repository: Manage institutional accreditations, statutory NOCs, and office operational compliance records.
                </Typography>
              </div>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />} 
                onClick={() => window.print()}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600 }}
              >
                Print Compliance Audit
              </Button>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />} 
                onClick={() => {
                  setNewDocScope('SCHOOL');
                  setNewDoc({ ...newDoc, category: 'Regulatory Affiliation' });
                  setModalOpen(true);
                }}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
              >
                Upload Document
              </Button>
            </Box>
          </Box>
        </Box>

        {/* VAULT SCOPE CUSTOMIZATION PANEL */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2.5, 
            mb: 3.5, 
            borderRadius: 3, 
            border: '1px solid',
            borderColor: vaultScope === 'SCHOOL_AND_OFFICE' ? '#c7d2fe' : '#e2e8f0',
            bgcolor: vaultScope === 'SCHOOL_AND_OFFICE' ? '#f5f7ff' : '#f8fafc',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { md: 'center' },
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TuneIcon />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Document Vault Management Scope
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customise whether this central administrator vault strictly manages School Accreditations or also manages Office Operational Documents.
              </Typography>
            </Box>
          </Box>

          <FormControl component="fieldset">
            <RadioGroup 
              row 
              value={vaultScope} 
              onChange={handleScopeChange}
              sx={{ gap: { xs: 1, sm: 2 } }}
            >
              <Paper 
                elevation={0}
                sx={{ 
                  px: 2, py: 0.5, borderRadius: 2, 
                  border: '1px solid',
                  borderColor: vaultScope === 'SCHOOL_ONLY' ? '#4f46e5' : '#cbd5e1',
                  bgcolor: vaultScope === 'SCHOOL_ONLY' ? '#ffffff' : 'transparent',
                  display: 'flex', alignItems: 'center'
                }}
              >
                <FormControlLabel 
                  value="SCHOOL_ONLY" 
                  control={<Radio size="small" />} 
                  label={<Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>🏫 Only School Documents</Typography>} 
                />
              </Paper>

              <Paper 
                elevation={0}
                sx={{ 
                  px: 2, py: 0.5, borderRadius: 2, 
                  border: '1px solid',
                  borderColor: vaultScope === 'SCHOOL_AND_OFFICE' ? '#4f46e5' : '#cbd5e1',
                  bgcolor: vaultScope === 'SCHOOL_AND_OFFICE' ? '#ffffff' : 'transparent',
                  display: 'flex', alignItems: 'center'
                }}
              >
                <FormControlLabel 
                  value="SCHOOL_AND_OFFICE" 
                  control={<Radio size="small" />} 
                  label={<Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>🏢 School & Office Documents</Typography>} 
                />
              </Paper>
            </RadioGroup>
          </FormControl>
        </Paper>

        {/* Scope Status Alert Banner */}
        {vaultScope === 'SCHOOL_ONLY' ? (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <strong>Vault Mode: Only School Institutional Documents Managed.</strong> Displaying strictly statutory school accreditations, CBSE board affiliations, PWD certificates, fire safety NOCs, and educational trust deeds. Office operational files are omitted.
          </Alert>
        ) : (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2.5, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <strong>Vault Mode: School & Office Documents Managed (Unified Repository).</strong> Displaying statutory school accreditations alongside office commercial records, vendor contracts/MOUs, financial audit/tax filings, facility leases, and operational circulars.
          </Alert>
        )}

        {/* Tab Navigation */}
        <Paper elevation={0} sx={{ mb: 3, borderBottom: '1px solid #e2e8f0', bgcolor: 'transparent' }}>
          <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} textColor="primary" indicatorColor="primary">
            <Tab 
              icon={<CorporateFareIcon />} 
              iconPosition="start" 
              label={`Institutional Accreditations & NOCs (${schoolDocs.length})`} 
              sx={{ fontWeight: 700, textTransform: 'none' }} 
            />

            {vaultScope === 'SCHOOL_AND_OFFICE' && (
              <Tab 
                icon={<BusinessCenterIcon />} 
                iconPosition="start" 
                label={`Office Operational & Commercial Records (${officeDocs.length})`} 
                sx={{ fontWeight: 700, textTransform: 'none' }} 
              />
            )}

            <Tab 
              icon={<BadgeIcon />} 
              iconPosition="start" 
              label="Staff Personnel Dossiers (HR Vault)" 
              sx={{ fontWeight: 700, textTransform: 'none' }} 
            />

            <Tab 
              icon={<SchoolIcon />} 
              iconPosition="start" 
              label="Student Admission Archives (Office Desk)" 
              sx={{ fontWeight: 700, textTransform: 'none' }} 
            />
          </Tabs>
        </Paper>

        {/* TAB 0: Institutional Accreditations */}
        {tabIndex === 0 && (
          <Box>
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #dcfce7', bgcolor: '#f0fdf4' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Active Certifications</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
                    {schoolDocs.filter(d => d.status === 'VALID').length}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fef3c7', bgcolor: '#fffbeb' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Upcoming Expiries / Action Required</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#b45309', mt: 0.5 }}>
                    {schoolDocs.filter(d => d.status === 'EXPIRING_SOON').length}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Statutory Clearances</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>{schoolDocs.length}</Typography>
                </Card>
              </Grid>
            </Grid>

            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Category & Title</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Issuing Authority</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Validity Period</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolDocs.map(doc => {
                    const isValid = doc.status === 'VALID';
                    return (
                      <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <PictureAsPdfIcon sx={{ color: '#ef4444' }} />
                            <div>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>{doc.title}</Typography>
                              <Typography variant="caption" color="text.secondary">{doc.category} • {doc.fileName} ({doc.fileSize})</Typography>
                            </div>
                          </Box>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>{doc.issuingAuthority}</td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          {doc.validFrom} to {doc.expiryDate}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <Chip 
                            label={isValid ? "Statutory Valid" : "Renewal Due"}
                            size="small"
                            color={isValid ? "success" : "warning"}
                            sx={{ fontWeight: 700 }}
                          />
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon fontSize="small" />}
                              onClick={() => setPreviewDoc({
                                id: doc.id,
                                documentType: doc.category,
                                fileName: doc.fileName,
                                fileSize: doc.fileSize,
                                uploadDate: doc.validFrom,
                                verificationStatus: 'VERIFIED',
                                ownerName: doc.title,
                                ownerRole: doc.issuingAuthority,
                                ownerId: `EXP: ${doc.expiryDate}`,
                                remarks: doc.remarks || `Statutory Institutional Certificate issued by ${doc.issuingAuthority}. Valid from ${doc.validFrom} to ${doc.expiryDate}.`,
                                verifiedBy: 'Board of Trustees & Compliance Officer'
                              })}
                              sx={{ textTransform: 'none', fontWeight: 700, color: '#4f46e5', bgcolor: '#eef2ff', '&:hover': { bgcolor: '#e0e7ff' } }}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              startIcon={<FileDownloadIcon fontSize="small" />}
                              onClick={() => handleDownload(doc)}
                              sx={{ textTransform: 'none', fontWeight: 600, color: '#475569' }}
                            >
                              Download
                            </Button>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeleteDoc(doc.id, false)}
                              title="Delete Document"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Paper>
          </Box>
        )}

        {/* TAB 1 (When Scope == SCHOOL_AND_OFFICE): Office Operational Records */}
        {vaultScope === 'SCHOOL_AND_OFFICE' && tabIndex === 1 && (
          <Box>
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #dbeafe', bgcolor: '#eff6ff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Active Office Agreements</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1d4ed8', mt: 0.5 }}>
                    {officeDocs.filter(d => d.status === 'VALID').length}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #fef3c7', bgcolor: '#fffbeb' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Expiring Office Contracts</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#b45309', mt: 0.5 }}>
                    {officeDocs.filter(d => d.status === 'EXPIRING_SOON').length}
                  </Typography>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Office Operational Files</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>{officeDocs.length}</Typography>
                </Card>
              </Grid>
            </Grid>

            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Category & Agreement</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Vendor / Office Authority</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Validity Period</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {officeDocs.map(doc => {
                    const isValid = doc.status === 'VALID';
                    return (
                      <tr key={doc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <BusinessCenterIcon sx={{ color: '#0284c7' }} />
                            <div>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>{doc.title}</Typography>
                              <Typography variant="caption" color="text.secondary">{doc.category} • {doc.fileName} ({doc.fileSize})</Typography>
                            </div>
                          </Box>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>{doc.issuingAuthority}</td>
                        <td style={{ padding: '14px 16px', color: '#475569' }}>
                          {doc.validFrom} to {doc.expiryDate}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <Chip 
                            label={isValid ? "Active Contract" : "Renewal Due"}
                            size="small"
                            color={isValid ? "success" : "warning"}
                            sx={{ fontWeight: 700 }}
                          />
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon fontSize="small" />}
                              onClick={() => setPreviewDoc({
                                id: doc.id,
                                documentType: doc.category,
                                fileName: doc.fileName,
                                fileSize: doc.fileSize,
                                uploadDate: doc.validFrom,
                                verificationStatus: 'VERIFIED',
                                ownerName: doc.title,
                                ownerRole: doc.issuingAuthority,
                                ownerId: `EXP: ${doc.expiryDate}`,
                                remarks: doc.remarks || `Office operational file: ${doc.title}. Issued / Contracted with ${doc.issuingAuthority}.`,
                                verifiedBy: 'School Business Administrator & Legal Counsel'
                              })}
                              sx={{ textTransform: 'none', fontWeight: 700, color: '#0284c7', bgcolor: '#e0f2fe', '&:hover': { bgcolor: '#bae6fd' } }}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              startIcon={<FileDownloadIcon fontSize="small" />}
                              onClick={() => handleDownload(doc)}
                              sx={{ textTransform: 'none', fontWeight: 600, color: '#475569' }}
                            >
                              Download
                            </Button>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleDeleteDoc(doc.id, true)}
                              title="Delete Office Document"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Paper>
          </Box>
        )}

        {/* Staff Personnel Dossiers Link & Access */}
        {((vaultScope === 'SCHOOL_ONLY' && tabIndex === 1) || (vaultScope === 'SCHOOL_AND_OFFICE' && tabIndex === 2)) && (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center', bgcolor: '#ffffff' }}>
            <BadgeIcon sx={{ fontSize: 56, color: '#4f46e5', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Staff Documents & Personnel Vault</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              Access all employee verification files, view individual certificates, and download consolidated Whole PDF staff dossiers.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/hr/documents')}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3, bgcolor: '#4f46e5' }}
            >
              Open Staff Personnel Vault
            </Button>
          </Paper>
        )}

        {/* Student Admission Archives Link & Access */}
        {((vaultScope === 'SCHOOL_ONLY' && tabIndex === 2) || (vaultScope === 'SCHOOL_AND_OFFICE' && tabIndex === 3)) && (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center', bgcolor: '#ffffff' }}>
            <SchoolIcon sx={{ fontSize: 56, color: '#0284c7', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Student Admission Documents & Archives</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              View student birth certificates, transfer certificates, academic progress records, and export student admission dossiers.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/office/documents')}
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700, px: 3, bgcolor: '#0284c7' }}
            >
              Open Student Admission Vault
            </Button>
          </Paper>
        )}

        {/* UPLOAD DOCUMENT MODAL */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            Upload {newDocScope === 'OFFICE' ? 'Office Operational Record' : 'Institutional Compliance Certificate'}
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
              
              {/* Scope Selector if School & Office Mode is Active */}
              {vaultScope === 'SCHOOL_AND_OFFICE' && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                    DOCUMENT REPOSITORY SCOPE
                  </Typography>
                  <RadioGroup 
                    row 
                    value={newDocScope} 
                    onChange={e => {
                      const scope = e.target.value as 'SCHOOL' | 'OFFICE';
                      setNewDocScope(scope);
                      setNewDoc({
                        ...newDoc,
                        category: scope === 'OFFICE' ? 'Vendor Contracts & AMCs' : 'Regulatory Affiliation'
                      });
                    }}
                  >
                    <FormControlLabel value="SCHOOL" control={<Radio size="small" />} label="School Statutory Certificate" />
                    <FormControlLabel value="OFFICE" control={<Radio size="small" />} label="Office Operational Document" />
                  </RadioGroup>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth 
                  label={newDocScope === 'OFFICE' ? 'Agreement / Document Title' : 'Certificate / NOC Title'} 
                  value={newDoc.title} 
                  onChange={e => setNewDoc({ ...newDoc, title: e.target.value })} 
                  required 
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  select 
                  fullWidth 
                  label="Category" 
                  value={newDoc.category} 
                  onChange={e => setNewDoc({ ...newDoc, category: e.target.value })}
                >
                  {(newDocScope === 'OFFICE' ? officeCategories : schoolCategories).map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  fullWidth 
                  label={newDocScope === 'OFFICE' ? 'Contracted Vendor / Authority' : 'Issuing Authority'} 
                  value={newDoc.issuingAuthority} 
                  onChange={e => setNewDoc({ ...newDoc, issuingAuthority: e.target.value })} 
                  required 
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  type="date" 
                  fullWidth 
                  label="Valid From" 
                  slotProps={{ inputLabel: { shrink: true } }} 
                  value={newDoc.validFrom} 
                  onChange={e => setNewDoc({ ...newDoc, validFrom: e.target.value })} 
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField 
                  type="date" 
                  fullWidth 
                  label="Expiry / Renewal Date" 
                  slotProps={{ inputLabel: { shrink: true } }} 
                  value={newDoc.expiryDate} 
                  onChange={e => setNewDoc({ ...newDoc, expiryDate: e.target.value })} 
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField 
                  fullWidth 
                  multiline 
                  rows={2}
                  label="Remarks & Compliance Notes" 
                  value={newDoc.remarks} 
                  onChange={e => setNewDoc({ ...newDoc, remarks: e.target.value })} 
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button variant="outlined" component="label" fullWidth sx={{ py: 2, borderRadius: 2, borderStyle: 'dashed' }}>
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'Attach Document File (PDF / Image)'}
                  <input type="file" hidden accept="image/*,.pdf" onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleSaveDoc} 
              disabled={!newDoc.title || !newDoc.issuingAuthority}
              sx={{ bgcolor: '#0f172a' }}
            >
              Upload & Save
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

export default AdminDocumentVault;
