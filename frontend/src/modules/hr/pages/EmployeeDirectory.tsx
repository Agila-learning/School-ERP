import React, { useState, useEffect } from 'react';
import { getEmployees, getDepartments } from '../api/hr.api';
import { useNavigate } from 'react-router-dom';

const EmployeeDirectory: React.FC = () => {
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      const data = await getEmployees();
      setEmployees(data);
      setLoading(false);
    };
    const fetchDepartments = async () => {
      const data = await getDepartments();
      setDepartments(data);
    };
    fetchEmployees();
    fetchDepartments();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-sm text-gray-500">Search and manage staff profiles</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          + Add Employee
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px] relative">
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[150px]"
            value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
          <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[150px]"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_PROBATION">Probation</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Role & Dept</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
            ) : employees.filter(e => {
                const searchMatch = (e.firstName + ' ' + e.lastName).toLowerCase().includes(query.toLowerCase()) || 
                                    e.email?.toLowerCase().includes(query.toLowerCase()) ||
                                    e.employeeIdNumber?.toLowerCase().includes(query.toLowerCase());
                const deptMatch = departmentFilter ? e.departmentId?._id === departmentFilter || e.departmentId === departmentFilter : true;
                const statusMatch = statusFilter ? e.status === statusFilter : true;
                return searchMatch && deptMatch && statusMatch;
              }).length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center">No staff members found.</td></tr>
            ) : (
              employees.filter(e => {
                const searchMatch = (e.firstName + ' ' + e.lastName).toLowerCase().includes(query.toLowerCase()) || 
                                    e.email?.toLowerCase().includes(query.toLowerCase()) ||
                                    e.employeeIdNumber?.toLowerCase().includes(query.toLowerCase());
                const deptMatch = departmentFilter ? e.departmentId?._id === departmentFilter || e.departmentId === departmentFilter : true;
                const statusMatch = statusFilter ? e.status === statusFilter : true;
                return searchMatch && deptMatch && statusMatch;
              }).map(emp => (
                <tr key={emp._id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        {(emp.firstName?.[0] || '') + (emp.lastName?.[0] || '')}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors cursor-pointer">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-600">{emp.employeeIdNumber}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{emp.designationId?.name || emp.designation}</p>
                    <p className="text-xs text-gray-500">{emp.departmentId?.name || emp.department}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      emp.status === 'ON_PROBATION' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {emp.status?.replace('_', ' ') || 'UNKNOWN'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-600 hover:text-indigo-900 font-medium text-sm" onClick={() => navigate(`/hr/employee/${emp._id}`)}>View Profile</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDirectory;
