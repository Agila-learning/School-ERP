import React, { useState, useEffect } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/transport.api';
import type { Vehicle } from '../api/transport.api';

const FleetManagement: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  
  // Docs Modal
  const [docsModal, setDocsModal] = useState<{ open: boolean; vehicle: Vehicle | null }>({
    open: false,
    vehicle: null
  });
  const [docsForm, setDocsForm] = useState({
    insuranceExpiry: '',
    fitnessExpiry: '',
    permitExpiry: ''
  });
  const [updatingDocs, setUpdatingDocs] = useState(false);

  const [formData, setFormData] = useState<Partial<Vehicle>>({ 
    vehicleNumber: '', 
    registrationNumber: '', 
    vehicleType: 'BUS',
    manufacturer: '',
    modelName: '',
    manufacturingYear: 2020,
    seatingCapacity: 40,
    totalCapacity: 40,
    fuelType: 'DIESEL',
    insuranceExpiry: '',
    fitnessExpiry: '',
    permitExpiry: ''
  });

  const fetchVehicles = () => {
    setLoading(true);
    getVehicles().then(data => {
      setVehicles(data);
      setLoading(false);
    }).catch(console.error);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAdd = () => {
    setEditingVehicleId(null);
    setFormData({ 
      vehicleNumber: '', registrationNumber: '', vehicleType: 'BUS', manufacturer: '', modelName: '',
      manufacturingYear: 2020, seatingCapacity: 40, totalCapacity: 40, fuelType: 'DIESEL',
      insuranceExpiry: '', fitnessExpiry: '', permitExpiry: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicleId(v._id);
    setFormData({
      vehicleNumber: v.vehicleNumber,
      registrationNumber: v.registrationNumber,
      vehicleType: v.vehicleType || 'BUS',
      manufacturer: v.manufacturer || '',
      modelName: v.modelName || '',
      manufacturingYear: v.manufacturingYear || 2020,
      seatingCapacity: v.seatingCapacity,
      totalCapacity: v.totalCapacity || v.seatingCapacity,
      fuelType: v.fuelType || 'DIESEL',
      insuranceExpiry: v.insuranceExpiry ? v.insuranceExpiry.split('T')[0] : '',
      fitnessExpiry: v.fitnessExpiry ? v.fitnessExpiry.split('T')[0] : '',
      permitExpiry: v.permitExpiry ? v.permitExpiry.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleOpenDocs = (v: Vehicle) => {
    setDocsModal({ open: true, vehicle: v });
    setDocsForm({
      insuranceExpiry: v.insuranceExpiry ? v.insuranceExpiry.split('T')[0] : '',
      fitnessExpiry: v.fitnessExpiry ? v.fitnessExpiry.split('T')[0] : '',
      permitExpiry: v.permitExpiry ? v.permitExpiry.split('T')[0] : ''
    });
  };

  const handleSaveDocs = async () => {
    if (!docsModal.vehicle) return;
    try {
      setUpdatingDocs(true);
      await updateVehicle(docsModal.vehicle._id, docsForm);
      setDocsModal({ open: false, vehicle: null });
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update documents');
    } finally {
      setUpdatingDocs(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVehicleId) {
        await updateVehicle(editingVehicleId, formData);
      } else {
        await createVehicle(formData);
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteVehicle(id);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const getDocStatusBadge = (expiryDate?: string) => {
    if (!expiryDate) return <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-medium">Not Uploaded</span>;
    const diffDays = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-medium">Expired</span>;
    if (diffDays < 30) return <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700 font-medium">Expires Soon ({diffDays}d)</span>;
    return <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700 font-medium">Valid</span>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
          <p className="text-sm text-gray-500">Manage school buses, vans, statutory documents, and maintenance schedules</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + Add Vehicle
        </button>
      </div>

      {/* CREATE / EDIT VEHICLE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-xl m-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              {editingVehicleId ? 'Edit Vehicle Details' : 'Add New Vehicle'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
                  <input required type="text" placeholder="e.g. BUS-01" value={formData.vehicleNumber} onChange={e => setFormData({...formData, vehicleNumber: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                  <input required type="text" placeholder="e.g. DL-01-AB-1234" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
                  <select required value={formData.vehicleType} onChange={e => setFormData({...formData, vehicleType: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm">
                    <option value="BUS">Bus</option>
                    <option value="VAN">Van</option>
                    <option value="MINIBUS">Mini Bus</option>
                    <option value="CAR">Car</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
                  <select required value={formData.fuelType} onChange={e => setFormData({...formData, fuelType: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm">
                    <option value="DIESEL">Diesel</option>
                    <option value="PETROL">Petrol</option>
                    <option value="CNG">CNG</option>
                    <option value="ELECTRIC">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                  <input required type="text" placeholder="e.g. Tata Motors / Ashok Leyland" value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model Name</label>
                  <input required type="text" placeholder="e.g. Starbus Ultra" value={formData.modelName} onChange={e => setFormData({...formData, modelName: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Seating Capacity</label>
                  <input required type="number" min="1" value={formData.seatingCapacity} onChange={e => setFormData({...formData, seatingCapacity: +e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Capacity</label>
                  <input required type="number" min="1" value={formData.totalCapacity} onChange={e => setFormData({...formData, totalCapacity: +e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Insurance Expiry</label>
                  <input type="date" value={formData.insuranceExpiry} onChange={e => setFormData({...formData, insuranceExpiry: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fitness Expiry</label>
                  <input type="date" value={formData.fitnessExpiry} onChange={e => setFormData({...formData, fitnessExpiry: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Permit Expiry</label>
                  <input type="date" value={formData.permitExpiry} onChange={e => setFormData({...formData, permitExpiry: e.target.value})} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md text-sm hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 text-sm font-medium">
                  {editingVehicleId ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUTORY DOCUMENTS MODAL */}
      {docsModal.open && docsModal.vehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl m-4">
            <h2 className="text-xl font-bold mb-1 text-gray-900">
              Statutory Documents & Expiry
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Vehicle: <span className="font-semibold text-gray-800">{docsModal.vehicle.vehicleNumber}</span> ({docsModal.vehicle.registrationNumber})
            </p>

            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Insurance Certificate</label>
                  {getDocStatusBadge(docsForm.insuranceExpiry)}
                </div>
                <input
                  type="date"
                  value={docsForm.insuranceExpiry}
                  onChange={e => setDocsForm({ ...docsForm, insuranceExpiry: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Fitness / RTO Inspection</label>
                  {getDocStatusBadge(docsForm.fitnessExpiry)}
                </div>
                <input
                  type="date"
                  value={docsForm.fitnessExpiry}
                  onChange={e => setDocsForm({ ...docsForm, fitnessExpiry: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">Commercial Transport Permit</label>
                  {getDocStatusBadge(docsForm.permitExpiry)}
                </div>
                <input
                  type="date"
                  value={docsForm.permitExpiry}
                  onChange={e => setDocsForm({ ...docsForm, permitExpiry: e.target.value })}
                  className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-3 border-t">
              <button
                type="button"
                onClick={() => setDocsModal({ open: false, vehicle: null })}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md text-sm hover:bg-gray-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveDocs}
                disabled={updatingDocs}
                className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 text-sm font-medium"
              >
                {updatingDocs ? 'Saving...' : 'Update Expiry Dates'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLES TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Vehicle</th>
              <th className="px-6 py-4">Registration</th>
              <th className="px-6 py-4">Capacity</th>
              <th className="px-6 py-4">Statutory Docs</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={6} className="px-6 py-4 text-center">Loading vehicles...</td></tr>}
            {!loading && vehicles.map(v => (
              <tr key={v._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                      {v.seatingCapacity > 20 ? '🚌' : '🚐'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{v.vehicleNumber}</p>
                      <p className="text-xs text-gray-500">{v.manufacturer} {v.modelName}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-gray-600">{v.registrationNumber}</td>
                <td className="px-6 py-4 font-medium">{v.seatingCapacity} Seats</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {getDocStatusBadge(v.insuranceExpiry)}
                    {getDocStatusBadge(v.fitnessExpiry)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    v.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    v.status === 'UNDER_MAINTENANCE' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {v.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleOpenDocs(v)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm mr-3 transition"
                  >
                    Docs
                  </button>
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium text-sm mr-3 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(v._id)}
                    className="text-red-600 hover:text-red-900 font-medium text-sm transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!loading && vehicles.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No vehicles found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FleetManagement;
