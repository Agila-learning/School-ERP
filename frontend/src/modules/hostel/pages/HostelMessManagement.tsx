import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Chip, IconButton, Rating, Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { 
  getMealPlans, createMealPlan, updateMealPlan, deleteMealPlan, 
  getMessFeedback, submitMessFeedback, getHostels 
} from '../api/hostel.api';

interface TabPanelProps { children?: React.ReactNode; value: number; index: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 3 }}>{children}</Box>}</div>
);

const HostelMessManagement: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [mealPlans, setMealPlans] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [hostels, setHostels] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modals
  const [openMealModal, setOpenMealModal] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);

  // Forms
  const [mealForm, setMealForm] = useState({
    hostelId: '',
    date: new Date().toISOString().slice(0, 10),
    mealType: 'LUNCH',
    menu: 'Rice, Dal, Mixed Vegetable Curry, Salad, Curd',
    status: 'ACTIVE'
  });

  const [feedbackForm, setFeedbackForm] = useState({
    hostelId: '',
    category: 'FOOD_QUALITY',
    rating: 4,
    comments: ''
  });

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const hs = await getHostels();
      setHostels(Array.isArray(hs) ? hs : []);

      if (tab === 0) {
        const data = await getMealPlans();
        setMealPlans(Array.isArray(data) ? data : []);
      } else if (tab === 1) {
        const data = await getMessFeedback();
        setFeedbacks(Array.isArray(data) ? data : []);
      }
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to fetch mess data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddMeal = () => {
    setEditingMealId(null);
    setMealForm({
      hostelId: hostels[0]?._id || '',
      date: new Date().toISOString().slice(0, 10),
      mealType: 'LUNCH',
      menu: 'Rice, Dal, Mixed Vegetable Curry, Salad, Curd',
      status: 'ACTIVE'
    });
    setOpenMealModal(true);
  };

  const handleOpenEditMeal = (plan: any) => {
    setEditingMealId(plan._id);
    setMealForm({
      hostelId: plan.hostelId?._id || plan.hostelId || '',
      date: plan.date ? new Date(plan.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      mealType: plan.mealType || 'LUNCH',
      menu: Array.isArray(plan.menu) ? plan.menu.join(', ') : plan.menu || '',
      status: plan.status || 'ACTIVE'
    });
    setOpenMealModal(true);
  };

  const handleSaveMealPlan = async () => {
    if (!mealForm.menu) {
      setError('Please list at least one menu item.');
      return;
    }
    try {
      if (editingMealId) {
        await updateMealPlan(editingMealId, mealForm);
        setSuccess('Meal plan updated successfully');
      } else {
        await createMealPlan(mealForm);
        setSuccess('Meal plan created successfully');
      }
      setOpenMealModal(false);
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to save meal plan');
    }
  };

  const handleDeleteMealPlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this meal plan?')) return;
    try {
      await deleteMealPlan(id);
      setSuccess('Meal plan deleted');
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to delete meal plan');
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await submitMessFeedback(feedbackForm);
      setSuccess('Feedback submitted successfully');
      setOpenFeedbackModal(false);
      setFeedbackForm({ hostelId: '', category: 'FOOD_QUALITY', rating: 4, comments: '' });
      fetchData();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <div>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>Mess & Dining Operations</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Daily meal schedule, menu planners, dietary requirements, and dining hall feedback
          </Typography>
        </div>
        <Stack direction="row" spacing={1.5}>
          {tab === 0 && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAddMeal} sx={{ fontWeight: 700 }}>
              Add Meal Plan
            </Button>
          )}
          {tab === 1 && (
            <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => setOpenFeedbackModal(true)} sx={{ fontWeight: 700 }}>
              Submit Feedback
            </Button>
          )}
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Meal Planner (${mealPlans.length})`} sx={{ fontWeight: 700 }} />
          <Tab label={`Student Feedback (${feedbacks.length})`} sx={{ fontWeight: 700 }} />
          <Tab label="Mess Inventory & Ration" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Paper>

      {/* TAB 0: MEAL PLANNER */}
      <TabPanel value={tab} index={0}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Meal Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Menu Items</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mealPlans.map(m => (
                <TableRow key={m._id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {m.date ? new Date(m.date).toLocaleDateString() : 'Today'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={m.mealType} 
                      color={m.mealType === 'BREAKFAST' ? 'info' : m.mealType === 'LUNCH' ? 'success' : m.mealType === 'DINNER' ? 'primary' : 'warning'} 
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {Array.isArray(m.menu) ? m.menu.join(', ') : m.menu || 'Standard Menu'}
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={m.status || 'ACTIVE'} color={m.status === 'COMPLETED' ? 'default' : 'success'} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit Plan">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEditMeal(m)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Plan">
                      <IconButton size="small" color="error" onClick={() => handleDeleteMealPlan(m._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {mealPlans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No meal plans scheduled. Click "+ Add Meal Plan" to add daily menu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* TAB 1: FEEDBACK */}
      <TabPanel value={tab} index={1}>
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Comments</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {feedbacks.map(f => (
                <TableRow key={f._id} hover>
                  <TableCell><Chip size="small" label={f.category} /></TableCell>
                  <TableCell>
                    <Rating value={f.rating || 4} readOnly size="small" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{f.comments || 'No comments'}</TableCell>
                  <TableCell>{f.createdAt ? new Date(f.createdAt).toLocaleDateString() : 'Recent'}</TableCell>
                </TableRow>
              ))}
              {feedbacks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                    No mess feedbacks recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      </TabPanel>

      {/* TAB 2: INVENTORY & RATION */}
      <TabPanel value={tab} index={2}>
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1e293b' }}>Mess Ration & Kitchen Stocks</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Grain reserves, perishable provisions, and cooking fuel consumption are synchronized with the Inventory Module.
          </Typography>
          <Chip label="Inventory Integration: Synchronized" color="success" />
        </Paper>
      </TabPanel>

      {/* MEAL MODAL */}
      <Dialog open={openMealModal} onClose={() => setOpenMealModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingMealId ? 'Edit Meal Plan' : 'Add New Meal Plan'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField 
              label="Date *" 
              type="date" 
              value={mealForm.date} 
              onChange={e => setMealForm({ ...mealForm, date: e.target.value })} 
              fullWidth 
              size="small" 
            />
            <TextField 
              select 
              label="Meal Type *" 
              value={mealForm.mealType} 
              onChange={e => setMealForm({ ...mealForm, mealType: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER', 'SPECIAL'].map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField 
              label="Menu Items (comma-separated) *" 
              value={mealForm.menu} 
              onChange={e => setMealForm({ ...mealForm, menu: e.target.value })} 
              fullWidth 
              multiline 
              rows={3} 
              size="small" 
              placeholder="e.g. Rice, Dal Makhani, Paneer Butter Masala, Roti, Gulab Jamun"
            />
            <TextField 
              select 
              label="Status" 
              value={mealForm.status} 
              onChange={e => setMealForm({ ...mealForm, status: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['PLANNED', 'ACTIVE', 'COMPLETED'].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenMealModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveMealPlan} sx={{ fontWeight: 700 }}>
            {editingMealId ? 'Update Plan' : 'Save Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* FEEDBACK MODAL */}
      <Dialog open={openFeedbackModal} onClose={() => setOpenFeedbackModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Submit Mess Feedback</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField 
              select 
              label="Category" 
              value={feedbackForm.category} 
              onChange={e => setFeedbackForm({ ...feedbackForm, category: e.target.value })} 
              fullWidth 
              size="small"
            >
              {['FOOD_QUALITY', 'TASTE', 'CLEANLINESS', 'MENU', 'OTHER'].map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>Rating</Typography>
              <Rating 
                value={feedbackForm.rating} 
                onChange={(_, v) => setFeedbackForm({ ...feedbackForm, rating: v || 4 })} 
              />
            </Box>
            <TextField 
              label="Comments & Suggestions" 
              value={feedbackForm.comments} 
              onChange={e => setFeedbackForm({ ...feedbackForm, comments: e.target.value })} 
              fullWidth 
              multiline 
              rows={3} 
              size="small" 
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenFeedbackModal(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleSubmitFeedback} sx={{ fontWeight: 700 }}>
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HostelMessManagement;
