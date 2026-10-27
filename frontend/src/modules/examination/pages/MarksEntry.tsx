
const MarksEntry = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marks Entry</h1>
          <p className="text-sm text-gray-500 mt-1">Enter marks for your assigned subjects</p>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-4">
        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1">
          <option>Mid-Term Examination (Oct 2026)</option>
        </select>
        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1">
          <option>Grade 10 - Section A</option>
        </select>
        <select className="border border-gray-300 rounded-md px-3 py-2 text-sm flex-1">
          <option>Mathematics (MAT101)</option>
        </select>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-md font-bold text-sm hover:bg-indigo-700">
          Load Sheet
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-gray-900">Marks Entry Sheet</h2>
            <p className="text-xs text-gray-500">Max Marks: Theory (70), Practical (30)</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-indigo-200 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-50">Save Draft</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-bold shadow hover:bg-indigo-700">Submit & Lock</button>
          </div>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4 w-32">Theory (70)</th>
              <th className="px-6 py-4 w-32">Practical (30)</th>
              <th className="px-6 py-4 w-24">Total</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-bold text-gray-900">Aarav Sharma</p>
                <p className="text-xs text-gray-500">ADM-2026-001</p>
              </td>
              <td className="px-6 py-4">
                <input type="number" defaultValue="65" className="w-full border border-gray-300 rounded px-2 py-1 text-center" />
              </td>
              <td className="px-6 py-4">
                <input type="number" defaultValue="28" className="w-full border border-gray-300 rounded px-2 py-1 text-center" />
              </td>
              <td className="px-6 py-4 font-bold text-gray-900">93</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-700">DRAFT</span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-bold text-gray-900">Diya Patel</p>
                <p className="text-xs text-gray-500">ADM-2026-002</p>
              </td>
              <td className="px-6 py-4">
                <input type="number" defaultValue="54" className="w-full border border-gray-300 rounded px-2 py-1 text-center" />
              </td>
              <td className="px-6 py-4">
                <input type="number" defaultValue="25" className="w-full border border-gray-300 rounded px-2 py-1 text-center" />
              </td>
              <td className="px-6 py-4 font-bold text-gray-900">79</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-700">DRAFT</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarksEntry;
