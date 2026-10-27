import React, { useState, useEffect } from 'react';
import { getFines, waiveFine, recordFinePayment, type LibraryFine } from '../api/library.api';

const FineManagementDesk: React.FC = () => {
  const [fines, setFines] = useState<LibraryFine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFines = () => {
    setLoading(true);
    getFines().then(data => {
      setFines(data);
    }).catch(console.error).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const totalOutstanding = fines.filter(f => f.status === 'PENDING' || f.status === 'PARTIALLY_PAID').reduce((acc, f) => acc + (f.netAmount - ((f as any).paidAmount || 0)), 0);
  const totalCollected = fines.reduce((acc, f) => acc + ((f as any).paidAmount || 0), 0);
  const totalWaived = fines.reduce((acc, f) => acc + ((f as any).waivedAmount || 0), 0);

  const handleWaive = async (fineId: string) => {
    const amount = prompt('Enter amount to waive:');
    if (!amount || isNaN(+amount)) return;
    const reason = prompt('Enter reason for waiver:');
    if (!reason) return;
    try {
      await waiveFine(fineId, { waivedAmount: +amount, reason });
      fetchFines();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to waive fine');
    }
  };

  const handlePay = async (fineId: string) => {
    const amount = prompt('Enter amount paid by member (Cash/UPI offline):');
    if (!amount || isNaN(+amount)) return;
    try {
      await recordFinePayment(fineId, +amount);
      fetchFines();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to record payment');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fine & Finance Sync</h1>
          <p className="text-sm text-gray-500">Oversee pending fines and record offline payments or waivers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Outstanding Fines</p>
          <p className="text-2xl font-bold text-amber-600">? {totalOutstanding.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Collected (YTD)</p>
          <p className="text-2xl font-bold text-emerald-600">? {totalCollected.toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-medium text-gray-500 uppercase">Waived</p>
          <p className="text-2xl font-bold text-gray-900">? {totalWaived.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Student/Member</th>
              <th className="px-6 py-4">Reason & Book</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={5} className="text-center p-4">Loading...</td></tr> : fines.length === 0 ? <tr><td colSpan={5} className="text-center p-4">No fines found.</td></tr> : fines.map((f: any) => (
              <tr key={f._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{f.userId?.firstName} {f.userId?.lastName}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{f.description}</p>
                  <p className="text-xs text-gray-500">Copy: {f.copyId?.accessionNumber || 'N/A'}</p>
                </td>
                <td className="px-6 py-4 font-bold text-red-600">
                  ? {f.netAmount} 
                  {f.status === 'PARTIALLY_PAID' && <span className="block text-xs font-normal text-gray-500">Paid: ?{f.paidAmount || 0}</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${f.status === 'PAID' ? 'text-emerald-700 bg-emerald-50' : f.status === 'WAIVED' ? 'text-gray-700 bg-gray-100' : 'text-amber-700 bg-amber-50'}`}>{f.status}</span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  {(f.status === 'PENDING' || f.status === 'PARTIALLY_PAID') && (
                    <>
                      <button onClick={() => handlePay(f._id)} className="text-emerald-600 font-medium text-sm hover:underline">Pay</button>
                      <button onClick={() => handleWaive(f._id)} className="text-indigo-600 font-medium text-sm hover:underline">Waive</button>
                    </>
                  )}
                  {f.status !== 'PENDING' && f.status !== 'PARTIALLY_PAID' && <span className="text-gray-400 text-sm">Resolved</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FineManagementDesk;
