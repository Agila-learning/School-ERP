import React from 'react';

const LeaveAndLoanManager: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Approvals Desk</h1>
        <p className="text-sm text-gray-500">Manage incoming Leave, Advance, and Loan requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900 flex justify-between items-center">
              Pending Leave Requests
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">3 New</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-900">Arjun Reddy</p>
                  <p className="text-xs text-gray-500">Casual Leave (2 Days)</p>
                </div>
                <p className="text-xs font-bold text-gray-600">Sep 15 - Sep 16</p>
              </div>
              <p className="text-sm text-gray-600 italic mb-4">"Attending a family function out of town."</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-emerald-50 text-emerald-700 font-bold text-sm rounded border border-emerald-200 hover:bg-emerald-100">Approve</button>
                <button className="flex-1 py-2 bg-red-50 text-red-700 font-bold text-sm rounded border border-red-200 hover:bg-red-100">Reject</button>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-bold text-gray-900 flex justify-between items-center">
              Pending Salary Advances / Loans
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">1 New</span>
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-900">Neha Sharma</p>
                  <p className="text-xs text-gray-500">Salary Advance</p>
                </div>
                <p className="text-lg font-bold text-gray-900">₹ 20,000</p>
              </div>
              <p className="text-sm text-gray-600 mb-2 italic">"Required for medical emergency. Will repay in 4 EMIs."</p>
              <p className="text-xs font-medium text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded mb-4">Requires Finance Approval</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded border border-indigo-200 hover:bg-indigo-100">Review & Approve</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveAndLoanManager;
