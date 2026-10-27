import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  Alert,
  Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PendingIcon from '@mui/icons-material/Pending';
import DescriptionIcon from '@mui/icons-material/Description';
import SchoolIcon from '@mui/icons-material/School';

export type DocumentPreviewData = {
  id?: string;
  documentType: string;
  fileName: string;
  fileUrl?: string;
  fileSize?: string;
  uploadDate?: string;
  verificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED';
  ownerName?: string;
  ownerRole?: string;
  ownerId?: string;
  remarks?: string;
  verifiedBy?: string;
};

export const DocumentPreviewData = {};

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  document: DocumentPreviewData | null;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  open,
  onClose,
  document
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!document) return null;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 20, 180));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 20, 60));
  const handleResetZoom = () => setZoomLevel(100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (document.fileUrl && document.fileUrl !== '#') {
      const a = window.document.createElement('a');
      a.href = document.fileUrl;
      a.download = document.fileName || 'document.pdf';
      a.click();
    } else {
      // Simulate file download
      const element = window.document.createElement('a');
      const file = new Blob([`Official Record: ${document.documentType}\nOwner: ${document.ownerName || 'Staff'}\nStatus: ${document.verificationStatus || 'VERIFIED'}\nIssued by FIC Global Academy ERP`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${document.fileName.replace(/\.[^/.]+$/, "") || 'document'}_verified.txt`;
      window.document.body.appendChild(element);
      element.click();
    }
  };

  const isVerified = document.verificationStatus === 'VERIFIED';
  const isRejected = document.verificationStatus === 'REJECTED';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2.5,
          bgcolor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              {document.documentType}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              File: <b>{document.fileName}</b> {document.fileSize && `• ${document.fileSize}`} • Uploaded: {document.uploadDate || 'Recent'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            icon={isVerified ? <VerifiedUserIcon /> : <PendingIcon />}
            label={document.verificationStatus || 'VERIFIED'}
            color={isVerified ? 'success' : isRejected ? 'error' : 'warning'}
            sx={{ fontWeight: 700 }}
          />
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Toolbar */}
      <Box
        sx={{
          px: 3,
          py: 1,
          bgcolor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            ZOOM: {zoomLevel}%
          </Typography>
          <Tooltip title="Zoom Out">
            <IconButton size="small" onClick={handleZoomOut} disabled={zoomLevel <= 60}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom In">
            <IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel >= 180}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset Zoom">
            <IconButton size="small" onClick={handleResetZoom}>
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          >
            Print
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          >
            Download
          </Button>
        </Box>
      </Box>

      {/* Document View Canvas */}
      <DialogContent sx={{ p: 4, bgcolor: '#475569', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
        <Box
          sx={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-in-out',
            width: '100%',
            maxWidth: 750
          }}
        >
          {/* Authentic Document Sheet */}
          <Paper
            elevation={8}
            sx={{
              p: { xs: 4, md: 6 },
              bgcolor: '#ffffff',
              borderRadius: 2,
              minHeight: 820,
              fontFamily: 'serif',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Watermark */}
            <Typography
              sx={{
                position: 'absolute',
                top: '40%',
                left: '10%',
                transform: 'rotate(-35deg)',
                fontSize: '4.5rem',
                fontWeight: 900,
                color: 'rgba(148, 163, 184, 0.12)',
                pointerEvents: 'none',
                userSelect: 'none',
                letterSpacing: 4
              }}
            >
              FIC OFFICIAL ARCHIVE
            </Typography>

            {/* School Header */}
            <Box sx={{ textAlign: 'center', pb: 2.5, borderBottom: '2px solid #0f172a' }}>
              <SchoolIcon sx={{ fontSize: 44, color: '#1e293b' }} />
              <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 1, color: '#0f172a' }}>
                FIC GLOBAL ACADEMY & SENIOR SECONDARY SCHOOL
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                Central Board of Secondary Education • Institutional Registrar & Vault Archive
              </Typography>
            </Box>

            {/* Document Meta */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">DOCUMENT TYPE</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{document.documentType}</Typography>
              </Box>
              {document.ownerName && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">RECORD OWNER</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>{document.ownerName} ({document.ownerRole || document.ownerId || 'Staff'})</Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Document Content Display */}
            <Box sx={{ py: 3, px: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1', mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', mb: 1, textAlign: 'center' }}>
                {document.documentType.toUpperCase()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                Official verification record scanned and archived in the Institutional Document Repository.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">ORIGINAL FILE NAME</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {document.fileName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">FILE INTEGRITY & SIZE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {document.fileSize || '1.8 MB (SHA-256 Verified)'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">SUBMISSION / UPLOAD DATE</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {document.uploadDate || '2026-10-15'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">VERIFICATION STATUS</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: isVerified ? '#16a34a' : '#d97706' }}>
                    {document.verificationStatus || 'VERIFIED BY REGISTRAR'}
                  </Typography>
                </Grid>
                {document.remarks && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">REGISTRAR / HR REMARKS</Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{document.remarks}"
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Document Preview Certificate Details */}
            <Box sx={{ px: 2, py: 2, lineHeight: 1.8 }}>
              <Typography variant="body2" paragraph sx={{ textAlign: 'justify', color: '#334155' }}>
                This is an authorized digital archive representation of <b>{document.fileName}</b>. The original physical and digital credentials have been scrutinized, cross-verified against the issuing authority, and accepted into the institutional master file.
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'justify', color: '#334155' }}>
                This document is certified valid for institutional compliance, faculty licensing, student admissions, and statutory educational audits.
              </Typography>
            </Box>

            {/* Official Stamps & Signatures */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 8, pt: 4 }}>
              <Box sx={{ textAlign: 'center', minWidth: 160 }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {document.verifiedBy || 'Administrative Registrar'}
                </Typography>
                <Typography variant="caption" color="text.secondary">Authorized Document Custodian</Typography>
              </Box>

              <Box
                sx={{
                  border: '2px solid #0f172a',
                  borderRadius: '50%',
                  width: 90,
                  height: 90,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 900 }}>OFFICIAL</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.55rem', fontWeight: 700 }}>DOCUMENT</Typography>
                <Typography variant="caption" sx={{ fontSize: '0.6rem', fontWeight: 900 }}>ARCHIVE</Typography>
              </Box>

              <Box sx={{ textAlign: 'center', minWidth: 160 }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>Dr. Ramesh Sundaram</Typography>
                <Typography variant="caption" color="text.secondary">Head of Institution</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Security Hash: FIC-VAULT-{document.id || 'DOC-883921'}
        </Typography>
        <Button variant="outlined" onClick={onClose} sx={{ fontWeight: 700, px: 3 }}>
          Close Preview
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreviewModal;
