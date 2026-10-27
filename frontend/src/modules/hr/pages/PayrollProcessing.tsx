import React, { useState, useEffect } from 'react';
import api from '../../../core/api/axios';
import { CircularProgress } from '@mui/material';
import { getAcademicYears } from '../../academic/api/academic.api';

const PayrollProcessing: React.FC = () => {
  const [periods, setPeriods] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  useEffect(() => {
    fetchPeriods();
    getAcademicYears().then(setAcademicYears).catch(console.error);
  }, []);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hr/payroll/periods');
      setPeriods(res.data?.data || []);
      if (res.data?.data?.length > 0) {
        selectPeriod(res.data.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectPeriod = async (period: any) => {
    setSelectedPeriod(period);
    try {
      const res = await api.get(`/hr/payroll/payslips?periodId=${period._id}`);
      setPayslips(res.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRunPayroll = async () => {
    if (!selectedPeriod) return;
    setProcessing(true);
    try {
      await api.post(`/hr/payroll/periods/${selectedPeriod._id}/calculate`);
      alert('Payroll calculated successfully');
      fetchPeriods(); // refresh status
    } catch (error: any) {
      alert('Failed to calculate payroll: ' + error.response?.data?.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleApprovePayroll = async () => {
    if (!selectedPeriod) return;
    setProcessing(true);
    try {
      await api.post(`/hr/payroll/periods/${selectedPeriod._id}/approve`);
      alert('Payroll approved and locked');
      fetchPeriods(); // refresh status
    } catch (error: any) {
      alert('Failed to approve payroll: ' + error.response?.data?.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><CircularProgress /></div>;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payroll Processing Engine</h1>
        <p className="text-sm text-gray-500">Idempotent calculation of attendance, leave, and salary structures</p>
      </div>

      <div className="flex gap-4 mb-4">
        <select 
          className="border p-2 rounded"
          value={selectedPeriod?._id || ''}
          onChange={(e) => {
            const p = periods.find(x => x._id === e.target.value);
            if (p) selectPeriod(p);
          }}
        >
          {periods.map(p => (
            <option key={p._id} value={p._id}>
              {p.month}/{p.year} - {p.status}
            </option>
          ))}
        </select>
        <button 
          onClick={() => {
            const activeYear = academicYears.find(y => y.status === 'ACTIVE' || y.status === 'active');
            if (!activeYear) {
              alert('No active academic year found. Please configure an academic year first.');
              return;
            }
            const m = prompt('Month (1-12):');
            const y = prompt('Year:');
            const wd = prompt('Total Working Days:');
            if (m && y && wd) {
              api.post('/hr/payroll/periods', {
                month: parseInt(m), year: parseInt(y), totalWorkingDays: parseInt(wd), academicYearId: activeYear.id || activeYear._id
              }).then(() => fetchPeriods());
            }
          }}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium border"
        >
          + New Period
        </button>
      </div>

      {selectedPeriod && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Period: {selectedPeriod.month}/{selectedPeriod.year}</h2>
              <p className="text-sm text-gray-500">Total Working Days: {selectedPeriod.totalWorkingDays} · Status: <span className="font-bold text-indigo-600">{selectedPeriod.status}</span></p>
            </div>
            
            {selectedPeriod.status === 'DRAFT' && (
              <button 
                onClick={handleRunPayroll}
                disabled={processing}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Run Payroll Calculation'}
              </button>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 mb-4">Calculated Payslips Preview ({payslips.length})</h3>
          
          {payslips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Present/Days</th>
                    <th className="px-4 py-3 text-right">Gross</th>
                    <th className="px-4 py-3 text-right">Deductions</th>
                    <th className="px-4 py-3 text-right">Net Payable</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payslips.map(ps => (
                    <tr key={ps._id}>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-900">{ps.employeeId?.firstName} {ps.employeeId?.lastName}</p>
                        <p className="text-xs text-gray-500">{ps.payslipNumber}</p>
                      </td>
                      <td className="px-4 py-4">{ps.presentDays} / {ps.workingDays}</td>
                      <td className="px-4 py-4 text-right">₹ {ps.totalEarnings}</td>
                      <td className="px-4 py-4 text-right text-red-600">₹ {ps.totalDeductions}</td>
                      <td className="px-4 py-4 text-right font-bold text-gray-900">₹ {ps.netSalary}</td>
                      <td className="px-4 py-4 text-center">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">{ps.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-4 text-center">No payslips generated for this period yet.</p>
          )}
          
          {selectedPeriod.status === 'REVIEW' && (
            <div className="mt-8 flex justify-end gap-4 border-t border-gray-100 pt-6">
              <button 
                onClick={handleRunPayroll}
                disabled={processing}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Recalculate
              </button>
              <button 
                onClick={handleApprovePayroll}
                disabled={processing}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-bold shadow hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Approving...' : 'Approve & Lock Payroll'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PayrollProcessing;
