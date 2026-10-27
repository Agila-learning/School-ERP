import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, TextField, MenuItem, Stack, Button, Alert
} from '@mui/material';
import { getItems, getWarehouses, issueStock, returnStock, transferStock } from '../api/inventory.api';

interface TabPanelProps { children?: React.ReactNode; value: number; index: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>
);

const StockOperations: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  
  const [issueForm, setIssueForm] = useState({ itemId: '', quantity: 1, warehouseId: '', issuedToType: 'EMPLOYEE', remarks: '' });
  const [returnForm, setReturnForm] = useState({ itemId: '', quantity: 1, warehouseId: '', returnedBy: '', remarks: '' });
  const [transferForm, setTransferForm] = useState({ itemId: '', quantity: 1, sourceWarehouseId: '', destinationWarehouseId: '', remarks: '' });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getItems().then(setItems).catch(console.error);
    getWarehouses().then(setWarehouses).catch(console.error);
  }, []);

  const handleIssue = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await issueStock({
        issueNumber: `ISSUE-${Date.now()}`,
        warehouseId: issueForm.warehouseId,
        issuedToType: issueForm.issuedToType,
        items: [{ itemId: issueForm.itemId, quantity: issueForm.quantity }],
        remarks: issueForm.remarks
      });
      setSuccess('Stock issued successfully.');
      setIssueForm({ itemId: '', quantity: 1, warehouseId: '', issuedToType: 'EMPLOYEE', remarks: '' });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to issue stock.');
    } finally { setSaving(false); }
  };

  const handleReturn = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await returnStock({
        returnNumber: `RET-${Date.now()}`,
        warehouseId: returnForm.warehouseId,
        items: [{ itemId: returnForm.itemId, quantity: returnForm.quantity }],
        remarks: returnForm.remarks
      });
      setSuccess('Stock returned successfully.');
      setReturnForm({ itemId: '', quantity: 1, warehouseId: '', returnedBy: '', remarks: '' });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to return stock.');
    } finally { setSaving(false); }
  };

  const handleTransfer = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await transferStock({
        transferNumber: `TRN-${Date.now()}`,
        sourceWarehouseId: transferForm.sourceWarehouseId,
        destinationWarehouseId: transferForm.destinationWarehouseId,
        items: [{ itemId: transferForm.itemId, quantity: transferForm.quantity }],
        remarks: transferForm.remarks
      });
      setSuccess('Stock transfer successful.');
      setTransferForm({ itemId: '', quantity: 1, sourceWarehouseId: '', destinationWarehouseId: '', remarks: '' });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to transfer stock.');
    } finally { setSaving(false); }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Stock Operations</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Issue Stock" />
          <Tab label="Return Stock" />
          <Tab label="Transfer Stock" />
        </Tabs>
      </Paper>

      {/* ISSUE STOCK TAB */}
      <TabPanel value={tab} index={0}>
        <Paper sx={{ p: 3, maxWidth: 600 }}>
          <Stack spacing={3}>
            <Typography variant="h6">Issue Materials to Employee/Department</Typography>
            
            <TextField select label="Warehouse (Source) *" value={issueForm.warehouseId} onChange={e => setIssueForm({...issueForm, warehouseId: e.target.value})} size="small">
              {warehouses.map(w => <MenuItem key={w._id} value={w._id}>{w.name}</MenuItem>)}
            </TextField>
            
            <TextField select label="Item *" value={issueForm.itemId} onChange={e => setIssueForm({...issueForm, itemId: e.target.value})} size="small">
              {items.filter(i => i.trackStock).map(i => <MenuItem key={i._id} value={i._id}>{i.sku} - {i.itemName}</MenuItem>)}
            </TextField>
            
            <TextField label="Quantity *" type="number" value={issueForm.quantity} onChange={e => setIssueForm({...issueForm, quantity: +e.target.value})} size="small" slotProps={{ htmlInput: { min: 1 } }} />
            
            <TextField select label="Issue To Type" value={issueForm.issuedToType} onChange={e => setIssueForm({...issueForm, issuedToType: e.target.value})} size="small">
              {['EMPLOYEE', 'DEPARTMENT', 'STUDENT', 'CLASS', 'OTHER'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            
            <TextField label="Remarks" value={issueForm.remarks} onChange={e => setIssueForm({...issueForm, remarks: e.target.value})} size="small" multiline rows={2} />
            
            <Button variant="contained" onClick={handleIssue} disabled={saving || !issueForm.itemId || !issueForm.warehouseId}>
              {saving ? 'Processing...' : 'Confirm Issue'}
            </Button>
          </Stack>
        </Paper>
      </TabPanel>

      {/* RETURN STOCK TAB */}
      <TabPanel value={tab} index={1}>
        <Paper sx={{ p: 3, maxWidth: 600 }}>
          <Stack spacing={3}>
            <Typography variant="h6">Return Stock to Warehouse</Typography>
            <TextField select label="Warehouse (Destination) *" value={returnForm.warehouseId} onChange={e => setReturnForm({...returnForm, warehouseId: e.target.value})} size="small">
              {warehouses.map(w => <MenuItem key={w._id} value={w._id}>{w.name}</MenuItem>)}
            </TextField>
            <TextField select label="Item *" value={returnForm.itemId} onChange={e => setReturnForm({...returnForm, itemId: e.target.value})} size="small">
              {items.filter(i => i.trackStock).map(i => <MenuItem key={i._id} value={i._id}>{i.sku} - {i.itemName}</MenuItem>)}
            </TextField>
            <TextField label="Quantity *" type="number" value={returnForm.quantity} onChange={e => setReturnForm({...returnForm, quantity: +e.target.value})} size="small" slotProps={{ htmlInput: { min: 1 } }} />
            <TextField label="Remarks / Reason" value={returnForm.remarks} onChange={e => setReturnForm({...returnForm, remarks: e.target.value})} size="small" multiline rows={2} />
            <Button variant="contained" onClick={handleReturn} disabled={saving || !returnForm.itemId || !returnForm.warehouseId}>
              {saving ? 'Processing...' : 'Confirm Return'}
            </Button>
          </Stack>
        </Paper>
      </TabPanel>

      {/* TRANSFER STOCK TAB */}
      <TabPanel value={tab} index={2}>
        <Paper sx={{ p: 3, maxWidth: 600 }}>
          <Stack spacing={3}>
            <Typography variant="h6">Transfer Stock Between Warehouses</Typography>
            <Stack direction="row" spacing={2}>
              <TextField select label="Source Warehouse *" value={transferForm.sourceWarehouseId} onChange={e => setTransferForm({...transferForm, sourceWarehouseId: e.target.value})} size="small" fullWidth>
                {warehouses.map(w => <MenuItem key={w._id} value={w._id}>{w.name}</MenuItem>)}
              </TextField>
              <TextField select label="Destination Warehouse *" value={transferForm.destinationWarehouseId} onChange={e => setTransferForm({...transferForm, destinationWarehouseId: e.target.value})} size="small" fullWidth>
                {warehouses.map(w => <MenuItem key={w._id} value={w._id}>{w.name}</MenuItem>)}
              </TextField>
            </Stack>
            <TextField select label="Item *" value={transferForm.itemId} onChange={e => setTransferForm({...transferForm, itemId: e.target.value})} size="small">
              {items.filter(i => i.trackStock).map(i => <MenuItem key={i._id} value={i._id}>{i.sku} - {i.itemName}</MenuItem>)}
            </TextField>
            <TextField label="Quantity *" type="number" value={transferForm.quantity} onChange={e => setTransferForm({...transferForm, quantity: +e.target.value})} size="small" slotProps={{ htmlInput: { min: 1 } }} />
            <TextField label="Remarks / Reason" value={transferForm.remarks} onChange={e => setTransferForm({...transferForm, remarks: e.target.value})} size="small" multiline rows={2} />
            <Button variant="contained" onClick={handleTransfer} disabled={saving || !transferForm.itemId || !transferForm.sourceWarehouseId || !transferForm.destinationWarehouseId || (transferForm.sourceWarehouseId === transferForm.destinationWarehouseId)}>
              {saving ? 'Processing...' : 'Confirm Transfer'}
            </Button>
          </Stack>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default StockOperations;
