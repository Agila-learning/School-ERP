import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Grid, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { createAssignment, updateAssignment, getAssignmentById } from '../api/lms.api';
import api from '../../../core/api/axios'; // For fetching classes/subjects

const AssignmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'HOMEWORK',
    classId: '',
    subjectId: '',
    dueDate: '',
    maxMarks: 100,
    submissionType: 'ONLINE_TEXT',
    allowLateSubmission: false,
    allowResubmission: false
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchOptions();
    if (isEdit) {
      fetchAssignment();
    }
  }, [id]);

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

  const fetchAssignment = async () => {
    try {
      const res = await getAssignmentById(id as string);
      const data = res.data.data;
      setFormData({
        title: data.title,
        description: data.description,
        type: data.type,
        classId: data.classId?._id || data.classId,
        subjectId: data.subjectId?._id || data.subjectId,
        dueDate: new Date(data.dueDate).toISOString().slice(0, 16),
        maxMarks: data.maxMarks,
        submissionType: data.submissionType,
        allowLateSubmission: data.allowLateSubmission,
        allowResubmission: data.allowResubmission
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateAssignment(id as string, formData);
      } else {
        await createAssignment(formData);
      }
      navigate('/lms/assignments');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save assignment. See console for details.';
      alert(errMsg);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold" }} mb={3}>
        {isEdit ? 'Edit Assignment' : 'Create New Assignment'}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField 
                fullWidth label="Title" name="title" 
                value={formData.title} onChange={handleChange} required 
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth select label="Type" name="type" 
                value={formData.type} onChange={handleChange} required
              >
                <MenuItem value="HOMEWORK">Homework</MenuItem>
                <MenuItem value="CLASSWORK">Classwork</MenuItem>
                <MenuItem value="PROJECT">Project</MenuItem>
                <MenuItem value="ACTIVITY">Activity</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField 
                fullWidth label="Description / Instructions" name="description" 
                value={formData.description} onChange={handleChange} multiline rows={4} required 
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth select label="Class" name="classId" 
                value={formData.classId} onChange={handleChange} required
              >
                {classes.map(c => <MenuItem key={c._id || c.id} value={c._id || c.id}>{c.name}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth select label="Subject" name="subjectId" 
                value={formData.subjectId} onChange={handleChange} required
              >
                {subjects.map(s => <MenuItem key={s._id || s.id} value={s._id || s.id}>{s.name} {s.code && s.code !== s.name ? `(${s.code})` : ''}</MenuItem>)}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth label="Due Date" name="dueDate" type="datetime-local"
                value={formData.dueDate} onChange={handleChange} required InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth label="Maximum Marks" name="maxMarks" type="number"
                value={formData.maxMarks} onChange={handleChange} required 
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField 
                fullWidth select label="Submission Type" name="submissionType" 
                value={formData.submissionType} onChange={handleChange} required
              >
                <MenuItem value="ONLINE_TEXT">Online Text</MenuItem>
                <MenuItem value="FILE_UPLOAD">File Upload</MenuItem>
                <MenuItem value="OFFLINE">Offline (In Class)</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel 
                control={<Switch checked={formData.allowLateSubmission} onChange={handleChange} name="allowLateSubmission" />} 
                label="Allow Late Submissions" 
              />
              <FormControlLabel 
                control={<Switch checked={formData.allowResubmission} onChange={handleChange} name="allowResubmission" />} 
                label="Allow Multiple Attempts / Resubmissions" 
              />
            </Grid>

            <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
              <Button variant="contained" type="submit" size="large">
                {isEdit ? 'Update Assignment' : 'Save as Draft'}
              </Button>
              <Button variant="outlined" sx={{ ml: 2 }} size="large" onClick={() => navigate('/lms/assignments')}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AssignmentForm;
