import React, { useState, useEffect } from 'react';

const PolicyManager: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../../../core/api/axios').then(({ default: axios }) => {
      axios.get('/v1/library/settings').then(res => {
        setPolicies(res.data.data || []);
      }).catch(err => {
        console.error(err);
      }).finally(() => {
        setLoading(false);
      });
    });
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Library Policies</h1>
          <p className="text-sm text-gray-500">Configure borrowing limits and fine structures</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
          + Create New Policy
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <th className="p-4">Policy Name</th>
              <th className="p-4">Member Type</th>
              <th className="p-4">Max Books</th>
              <th className="p-4">Duration (Days)</th>
              <th className="p-4">Fine / Day (₹)</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {policies.map(policy => (
              <tr key={policy._id || policy.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium text-gray-900">{policy.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">
                    {policy.memberType}
                  </span>
                </td>
                <td className="p-4 text-gray-700">{policy.maxBooksAllowed}</td>
                <td className="p-4 text-gray-700">{policy.issueDurationDays}</td>
                <td className="p-4 text-gray-700">{policy.finePerDay}</td>
                <td className="p-4">
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mr-3">Edit</button>
                  <button className="text-red-600 hover:text-red-900 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {policies.length === 0 && !loading && (
          <div className="p-8 text-center text-gray-500">No policies configured.</div>
        )}
      </div>
    </div>
  );
};

export default PolicyManager;
