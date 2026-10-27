import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Grid } from '@mui/material';
import { Add, Delete, CloudUpload, Link as LinkIcon, MenuBook } from '@mui/icons-material';
import { getLearningMaterials, createLearningMaterial, deleteLearningMaterial } from '../api/lms.api';
import api from '../../../core/api/axios';
import dayjs from 'dayjs';

const LearningMaterialManager = () => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'DOCUMENT',
    fileUrl: '',
    classId: '',
    subjectId: ''
  });

  useEffect(() => {
    fetchMaterials();
    fetchOptions();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await getLearningMaterials();
      setMaterials(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOptions = async () => {
    try {
      const classRes = await api.get('/academic/classes');
      setClasses(classRes.data.data?.data || classRes.data.data || []);
      const subjectRes = await api.get('/academic/subjects');
      setSubjects(subjectRes.data.data?.data || subjectRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLearningMaterial(formData);
      setOpenModal(false);
      setFormData({
        title: '', description: '', type: 'DOCUMENT', fileUrl: '', classId: '', subjectId: ''
      });
      fetchMaterials();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create material');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await deleteLearningMaterial(id);
        fetchMaterials();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <CloudUpload color="error" />;
      case 'LINK': return <LinkIcon color="info" />;
      default: return <MenuBook color="primary" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>Learning Materials</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)}>
          Upload Material
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: 'background.default' }}>
            <TableRow>
              <TableCell>Material</TableCell>
              <TableCell>Class/Subject</TableCell>
              <TableCell>Uploaded</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {materials.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getIcon(item.type)}
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.title}</Typography>
                      <Chip size="small" label={item.type} sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{item.classId?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.subjectId?.name}</Typography>
                </TableCell>
                <TableCell>{dayjs(item.createdAt).format('DD MMM YYYY')}</TableCell>
                <TableCell align="right">
                  <Button size="small" href={item.fileUrl} target="_blank" variant="outlined" sx={{ mr: 1 }}>View</Button>
                  <IconButton size="small" color="error" onClick={() => handleDelete(item._id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {materials.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>No learning materials found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Learning Material</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth select label="Class" name="classId" value={formData.classId} onChange={handleChange} required>
                  {classes.map(c => <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth select label="Subject" name="subjectId" value={formData.subjectId} onChange={handleChange} required>
                  {subjects.map(s => <MenuItem key={s._id || s.id} value={s._id || s.id}>{s.name} {s.code && s.code !== s.name ? `(${s.code})` : ''}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth select label="Material Type" name="type" value={formData.type} onChange={handleChange} required>
                  <MenuItem value="DOCUMENT">Document (PDF/Word)</MenuItem>
                  <MenuItem value="VIDEO">Video</MenuItem>
                  <MenuItem value="LINK">External Link</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="URL / File Link" name="fileUrl" value={formData.fileUrl} onChange={handleChange} required />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={3} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Upload</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LearningMaterialManager;
