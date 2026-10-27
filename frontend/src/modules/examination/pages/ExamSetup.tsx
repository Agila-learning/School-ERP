import { useState } from 'react';

const ExamSetup = () => {
  const [activeTab, setActiveTab] = useState<'EXAMS' | 'GRADE_SYSTEM' | 'COMPONENTS'>('EXAMS');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examination Setup</h1>
          <p className="text-sm text-gray-500 mt-1">Manage exam configurations and grade systems</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          + New Configuration
        </button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['EXAMS', 'GRADE_SYSTEM', 'COMPONENTS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {activeTab === 'EXAMS' && (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Exam Name</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Exam Type</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">Mid-Term Examination</td>
                <td className="px-6 py-4">EX-2026-MID</td>
                <td className="px-6 py-4">Mid-Term</td>
                <td className="px-6 py-4 text-gray-500">Oct 10 - Oct 25</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-bold rounded-md bg-emerald-100 text-emerald-700">PUBLISHED</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:underline font-medium">Configure</button>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">Annual Final Examination</td>
                <td className="px-6 py-4">EX-2026-FIN</td>
                <td className="px-6 py-4">Final</td>
                <td className="px-6 py-4 text-gray-500">Mar 01 - Mar 15</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-700">DRAFT</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:underline font-medium">Configure</button>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'GRADE_SYSTEM' && (
          <div className="p-6 text-center text-gray-500 py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Grade Systems</h3>
            <p className="mt-1 text-sm text-gray-500">Configure absolute or relative grading scales.</p>
          </div>
        )}

        {activeTab === 'COMPONENTS' && (
          <div className="p-6 text-center text-gray-500 py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">Mark Components</h3>
            <p className="mt-1 text-sm text-gray-500">Set up Theory, Practical, Internal, and Viva components.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamSetup;
