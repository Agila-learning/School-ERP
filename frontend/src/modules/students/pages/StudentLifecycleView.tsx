import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentLifecycleView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'TRANSFER' | 'WITHDRAW' | 'TC' | 'GRADUATE'>('TRANSFER');
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [student, setStudent] = useState<any>(null);

  React.useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axios.get(`/api/v1/students/${id}`, { withCredentials: true });
        if (res.data && res.data.data) {
          setStudent(res.data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStudent();
  }, [id]);
  
  const handleAction = async () => {
    if (!reason) {
      alert("Please provide a reason.");
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'TRANSFER') {
        await axios.post(`/api/v1/students/${id}/transfer`, { reason }, { withCredentials: true });
        alert('Student Transferred Out successfully');
      } else if (activeTab === 'TC') {
        const lastClassId = student?.currentEnrollmentId?.classId || student?.currentEnrollmentId || '60d5ec49f1b2c80015f8a002';
        await axios.post(`/api/v1/students/${id}/tc`, { reasonForLeaving: reason, lastClassId }, { withCredentials: true });
        alert('Transfer Certificate Generated');
      } else if (activeTab === 'WITHDRAW') {
        await axios.put(`/api/v1/students/${id}/status`, { newStatus: 'WITHDRAWN', reason }, { withCredentials: true });
        alert('Student Withdrawn');
      } else if (activeTab === 'GRADUATE') {
        const finalClassId = student?.currentEnrollmentId?.classId || student?.currentEnrollmentId || '60d5ec49f1b2c80015f8a002';
        const branchId = student?.currentEnrollmentId?.branchId || '60d5ec49f1b2c80015f8a001';
        await axios.post(`/api/v1/students/${id}/graduate`, { graduationYear: new Date().getFullYear(), finalClassId, branchId }, { withCredentials: true });
        alert('Student Graduated');
      }
      navigate('/students/directory');
    } catch (error) {
      console.error('Error processing lifecycle action', error);
      alert('Action failed. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Lifecycle Management</h1>
        <p className="text-sm text-gray-500 mb-6">Process Transfer, Withdrawal, TC Generation, or Graduation</p>

        <div className="flex gap-2 mb-6 border-b border-gray-100 pb-4 overflow-x-auto">
          {['TRANSFER', 'WITHDRAW', 'TC', 'GRADUATE'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r text-sm text-amber-800">
            <strong>Warning:</strong> This action will modify the student's status permanently and may lock their portal access. A historical record will be created.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Remarks</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="Enter detailed reason for this lifecycle change..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            ></textarea>
          </div>

          <button
            onClick={handleAction}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Confirm ${activeTab}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLifecycleView;
