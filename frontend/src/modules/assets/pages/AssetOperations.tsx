import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, TextField, MenuItem, Stack, Button, Alert
} from '@mui/material';
import { getAssets, allocateAsset, returnAsset, transferAsset } from '../api/asset.api';

interface TabPanelProps { children?: React.ReactNode; value: number; index: number; }
const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ pt: 2 }}>{children}</Box>}</div>
);

const AssetOperations: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [assets, setAssets] = useState<any[]>([]);
  
  const [allocForm, setAllocForm] = useState({ assetId: '', allocatedToType: 'EMPLOYEE', allocatedToEmployeeId: '', conditionAtAllocation: 'GOOD' });
  const [returnForm, setReturnForm] = useState({ assetId: '', condition: 'GOOD', remarks: '' });
  const [transferForm, setTransferForm] = useState({ assetId: '', newEmployeeId: '', newDepartmentId: '', location: '', reason: '' });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getAssets().then(setAssets).catch(console.error);
  }, []);

  const handleAllocate = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await allocateAsset(allocForm.assetId, allocForm);
      setSuccess('Asset allocated successfully.');
      setAllocForm({ assetId: '', allocatedToType: 'EMPLOYEE', allocatedToEmployeeId: '', conditionAtAllocation: 'GOOD' });
      getAssets().then(setAssets);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to allocate asset.');
    } finally { setSaving(false); }
  };

  const handleReturn = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await returnAsset(returnForm.assetId, { condition: returnForm.condition, remarks: returnForm.remarks });
      setSuccess('Asset returned successfully.');
      setReturnForm({ assetId: '', condition: 'GOOD', remarks: '' });
      getAssets().then(setAssets);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to return asset.');
    } finally { setSaving(false); }
  };

  const handleTransfer = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      await transferAsset(transferForm.assetId, transferForm);
      setSuccess('Asset transferred successfully.');
      setTransferForm({ assetId: '', newEmployeeId: '', newDepartmentId: '', location: '', reason: '' });
      getAssets().then(setAssets);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to transfer asset.');
    } finally { setSaving(false); }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Asset Operations</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Allocate Asset" />
          <Tab label="Return Asset" />
          <Tab label="Transfer Asset" />
        </Tabs>
      </Paper>

      {/* ALLOCATE ASSET TAB */}
      <TabPanel value={tab} index={0}>
        <Paper sx={{ p: 3, maxWidth: 600 }}>
          <Stack spacing={3}>
            <Typography variant="h6">Assign Asset to Custodian</Typography>
            
            <TextField select label="Asset *" value={allocForm.assetId} onChange={e => setAllocForm({...allocForm, assetId: e.target.value})} size="small">
              {assets.filter(a => a.status === 'AVAILABLE').map(a => (
                <MenuItem key={a._id} value={a._id}>{a.assetTag} - {a.itemId?.itemName}</MenuItem>
              ))}
            </TextField>
            
            <TextField select label="Assign To Type" value={allocForm.allocatedToType} onChange={e => setAllocForm({...allocForm, allocatedToType: e.target.value})} size="small">
              {['EMPLOYEE', 'DEPARTMENT'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            
            <TextField label="Assign To ID *" helperText="Enter Employee or Dept ID" value={allocForm.allocatedToEmployeeId} onChange={e => setAllocForm({...allocForm, allocatedToEmployeeId: e.target.value})} size="small" />
            
            <TextField select label="Condition" value={allocForm.conditionAtAllocation} onChange={e => setAllocForm({...allocForm, conditionAtAllocation: e.target.value})} size="small">
              {['NEW', 'GOOD', 'FAIR'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            
            <Button variant="contained" onClick={handleAllocate} disabled={saving || !allocForm.assetId || !allocForm.allocatedToEmployeeId}>
              {saving ? 'Processing...' : 'Confirm Allocation'}
            </Button>
          </Stack>
        </Paper>
      </TabPanel>

      {/* RETURN ASSET TAB */}
      <TabPanel value={tab} index={1}>
        <Paper sx={{ p: 3, maxWidth: 600 }}>
          <Stack spacing={3}>
            <Typography variant="h6">Process Asset Return</Typography>
            <TextField select label="Asset *" value={returnForm.assetId} onChange={e => setReturnForm({...returnForm, assetId: e.target.value})} size="small">
              {assets.filter(a => a.status === 'ASSIGNED').map(a => (
                <MenuItem key={a._id} value={a._id}>{a.assetTag} - {a.itemId?.itemName}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Condition Upon Return" value={returnForm.condition} onChange={e => setReturnForm({...returnForm, condition: e.target.value})} size="small">
              {['GOOD', 'FAIR', 'DAMAGED', 'NEEDS_REPAIR'].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField label="Remarks" value={returnForm.remarks} onChange={e => setReturnForm({...returnForm, remarks: e.target.value})} size="small" multiline rows={2} />
            <Button variant="contained" onClick={handleReturn} disabled={saving || !returnForm.assetId}>
              {saving ? 'Processing...' : 'Confirm Return'}
            </Button>
          </Stack>
        </Paper>
      </TabPanel>

      {/* TRANSFER ASSET TAB */}
      <TabPanel value={tab} index={2}>
        <Paper sx={{ p: 3, maxWidth: 600 }}>
          <Stack spacing={3}>
            <Typography variant="h6">Transfer Asset Custodianship</Typography>
            <TextField select label="Asset *" value={transferForm.assetId} onChange={e => setTransferForm({...transferForm, assetId: e.target.value})} size="small">
              {assets.filter(a => a.status === 'ASSIGNED').map(a => (
                <MenuItem key={a._id} value={a._id}>{a.assetTag} - {a.itemId?.itemName}</MenuItem>
              ))}
            </TextField>
            <TextField label="New Employee ID" helperText="Leave blank if transferring to a department" value={transferForm.newEmployeeId} onChange={e => setTransferForm({...transferForm, newEmployeeId: e.target.value})} size="small" />
            <TextField label="Reason for Transfer" value={transferForm.reason} onChange={e => setTransferForm({...transferForm, reason: e.target.value})} size="small" multiline rows={2} />
            <Button variant="contained" onClick={handleTransfer} disabled={saving || !transferForm.assetId}>
              {saving ? 'Processing...' : 'Confirm Transfer'}
            </Button>
          </Stack>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default AssetOperations;
