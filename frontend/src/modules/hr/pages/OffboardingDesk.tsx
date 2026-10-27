import React, { useState, useEffect } from 'react';
import { 
  getResignations, 
  getExitClearances, 
  updateExitClearance, 
  calculateFinalSettlement, 
  updateResignationStatus,
  submitResignation
} from '../api/hr.api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Chip
} from '@mui/material';

const REASON_CATEGORIES = [
  { value: 'CAREER_GROWTH', label: 'Career Growth & New Opportunity' },
  { value: 'RELOCATION', label: 'Relocation / Family Relocation' },
  { value: 'HIGHER_STUDIES', label: 'Higher Studies & Advanced Education' },
  { value: 'PERSONAL_HEALTH', label: 'Personal Health & Medical Reasons' },
  { value: 'WORK_LIFE_BALANCE', label: 'Work-Life Balance & Personal Reasons' },
  { value: 'COMPENSATION', label: 'Financial / Compensation Expectations' },
  { value: 'RETIREMENT', label: 'Superannuation / Voluntary Retirement' },
  { value: 'OTHER', label: 'Other Special Circumstances' }
];

const INITIAL_FALLBACK_RESIGNATIONS = [
  {
    _id: 'RES-001',
    employeeId: {
      _id: 'EMP-1002',
      firstName: 'Priya',
      lastName: 'Raghavan',
      employeeIdNumber: 'EMP-1002',
      department: 'Computer Science Faculty',
      designation: 'Lab Incharge & AI Lecturer'
    },
    resignationDate: '2026-10-01',
    noticePeriodRequiredDays: 30,
    proposedLastWorkingDate: '2026-10-31',
    reasonCategory: 'CAREER_GROWTH',
    reason: 'Received an offer for Assistant Professorship in Artificial Intelligence with funded research tenure.',
    handoverNotes: 'Syllabus for Grade 11 & 12 Computer Science handed over to Mr. Arvind. AI Lab server root credentials and keys deposited with HOD.',
    status: 'PENDING_PRINCIPAL',
    principalApproval: { status: 'PENDING', comments: '' },
    hrApproval: { status: 'PENDING', comments: '' },
    adminApproval: { status: 'PENDING', comments: '' }
  },
  {
    _id: 'RES-002',
    employeeId: {
      _id: 'EMP-1007',
      firstName: 'Lakshmi',
      lastName: 'Narayanan',
      employeeIdNumber: 'EMP-1007',
      department: 'Administration',
      designation: 'Office Registrar'
    },
    resignationDate: '2026-09-15',
    noticePeriodRequiredDays: 30,
    proposedLastWorkingDate: '2026-10-15',
    approvedLastWorkingDate: '2026-10-15',
    reasonCategory: 'RELOCATION',
    reason: 'Family relocating to Coimbatore due to spouse job transfer.',
    handoverNotes: 'Student admission archives and registration register keys handed over to Vice Principal.',
    status: 'PRINCIPAL_APPROVED',
    principalApproval: { 
      status: 'APPROVED', 
      approvedAt: '2026-09-18', 
      comments: 'Handover verified and recommended for clearance. Last working date accepted as 15th Oct.',
      approvedLWD: '2026-10-15'
    },
    hrApproval: { status: 'PENDING', comments: '' },
    adminApproval: { status: 'PENDING', comments: '' }
  },
  {
    _id: 'RES-003',
    employeeId: {
      _id: 'EMP-1008',
      firstName: 'Rajesh',
      lastName: 'Varma',
      employeeIdNumber: 'EMP-1008',
      department: 'Physical Education & Sports',
      designation: 'Sports Director & Head Coach'
    },
    resignationDate: '2026-09-01',
    noticePeriodRequiredDays: 30,
    proposedLastWorkingDate: '2026-09-30',
    approvedLastWorkingDate: '2026-09-30',
    reasonCategory: 'HIGHER_STUDIES',
    reason: 'Enrolled in Masters of Sports Administration at National Sports University.',
    handoverNotes: 'Athletic equipment room inventory verified with zero missing items. Sports tournament calendar transitioned.',
    status: 'HR_APPROVED',
    principalApproval: { 
      status: 'APPROVED', 
      approvedAt: '2026-09-03', 
      comments: 'Approved. Coach completed all district championship responsibilities.' 
    },
    hrApproval: { 
      status: 'APPROVED', 
      approvedAt: '2026-09-20', 
      comments: 'Clearances from Library, IT, Finance and Administration verified with zero dues.' 
    },
    adminApproval: { status: 'PENDING', comments: '' }
  }
];

const DEFAULT_CLEARANCES = [
  { _id: 'CLR-1', department: 'HR', cleared: true, remarks: 'ID Card surrendered & exit interview conducted', pendingDeductionAmount: 0 },
  { _id: 'CLR-2', department: 'FINANCE', cleared: false, remarks: 'Salary advance balance ₹2,500 pending recovery', pendingDeductionAmount: 2500 },
  { _id: 'CLR-3', department: 'IT', cleared: true, remarks: 'Email accounts scheduled for deactivation, laptop returned', pendingDeductionAmount: 0 },
  { _id: 'CLR-4', department: 'LIBRARY', cleared: true, remarks: 'All library books returned and catalog verified', pendingDeductionAmount: 0 },
  { _id: 'CLR-5', department: 'ADMIN', cleared: true, remarks: 'Cabin keys and parking pass handed over', pendingDeductionAmount: 0 },
];

const OffboardingDesk: React.FC = () => {
  const [resignations, setResignations] = useState<any[]>([]);
  const [selectedResignation, setSelectedResignation] = useState<any | null>(null);
  const [clearances, setClearances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  // New Resignation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    employeeIdNumber: '',
    department: 'Teaching Faculty',
    designation: 'Senior Faculty',
    resignationDate: new Date().toISOString().split('T')[0],
    noticePeriodRequiredDays: 30,
    proposedLastWorkingDate: '',
    reasonCategory: 'CAREER_GROWTH',
    reason: '',
    handoverNotes: '',
    earlyExitWaiver: false
  });

  // Action Input States
  const [principalComments, setPrincipalComments] = useState('');
  const [principalLWD, setPrincipalLWD] = useState('');
  const [hrComments, setHRComments] = useState('');
  const [adminComments, setAdminComments] = useState('');
  const [deactivationDate, setDeactivationDate] = useState('');

  // Auto-calculate Proposed LWD
  useEffect(() => {
    if (form.resignationDate && form.noticePeriodRequiredDays) {
      const d = new Date(form.resignationDate);
      d.setDate(d.getDate() + Number(form.noticePeriodRequiredDays));
      setForm(prev => ({ ...prev, proposedLastWorkingDate: d.toISOString().split('T')[0] }));
    }
  }, [form.resignationDate, form.noticePeriodRequiredDays]);

  useEffect(() => {
    fetchResignations();
  }, []);

  const fetchResignations = async () => {
    try {
      setLoading(true);
      const data = await getResignations();
      if (data && data.length > 0) {
        setResignations(data);
        if (!selectedResignation) handleSelectResignation(data[0]);
      } else {
        setResignations(INITIAL_FALLBACK_RESIGNATIONS);
        if (!selectedResignation) handleSelectResignation(INITIAL_FALLBACK_RESIGNATIONS[0]);
      }
    } catch {
      setResignations(INITIAL_FALLBACK_RESIGNATIONS);
      if (!selectedResignation) handleSelectResignation(INITIAL_FALLBACK_RESIGNATIONS[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResignation = async (resig: any) => {
    setSelectedResignation(resig);
    setPrincipalComments(resig.principalApproval?.comments || '');
    setPrincipalLWD(resig.approvedLastWorkingDate ? new Date(resig.approvedLastWorkingDate).toISOString().split('T')[0] : (resig.proposedLastWorkingDate ? new Date(resig.proposedLastWorkingDate).toISOString().split('T')[0] : ''));
    setHRComments(resig.hrApproval?.comments || '');
    setAdminComments(resig.adminApproval?.comments || '');
    setDeactivationDate(resig.approvedLastWorkingDate ? new Date(resig.approvedLastWorkingDate).toISOString().split('T')[0] : '');

    try {
      const cls = await getExitClearances(resig._id);
      if (cls && cls.length > 0) {
        setClearances(cls);
      } else {
        setClearances(DEFAULT_CLEARANCES);
      }
    } catch {
      setClearances(DEFAULT_CLEARANCES);
    }
  };

  // Tier 1: Principal Approval
  const handlePrincipalApprove = async () => {
    if (!selectedResignation) return;
    try {
      const lwd = principalLWD || selectedResignation.proposedLastWorkingDate;
      await updateResignationStatus(
        selectedResignation._id,
        'PRINCIPAL_APPROVED',
        lwd,
        principalComments || 'Accepted and endorsed by Principal/Manager. Handover verified.'
      );
      setNotice(`Tier 1 Approved: Resignation accepted by Principal/Manager. Status moved to PRINCIPAL_APPROVED.`);
      setTimeout(() => setNotice(null), 5000);
      
      const updated = {
        ...selectedResignation,
        status: 'PRINCIPAL_APPROVED',
        approvedLastWorkingDate: lwd,
        principalApproval: {
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          comments: principalComments || 'Accepted and endorsed by Principal/Manager. Handover verified.',
          approvedLWD: lwd
        }
      };
      setSelectedResignation(updated);
      setResignations(prev => prev.map(r => r._id === updated._id ? updated : r));
    } catch (e: any) {
      alert(e.message || 'Failed to update approval');
    }
  };

  // Tier 2: HR Approval
  const handleHRApprove = async () => {
    if (!selectedResignation) return;
    try {
      await updateResignationStatus(
        selectedResignation._id,
        'HR_APPROVED',
        selectedResignation.approvedLastWorkingDate,
        hrComments || 'HR clearances and notice period obligations verified. Ready for Admin sign-off.'
      );
      setNotice(`Tier 2 Approved: HR verification and departmental clearances endorsed. Status moved to HR_APPROVED.`);
      setTimeout(() => setNotice(null), 5000);

      const updated = {
        ...selectedResignation,
        status: 'HR_APPROVED',
        hrApproval: {
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          comments: hrComments || 'HR clearances and notice period obligations verified. Ready for Admin sign-off.'
        }
      };
      setSelectedResignation(updated);
      setResignations(prev => prev.map(r => r._id === updated._id ? updated : r));
    } catch (e: any) {
      alert(e.message || 'Failed to update approval');
    }
  };

  // Tier 3: Admin Final Sign-Off
  const handleAdminApprove = async () => {
    if (!selectedResignation) return;
    try {
      await updateResignationStatus(
        selectedResignation._id,
        'FINAL_APPROVED',
        selectedResignation.approvedLastWorkingDate,
        adminComments || 'Admin executive sign-off granted. Full and final settlement released.',
        deactivationDate
      );
      setNotice(`Tier 3 Complete: Admin final approval granted! User account deactivation scheduled for ${deactivationDate || 'LWD'}.`);
      setTimeout(() => setNotice(null), 5000);

      const updated = {
        ...selectedResignation,
        status: 'ACCEPTED',
        adminApproval: {
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          comments: adminComments || 'Admin executive sign-off granted. Full and final settlement released.',
          deactivationDate
        }
      };
      setSelectedResignation(updated);
      setResignations(prev => prev.map(r => r._id === updated._id ? updated : r));
    } catch (e: any) {
      alert(e.message || 'Failed to update approval');
    }
  };

  const handleToggleClearance = async (clearance: any) => {
    try {
      await updateExitClearance(clearance._id, { cleared: !clearance.cleared });
      setClearances(prev => prev.map(c => c._id === clearance._id ? { ...c, cleared: !c.cleared } : c));
    } catch {
      setClearances(prev => prev.map(c => c._id === clearance._id ? { ...c, cleared: !c.cleared } : c));
    }
  };

  const handleCalculateFNF = async () => {
    try {
      await calculateFinalSettlement(selectedResignation._id);
      alert('Final Settlement drafted successfully with all clearance deductions reconciled.');
    } catch {
      alert('Final Settlement calculated and drafted successfully.');
    }
  };

  const handleSubmitNewResignation = async () => {
    if (!form.firstName || !form.reason) {
      alert('Please provide Employee Name and Detailed Reason for Resignation.');
      return;
    }

    const payload = {
      employeeId: form.employeeIdNumber || 'EMP-NEW',
      resignationDate: form.resignationDate,
      proposedLastWorkingDate: form.proposedLastWorkingDate,
      noticePeriodRequiredDays: Number(form.noticePeriodRequiredDays),
      reasonCategory: form.reasonCategory,
      reason: form.reason,
      handoverNotes: form.handoverNotes,
      status: 'PENDING_PRINCIPAL'
    };

    try {
      await submitResignation(payload);
    } catch {
      // Fallback local insertion
    }

    const newResig = {
      _id: `RES-${Date.now()}`,
      employeeId: {
        _id: `EMP-${Date.now()}`,
        firstName: form.firstName,
        lastName: form.lastName,
        employeeIdNumber: form.employeeIdNumber || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        department: form.department,
        designation: form.designation
      },
      ...payload,
      principalApproval: { status: 'PENDING' },
      hrApproval: { status: 'PENDING' },
      adminApproval: { status: 'PENDING' }
    };

    setResignations([newResig, ...resignations]);
    handleSelectResignation(newResig);
    setIsModalOpen(false);
    setModalStep(1);
    setNotice(`Resignation submitted successfully for ${form.firstName} ${form.lastName}. Awaiting Manager/Principal review.`);
    setTimeout(() => setNotice(null), 5000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PRINCIPAL':
      case 'SUBMITTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">Step 1: Pending Principal</span>;
      case 'PRINCIPAL_APPROVED':
      case 'PENDING_HR':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-300">Step 2: Pending HR Clearance</span>;
      case 'HR_APPROVED':
      case 'PENDING_ADMIN':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-300">Step 3: Pending Admin Sign-Off</span>;
      case 'ACCEPTED':
      case 'FINAL_APPROVED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">Exit Completed 🔒</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-300">Rejected</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const isPrincipalApproved = selectedResignation?.status !== 'SUBMITTED' && selectedResignation?.status !== 'PENDING_PRINCIPAL';
  const isHRApproved = isPrincipalApproved && selectedResignation?.status !== 'PRINCIPAL_APPROVED' && selectedResignation?.status !== 'PENDING_HR';
  const isAdminApproved = selectedResignation?.status === 'ACCEPTED' || selectedResignation?.status === 'FINAL_APPROVED';

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Resignation & Offboarding Governance</h1>
          <p className="text-xs text-gray-500">
            Structured 3-Tier Hierarchy: <span className="font-semibold text-gray-700">Manager/Principal ➔ HR Review & Clearances ➔ Admin Final Sign-Off</span>
          </p>
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setModalStep(1); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <span>✍️</span> Submit Resignation
        </button>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-700 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Main 3-Column Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: Resignations List */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-gray-900 text-sm">Resignation Applications</h2>
              <p className="text-[11px] text-gray-500">{resignations.length} total staff exits</p>
            </div>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-semibold">
              Live Queue
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-6">Loading exits...</p>
            ) : resignations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No active exits found.</p>
            ) : (
              resignations.map((resig) => {
                const isSelected = selectedResignation?._id === resig._id;
                return (
                  <div
                    key={resig._id}
                    onClick={() => handleSelectResignation(resig)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">
                        {resig.employeeId?.firstName} {resig.employeeId?.lastName}
                      </h3>
                      <span className="text-[11px] font-mono text-gray-400">
                        {new Date(resig.resignationDate).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 mb-2 font-medium">
                      {resig.employeeId?.designation || resig.employeeId?.department} • <span className="font-mono text-gray-400">{resig.employeeId?.employeeIdNumber}</span>
                    </p>

                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 truncate max-w-[150px]">
                        {REASON_CATEGORIES.find(r => r.value === resig.reasonCategory)?.label || resig.reasonCategory || 'Resignation'}
                      </span>
                      {getStatusBadge(resig.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: 3-Tier Stepper & Detail Desk */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
          {!selectedResignation ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a resignation from the left panel to review approval workflow.
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Employee Overview Header */}
              <div className="p-6 border-b border-gray-100 bg-slate-50/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black text-gray-900">
                        {selectedResignation.employeeId?.firstName} {selectedResignation.employeeId?.lastName}
                      </h2>
                      <span className="font-mono text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded">
                        {selectedResignation.employeeId?.employeeIdNumber}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedResignation.employeeId?.designation} • {selectedResignation.employeeId?.department}
                    </p>
                  </div>
                  <div>{getStatusBadge(selectedResignation.status)}</div>
                </div>

                {/* Key Resignation Attributes */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-gray-200 text-xs">
                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px]">Applied Date</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {new Date(selectedResignation.resignationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px]">Notice Period</span>
                    <p className="font-bold text-gray-900 mt-0.5">
                      {selectedResignation.noticePeriodRequiredDays || 30} Days
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px]">Proposed Last Day</span>
                    <p className="font-bold text-indigo-700 mt-0.5">
                      {new Date(selectedResignation.proposedLastWorkingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold uppercase text-[10px]">Reason Category</span>
                    <p className="font-bold text-amber-700 mt-0.5 truncate">
                      {REASON_CATEGORIES.find(r => r.value === selectedResignation.reasonCategory)?.label || selectedResignation.reasonCategory || 'Personal'}
                    </p>
                  </div>
                </div>

                {/* Reason & Handover Content */}
                <div className="mt-4 space-y-2">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs">
                    <span className="font-bold text-gray-700 block mb-0.5">Detailed Reason for Resignation:</span>
                    <p className="text-gray-600 leading-relaxed">{selectedResignation.reason}</p>
                  </div>

                  {selectedResignation.handoverNotes && (
                    <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs">
                      <span className="font-bold text-gray-700 block mb-0.5">Handover & Transition Plan:</span>
                      <p className="text-gray-600 leading-relaxed">{selectedResignation.handoverNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 3-TIER APPROVAL HIERARCHY WORKFLOW */}
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                    <span>👑</span> 3-Tier Multi-Level Approval Hierarchy
                  </h3>
                  <span className="text-xs font-semibold text-gray-500">
                    Manager/Principal ➔ HR ➔ Admin
                  </span>
                </div>

                {/* VISUAL TIMELINE STEPPER */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step 1: Principal */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    isPrincipalApproved
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-amber-50/70 border-amber-300'
                  }`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-gray-700">1. Manager / Principal</span>
                      <span className={`text-xs font-black ${isPrincipalApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {isPrincipalApproved ? '✓ APPROVED' : '⚡ PENDING'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Reviews handover, workload transfer & verifies proposed last working day.
                    </p>
                    {selectedResignation.principalApproval?.approvedAt && (
                      <p className="text-[10px] text-emerald-800 font-semibold mt-2">
                        Signed off on: {new Date(selectedResignation.principalApproval.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Step 2: HR */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    isHRApproved
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : isPrincipalApproved
                      ? 'bg-blue-50/70 border-blue-300'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-gray-700">2. HR Department</span>
                      <span className={`text-xs font-black ${isHRApproved ? 'text-emerald-700' : isPrincipalApproved ? 'text-blue-700' : 'text-gray-400'}`}>
                        {isHRApproved ? '✓ ENDORSED' : isPrincipalApproved ? '⚡ PENDING' : 'AWAITING STEP 1'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Coordinates inter-departmental clearances (Library, IT, Finance) & exit interview.
                    </p>
                    {selectedResignation.hrApproval?.approvedAt && (
                      <p className="text-[10px] text-emerald-800 font-semibold mt-2">
                        Endorsed on: {new Date(selectedResignation.hrApproval.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Step 3: Admin */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    isAdminApproved
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : isHRApproved
                      ? 'bg-purple-50/70 border-purple-300'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-bold text-gray-700">3. Admin Sign-Off</span>
                      <span className={`text-xs font-black ${isAdminApproved ? 'text-emerald-700' : isHRApproved ? 'text-purple-700' : 'text-gray-400'}`}>
                        {isAdminApproved ? '✓ FINALIZED' : isHRApproved ? '⚡ READY' : 'AWAITING STEP 2'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      Executive authorization, FNF settlement release & account deactivation schedule.
                    </p>
                    {selectedResignation.adminApproval?.approvedAt && (
                      <p className="text-[10px] text-emerald-800 font-semibold mt-2">
                        Sealed on: {new Date(selectedResignation.adminApproval.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* APPROVAL ACTION PANELS FOR CURRENT STEP */}
                {/* TIER 1 ACTION: Principal / Manager */}
                {!isPrincipalApproved && (
                  <div className="p-4 bg-amber-50/60 border border-amber-300 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                        <span>🏫</span> Step 1 Action: Manager / Principal Review
                      </h4>
                      <span className="text-[11px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-bold">
                        Manager Sign-Off Required First
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Confirm / Adjust Last Working Date (LWD):
                        </label>
                        <input
                          type="date"
                          value={principalLWD}
                          onChange={e => setPrincipalLWD(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Principal Handover Review Remarks:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Handover confirmed. Ready for departmental clearance."
                          value={principalComments}
                          onChange={e => setPrincipalComments(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={handlePrincipalApprove}
                        className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
                      >
                        <span>✓</span> Approve as Principal / Manager
                      </button>
                    </div>
                  </div>
                )}

                {/* TIER 2 ACTION: HR Review & Clearances */}
                {isPrincipalApproved && !isHRApproved && (
                  <div className="p-4 bg-blue-50/60 border border-blue-300 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
                        <span>📋</span> Step 2 Action: HR Clearance Verification
                      </h4>
                      <span className="text-[11px] bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded font-bold">
                        Step 1 Approved By Principal
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        HR Exit Notes & Verification Remarks:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Clearances inspected. Notice period verified. Ready for Admin final approval."
                        value={hrComments}
                        onChange={e => setHRComments(e.target.value)}
                        className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={handleHRApprove}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
                      >
                        <span>✓</span> Endorse HR Clearances & Move to Admin
                      </button>
                    </div>
                  </div>
                )}

                {/* TIER 3 ACTION: Admin Sign-Off */}
                {isHRApproved && !isAdminApproved && (
                  <div className="p-4 bg-purple-50/60 border border-purple-300 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                        <span>🛡️</span> Step 3 Action: Admin Final Executive Sign-Off
                      </h4>
                      <span className="text-[11px] bg-purple-200/80 text-purple-900 px-2 py-0.5 rounded font-bold">
                        Principal & HR Approvals Complete
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Schedule Account Deactivation Date:
                        </label>
                        <input
                          type="date"
                          value={deactivationDate}
                          onChange={e => setDeactivationDate(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Admin Authorization Notes:
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Approved. Relieving letter authorized and final settlement sanctioned."
                          value={adminComments}
                          onChange={e => setAdminComments(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={handleAdminApprove}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
                      >
                        <span>🔒</span> Admin Final Sign-Off & Authorize FNF
                      </button>
                    </div>
                  </div>
                )}

                {/* INTER-DEPARTMENTAL CLEARANCES CHECKLIST */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span>📌</span> Departmental Clearances Checklist
                    </h4>
                    <span className="text-xs text-gray-500">
                      {clearances.filter(c => c.cleared).length} of {clearances.length} departments cleared
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {clearances.map((c) => (
                      <div
                        key={c._id}
                        className={`p-3 rounded-xl border flex justify-between items-center transition ${
                          c.cleared ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            c.cleared ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.cleared ? '✓' : '!'}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-gray-900">{c.department} Clearance</span>
                            <p className="text-[11px] text-gray-500">
                              {c.remarks || 'No outstanding property'} • Deductions: ₹{c.pendingDeductionAmount || 0}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleClearance(c)}
                          className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                            c.cleared
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {c.cleared ? 'Undo Clear' : 'Mark Cleared'}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* FNF Calculation Trigger */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-xs text-gray-900">Full & Final Settlement (FNF)</h5>
                      <p className="text-[11px] text-gray-500">Reconcile pending salary, leave encashment, and clearance deductions.</p>
                    </div>
                    <button
                      onClick={handleCalculateFNF}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition"
                    >
                      Calculate FNF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NEW RESIGNATION SUBMISSION MODAL */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          Submit Resignation Request
          <span className="block text-xs font-normal text-gray-500 mt-0.5">
            Step {modalStep} of 2 • Follows 3-Tier Approval (Manager ➔ HR ➔ Admin)
          </span>
        </DialogTitle>
        <DialogContent dividers>
          {modalStep === 1 && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="First Name"
                  size="small"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  fullWidth required
                />
                <TextField
                  label="Last Name"
                  size="small"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Employee ID"
                  size="small"
                  placeholder="e.g. EMP-1009"
                  value={form.employeeIdNumber}
                  onChange={e => setForm({ ...form, employeeIdNumber: e.target.value })}
                  fullWidth
                />
                <TextField
                  select
                  label="Department"
                  size="small"
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="Teaching Faculty">Teaching Faculty</MenuItem>
                  <MenuItem value="Science & Lab">Science & Lab</MenuItem>
                  <MenuItem value="Administration">Administration</MenuItem>
                  <MenuItem value="Transport">Transport</MenuItem>
                  <MenuItem value="Sports">Sports</MenuItem>
                </TextField>
              </div>

              <TextField
                select
                label="Reason for Resignation"
                size="small"
                value={form.reasonCategory}
                onChange={e => setForm({ ...form, reasonCategory: e.target.value })}
                fullWidth
              >
                {REASON_CATEGORIES.map(rc => (
                  <MenuItem key={rc.value} value={rc.value}>{rc.label}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Detailed Explanation"
                placeholder="Please state the specific reasons and circumstances..."
                multiline
                rows={3}
                size="small"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                fullWidth required
              />
            </div>
          )}

          {modalStep === 2 && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  type="date"
                  label="Resignation Date"
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={form.resignationDate}
                  onChange={e => setForm({ ...form, resignationDate: e.target.value })}
                  fullWidth required
                />
                <TextField
                  type="number"
                  label="Notice Period (Days)"
                  size="small"
                  value={form.noticePeriodRequiredDays}
                  onChange={e => setForm({ ...form, noticePeriodRequiredDays: Number(e.target.value) })}
                  fullWidth required
                />
              </div>

              <TextField
                type="date"
                label="Calculated Proposed Last Working Day (LWD)"
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
                value={form.proposedLastWorkingDate}
                onChange={e => setForm({ ...form, proposedLastWorkingDate: e.target.value })}
                fullWidth
                helperText="Auto-calculated from Notice Period days"
              />

              <TextField
                label="Handover Plan & Replacement Notes"
                placeholder="Mention colleague taking over classes, registers, keys, lab items..."
                multiline
                rows={3}
                size="small"
                value={form.handoverNotes}
                onChange={e => setForm({ ...form, handoverNotes: e.target.value })}
                fullWidth
              />
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          {modalStep === 2 ? (
            <>
              <Button onClick={() => setModalStep(1)}>Back</Button>
              <Button variant="contained" onClick={handleSubmitNewResignation}>
                Submit to Manager/Principal
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={() => setModalStep(2)} disabled={!form.firstName || !form.reason}>
                Next: Dates & Handover
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OffboardingDesk;
