import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Button, Chip, TextField, MenuItem, Stack, Dialog, DialogTitle, DialogContent,
  DialogActions, Alert, CircularProgress, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { getItems, createItem, getCategories, createCategory } from '../api/inventory.api';

const itemTypeColors: Record<string, any> = {
  CONSUMABLE: 'info', NON_CONSUMABLE: 'primary', ASSET: 'secondary',
  SERVICE: 'default', SPARE_PART: 'warning', DIGITAL: 'success'
};

const ProductCatalog: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const [form, setForm] = useState<any>({
    sku: '', itemName: '', categoryId: '', itemType: 'CONSUMABLE', unit: 'Piece', trackStock: true
  });
  const [catForm, setCatForm] = useState({ name: '', code: '', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const itms = await getItems();
      setItems(itms);
      const cats = await getCategories();
      setCategories(cats);
    } catch (e) {
      setError('Failed to load products or categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async () => {
    if (!form.sku || !form.itemName || !form.categoryId) { setError('SKU, Name, and Category are required.'); return; }
    setSaving(true);
    try {
      await createItem(form);
      setOpenCreate(false);
      setForm({ sku: '', itemName: '', categoryId: '', itemType: 'CONSUMABLE', unit: 'Piece', trackStock: true });
      fetchItems();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create item.');
    } finally { setSaving(false); }
  };

  const handleCreateCategory = async () => {
    if (!catForm.name || !catForm.code) { setError('Category Name and Code are required.'); return; }
    setSaving(true);
    try {
      await createCategory(catForm);
      setCatForm({ name: '', code: '', description: '' });
      fetchItems();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to create category.');
    } finally { setSaving(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Product Catalog (Item Master)</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => setOpenCategoryModal(true)}>
            Manage Categories
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
            Add Item
          </Button>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField label="Search Items" size="small" sx={{ minWidth: 250 }} />
        <TextField select label="Item Type" size="small" sx={{ minWidth: 150 }} defaultValue="">
          <MenuItem value="">All Types</MenuItem>
          {['CONSUMABLE', 'NON_CONSUMABLE', 'ASSET', 'SERVICE'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </TextField>
      </Stack>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Stock Tracking</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center">No items found in catalog.</TableCell></TableRow>
              ) : items.map((item: any) => (
                <TableRow key={item._id} hover>
                  <TableCell><code>{item.sku}</code></TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>{item.itemName}</Typography>
                    {item.brand && <Typography variant="caption" color="text.secondary">{item.brand}</Typography>}
                  </TableCell>
                  <TableCell><Chip label={item.itemType} size="small" color={itemTypeColors[item.itemType]} /></TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.categoryId?.name || '—'}</TableCell>
                  <TableCell>
                    {item.trackStock ? <Chip label="Yes" color="success" size="small" /> : <Chip label="No" size="small" />}
                  </TableCell>
                  <TableCell><Chip label={item.isActive ? 'Active' : 'Inactive'} size="small" color={item.isActive ? 'success' : 'default'} /></TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="SKU (Item Code) *" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} fullWidth size="small" />
            <TextField label="Item Name *" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} fullWidth size="small" />
            
            <Stack direction="row" spacing={2}>
              <TextField select label="Item Type" value={form.itemType} onChange={e => setForm({ ...form, itemType: e.target.value })} fullWidth size="small">
                {['CONSUMABLE', 'NON_CONSUMABLE', 'ASSET', 'SERVICE', 'SPARE_PART'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} fullWidth size="small" placeholder="E.g. Piece, Box, Kg" />
            </Stack>
            
            <TextField label="Brand / Make" value={form.brand || ''} onChange={e => setForm({ ...form, brand: e.target.value })} fullWidth size="small" />
            <TextField label="Description" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} fullWidth size="small" multiline rows={2} />
            
            <Stack direction="row" spacing={2}>
              <TextField select label="Category *" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} fullWidth size="small">
                {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </TextField>
              <TextField select label="Track Stock?" value={form.trackStock ? 'yes' : 'no'} onChange={e => setForm({ ...form, trackStock: e.target.value === 'yes' })} fullWidth size="small">
                <MenuItem value="yes">Yes, manage inventory balance</MenuItem>
                <MenuItem value="no">No, only track purchases</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? 'Saving...' : 'Save Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Categories Modal */}
      <Dialog open={openCategoryModal} onClose={() => setOpenCategoryModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Categories</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Typography variant="subtitle2">Add New Category</Typography>
            <Stack direction="row" spacing={2}>
              <TextField label="Code *" value={catForm.code} onChange={e => setCatForm({...catForm, code: e.target.value})} size="small" />
              <TextField label="Name *" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} size="small" fullWidth />
            </Stack>
            <TextField label="Description" value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} size="small" fullWidth />
            <Button variant="contained" onClick={handleCreateCategory} disabled={saving}>Add Category</Button>
          </Stack>
          
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Existing Categories</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map(c => (
                <TableRow key={c._id}>
                  <TableCell>{c.code}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.isActive ? 'Active' : 'Inactive'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductCatalog;
