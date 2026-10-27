import React, { useState } from 'react';

const AcquisitionManager: React.FC = () => {
  const [grnNumber, setGrnNumber] = useState('');
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Library Acquisitions</h1>
        <p className="text-sm text-gray-500">Convert Procurement GRNs into library catalogue items</p>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4 max-w-lg">
          <h2 className="text-lg font-semibold text-gray-800">Fetch from Procurement</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goods Receipt Note (GRN) Number</label>
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. GRN-2026-0089"
              value={grnNumber}
              onChange={(e) => setGrnNumber(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setStep(2)}
            className="w-full bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 transition"
          >
            Fetch GRN Details
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="font-semibold text-gray-900">Processing GRN: {grnNumber || 'GRN-2026-0089'}</h2>
              <p className="text-xs text-gray-500">Vendor: Oxford Book Distributors</p>
            </div>
            <button onClick={() => setStep(1)} className="text-sm text-indigo-600 font-medium hover:underline">Change GRN</button>
          </div>
          
          <div className="p-6">
            <table className="w-full text-left mb-6">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
                  <th className="pb-3">Book Title / ISBN</th>
                  <th className="pb-3 text-center">Quantity Received</th>
                  <th className="pb-3 text-right">Unit Price</th>
                  <th className="pb-3 text-center">Library Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50">
                  <td className="py-4">
                    <p className="font-medium text-gray-900 text-sm">Advanced Engineering Mathematics</p>
                    <p className="text-xs text-gray-500">ISBN: 9781119455929</p>
                  </td>
                  <td className="py-4 text-center font-medium text-gray-700">10</td>
                  <td className="py-4 text-right text-gray-700">₹ 850.00</td>
                  <td className="py-4 text-center">
                    <select className="border border-gray-300 rounded p-1 text-sm bg-white">
                      <option>Main Library - Science Rack</option>
                      <option>Reference Section</option>
                    </select>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="py-4">
                    <p className="font-medium text-gray-900 text-sm">Clean Architecture</p>
                    <p className="text-xs text-gray-500">ISBN: 9780134494166</p>
                  </td>
                  <td className="py-4 text-center font-medium text-gray-700">5</td>
                  <td className="py-4 text-right text-gray-700">₹ 1,200.00</td>
                  <td className="py-4 text-center">
                    <select className="border border-gray-300 rounded p-1 text-sm bg-white">
                      <option>Main Library - CS Rack</option>
                      <option>Department Library</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <div className="flex justify-end gap-3">
              <button className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
              <button className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 shadow-sm flex items-center gap-2">
                <span>Generate Accession & Barcodes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcquisitionManager;
