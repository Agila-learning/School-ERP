import React, { useState, useEffect } from 'react';
import api from '../../../core/api/axios';

const QuestionBankManager: React.FC = () => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await api.get('/v1/exam/question-bank');
        setBanks(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch question banks', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank Manager</h1>
          <p className="text-sm text-gray-500">Manage questions, blueprints, and generate exam papers</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          + Create Bank
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-gray-500">Loading question banks...</p>
        ) : banks.length > 0 ? (
          banks.map(bank => (
            <div key={bank._id} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-bold text-gray-900">{bank.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Code: {bank.code}</p>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">Questions: 0</span>
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-md font-medium">{bank.status}</span>
              </div>
              <div className="mt-5 flex gap-2">
                <button className="flex-1 px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50">Manage</button>
                <button className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50">Papers</button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center p-12 bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-gray-500">No question banks found. Create one to start adding questions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankManager;
