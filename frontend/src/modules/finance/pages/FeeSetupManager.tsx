import React, { useState, useEffect } from 'react';
import { getFeeHeads, getFeeStructures, getDiscounts, createFeeHead, createFeeStructure, createDiscount, updateFeeHead, updateFeeStructure, updateDiscount, deactivateFeeHead, deactivateFeeStructure, deactivateDiscount } from '../api/finance.api';
import type { FeeHead, FeeStructure, ScholarshipDiscount } from '../api/finance.api';
import { getAcademicYears, getBranches, getClasses } from '../../academic/api/academic.api';
import { Box, Typography, Paper, Tabs, Tab, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControl, InputLabel, Select, IconButton } from '@mui/material';
import Layout from '../../../core/components/Layout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const FeeSetupManager: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  
  // Data
  const [feeHeads, setFeeHeads] = useState<FeeHead[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [discounts, setDiscounts] = useState<ScholarshipDiscount[]>([]);
  
  // Lookups
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  // Modal State
  const [headModal, setHeadModal] = useState({ open: false, isEdit: false, data: {} as Partial<FeeHead> });
  const [structModal, setStructModal] = useState({ open: false, isEdit: false, data: {} as Partial<FeeStructure> });
  const [discountModal, setDiscountModal] = useState({ open: false, isEdit: false, data: {} as Partial<ScholarshipDiscount> });

  const fetchData = async () => {
    try {
      if (tabIndex === 0) setFeeHeads(await getFeeHeads());
      if (tabIndex === 1) setStructures(await getFeeStructures());
      if (tabIndex === 2) setDiscounts(await getDiscounts());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tabIndex]);

  useEffect(() => {
    getAcademicYears().then(res => setAcademicYears(res || []));
    getBranches().then(res => setBranches(res || []));
    getClasses().then(res => setClasses(res || []));
    getFeeHeads().then(setFeeHeads);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // --- Head CRUD ---
  const saveHead = async () => {
    try {
      if (headModal.isEdit && headModal.data._id) {
        await updateFeeHead(headModal.data._id, headModal.data);
      } else {
        await createFeeHead(headModal.data);
      }
      setHeadModal({ open: false, isEdit: false, data: {} });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const deleteHead = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this head?')) return;
    try {
      await deactivateFeeHead(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const getFeeHeadName = (feeHeadId: any) => {
    if (!feeHeadId) return 'N/A';
    if (typeof feeHeadId === 'object') return feeHeadId.name || feeHeadId.title || feeHeadId.code || 'Fee Head';
    const found = feeHeads.find(h => h._id === feeHeadId || (h as any).id === feeHeadId);
    return found?.name || String(feeHeadId);
  };

  const getClassName = (classId: any) => {
    if (!classId) return 'All Classes';
    if (typeof classId === 'object') return classId.name || classId.code || 'Class';
    const found = classes.find(c => c._id === classId || (c as any).id === classId);
    return found?.name || String(classId);
  };

  // --- Structure CRUD ---
  const saveStruct = async () => {
    try {
      const payload: any = { ...structModal.data };
      if (!payload.classId) delete payload.classId;
      if (typeof payload.feeHeadId === 'object') payload.feeHeadId = payload.feeHeadId._id || payload.feeHeadId.id;
      if (typeof payload.academicYearId === 'object') payload.academicYearId = payload.academicYearId._id || payload.academicYearId.id;
      if (typeof payload.branchId === 'object') payload.branchId = payload.branchId._id || payload.branchId.id;

      if (structModal.isEdit && structModal.data._id) {
        await updateFeeStructure(structModal.data._id, payload);
      } else {
        await createFeeStructure(payload);
      }
      setStructModal({ open: false, isEdit: false, data: {} });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const deleteStruct = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this structure?')) return;
    try {
      await deactivateFeeStructure(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // --- Discount CRUD ---
  const saveDiscount = async () => {
    try {
      if (discountModal.isEdit && discountModal.data._id) {
        await updateDiscount(discountModal.data._id, discountModal.data);
      } else {
        await createDiscount(discountModal.data);
      }
      setDiscountModal({ open: false, isEdit: false, data: {} });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const deleteDiscount = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this discount?')) return;
    try {
      await deactivateDiscount(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            Fee Setup Manager
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => {
            if (tabIndex === 0) setHeadModal({ open: true, isEdit: false, data: { isTaxable: false, isRefundable: false, category: 'ACADEMIC' } });
            if (tabIndex === 1) setStructModal({ open: true, isEdit: false, data: { frequency: 'ONE_TIME' } });
            if (tabIndex === 2) setDiscountModal({ open: true, isEdit: false, data: { type: 'FIXED_AMOUNT' } });
          }}>
            Create New
          </Button>
        </Box>

        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Fee Heads" />
            <Tab label="Fee Structures" />
            <Tab label="Discounts & Scholarships" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tabIndex === 0 && (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Code</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Taxable</TableCell>
                        <TableCell>Refundable</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {feeHeads.map(head => (
                        <TableRow key={head._id}>
                          <TableCell>{head.name}</TableCell>
                          <TableCell>{head.code}</TableCell>
                          <TableCell>{head.category}</TableCell>
                          <TableCell>{head.isTaxable ? 'Yes' : 'No'}</TableCell>
                          <TableCell>{head.isRefundable ? 'Yes' : 'No'}</TableCell>
                          <TableCell><Chip label={head.isActive !== false ? "Active" : "Inactive"} color={head.isActive !== false ? "success" : "default"} size="small" /></TableCell>
                          <TableCell align="right">
                            <IconButton size="small" color="primary" onClick={() => setHeadModal({ open: true, isEdit: true, data: head })}><EditIcon /></IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteHead(head._id!)}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {tabIndex === 1 && (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fee Head</TableCell>
                        <TableCell>Class</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Effective Date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {structures.map(s => (
                        <TableRow key={s._id}>
                          <TableCell sx={{ fontWeight: 600 }}>{getFeeHeadName(s.feeHeadId)}</TableCell>
                          <TableCell>{getClassName(s.classId)}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>₹{Number(s.totalAmount).toLocaleString()}</TableCell>
                          <TableCell><Chip label={s.frequency} size="small" variant="outlined" color="info" /></TableCell>
                          <TableCell>{s.effectiveDate ? new Date(s.effectiveDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell><Chip label={s.isActive !== false ? "Active" : "Inactive"} color={s.isActive !== false ? "success" : "default"} size="small" /></TableCell>
                          <TableCell align="right">
                            <IconButton size="small" color="primary" onClick={() => setStructModal({
                              open: true,
                              isEdit: true,
                              data: {
                                ...s,
                                feeHeadId: typeof s.feeHeadId === 'object' ? s.feeHeadId?._id : s.feeHeadId,
                                classId: typeof s.classId === 'object' ? (s.classId as any)?._id : (s.classId || ''),
                                academicYearId: typeof (s as any).academicYearId === 'object' ? (s as any).academicYearId?._id : (s as any).academicYearId,
                                branchId: typeof (s as any).branchId === 'object' ? (s as any).branchId?._id : (s as any).branchId,
                                effectiveDate: s.effectiveDate ? new Date(s.effectiveDate).toISOString().substring(0, 10) : ''
                              }
                            })}><EditIcon /></IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteStruct(s._id!)}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {tabIndex === 2 && (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {discounts.map(d => (
                        <TableRow key={d._id}>
                          <TableCell>{d.name}</TableCell>
                          <TableCell><Chip label={d.type} size="small" color="primary" variant="outlined" /></TableCell>
                          <TableCell>{d.type === 'PERCENTAGE' ? `${d.value}%` : `₹${d.value}`}</TableCell>
                          <TableCell><Chip label={d.isActive !== false ? "Active" : "Inactive"} color={d.isActive !== false ? "success" : "default"} size="small" /></TableCell>
                          <TableCell align="right">
                            <IconButton size="small" color="primary" onClick={() => setDiscountModal({ open: true, isEdit: true, data: d })}><EditIcon /></IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteDiscount(d._id!)}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Head Modal */}
        <Dialog open={headModal.open} onClose={() => setHeadModal({ ...headModal, open: false })}>
          <DialogTitle>{headModal.isEdit ? 'Edit' : 'Create'} Fee Head</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 400 }}>
            <TextField label="Name" size="small" value={headModal.data.name || ''} onChange={e => setHeadModal({ ...headModal, data: { ...headModal.data, name: e.target.value } })} />
            <TextField label="Code" size="small" value={headModal.data.code || ''} onChange={e => setHeadModal({ ...headModal, data: { ...headModal.data, code: e.target.value } })} />
            <FormControl size="small">
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={headModal.data.category || 'ACADEMIC'} onChange={e => setHeadModal({ ...headModal, data: { ...headModal.data, category: e.target.value as any } })}>
                <MenuItem value="ACADEMIC">Academic</MenuItem>
                <MenuItem value="TRANSPORT">Transport</MenuItem>
                <MenuItem value="HOSTEL">Hostel</MenuItem>
                <MenuItem value="MISCELLANEOUS">Miscellaneous</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Taxable</InputLabel>
              <Select label="Taxable" value={headModal.data.isTaxable ? 'true' : 'false'} onChange={e => setHeadModal({ ...headModal, data: { ...headModal.data, isTaxable: e.target.value === 'true' } })}>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Refundable</InputLabel>
              <Select label="Refundable" value={headModal.data.isRefundable ? 'true' : 'false'} onChange={e => setHeadModal({ ...headModal, data: { ...headModal.data, isRefundable: e.target.value === 'true' } })}>
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHeadModal({ ...headModal, open: false })}>Cancel</Button>
            <Button variant="contained" onClick={saveHead}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Structure Modal */}
        <Dialog open={structModal.open} onClose={() => setStructModal({ ...structModal, open: false })}>
          <DialogTitle>{structModal.isEdit ? 'Edit' : 'Create'} Fee Structure</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 400 }}>
            <FormControl size="small">
              <InputLabel>Fee Head</InputLabel>
              <Select label="Fee Head" value={structModal.data.feeHeadId || ''} onChange={e => setStructModal({ ...structModal, data: { ...structModal.data, feeHeadId: e.target.value as string } })}>
                {feeHeads.map(h => <MenuItem key={h._id} value={h._id}>{h.name} ({h.code})</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Academic Year</InputLabel>
              <Select label="Academic Year" value={structModal.data.academicYearId || ''} onChange={e => setStructModal({ ...structModal, data: { ...structModal.data, academicYearId: e.target.value as string } })}>
                {academicYears.map(y => <MenuItem key={y._id} value={y._id}>{y.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Branch</InputLabel>
              <Select label="Branch" value={structModal.data.branchId || ''} onChange={e => setStructModal({ ...structModal, data: { ...structModal.data, branchId: e.target.value as string } })}>
                {branches.map(b => <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small">
              <InputLabel>Class (Optional)</InputLabel>
              <Select label="Class (Optional)" value={structModal.data.classId || ''} onChange={e => setStructModal({ ...structModal, data: { ...structModal.data, classId: e.target.value as string } })}>
                <MenuItem value=""><em>All Classes</em></MenuItem>
                {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Total Amount" type="number" size="small" value={structModal.data.totalAmount || ''} onChange={e => setStructModal({ ...structModal, data: { ...structModal.data, totalAmount: Number(e.target.value) } })} />
            <FormControl size="small">
              <InputLabel>Frequency</InputLabel>
              <Select label="Frequency" value={structModal.data.frequency || 'ONE_TIME'} onChange={e => setStructModal({ ...structModal, data: { ...structModal.data, frequency: e.target.value as any } })}>
                <MenuItem value="ONE_TIME">One Time</MenuItem>
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                <MenuItem value="HALF_YEARLY">Half Yearly</MenuItem>
                <MenuItem value="ANNUAL">Annual</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Effective Date" type="date" slotProps={{ inputLabel: { shrink: true } }} size="small" value={structModal.data.effectiveDate || ''} onChange={e => setStructModal({ ...structModal, data: { ...structModal.data, effectiveDate: e.target.value } })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStructModal({ ...structModal, open: false })}>Cancel</Button>
            <Button variant="contained" onClick={saveStruct}>Save</Button>
          </DialogActions>
        </Dialog>

        {/* Discount Modal */}
        <Dialog open={discountModal.open} onClose={() => setDiscountModal({ ...discountModal, open: false })}>
          <DialogTitle>{discountModal.isEdit ? 'Edit' : 'Create'} Discount / Concession Template</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 400 }}>
            <TextField label="Name" size="small" value={discountModal.data.name || ''} onChange={e => setDiscountModal({ ...discountModal, data: { ...discountModal.data, name: e.target.value } })} />
            <FormControl size="small">
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={discountModal.data.type || 'FIXED_AMOUNT'} onChange={e => setDiscountModal({ ...discountModal, data: { ...discountModal.data, type: e.target.value as any } })}>
                <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                <MenuItem value="PERCENTAGE">Percentage</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Value" type="number" size="small" value={discountModal.data.value || ''} onChange={e => setDiscountModal({ ...discountModal, data: { ...discountModal.data, value: Number(e.target.value) } })} />
            <TextField label="Reason / Description" size="small" value={discountModal.data.reason || ''} onChange={e => setDiscountModal({ ...discountModal, data: { ...discountModal.data, reason: e.target.value } })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDiscountModal({ ...discountModal, open: false })}>Cancel</Button>
            <Button variant="contained" onClick={saveDiscount}>Save</Button>
          </DialogActions>
        </Dialog>

      </Box>
    </Layout>
  );
};

export default FeeSetupManager;
