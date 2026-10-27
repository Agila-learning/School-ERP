import React, { useState } from 'react';
import {
  ReceiptLong as POIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as ApproveIcon,
  LocalShipping as ShippingIcon,
  PictureAsPdf as PdfIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface PurchaseOrder {
  id: string;
  vendor: string;
  prRef: string;
  items: number;
  total: number;
  status: string;
  date: string;
  expectedDate: string;
}

const INITIAL_POS: PurchaseOrder[] = [];

const statusConfig: Record<string, { label: string; color: string; gradient: string }> = {
  DRAFT: { label: 'Draft', color: 'text-gray-600 bg-gray-100', gradient: 'from-gray-400 to-gray-500' },
  APPROVED: { label: 'Approved', color: 'text-blue-700 bg-blue-100', gradient: 'from-blue-500 to-indigo-600' },
  DISPATCHED: { label: 'In Transit', color: 'text-purple-700 bg-purple-100 animate-pulse', gradient: 'from-purple-500 to-violet-600' },
  RECEIVED: { label: 'Received', color: 'text-emerald-700 bg-emerald-100', gradient: 'from-emerald-500 to-teal-600' },
};

const PurchaseOrderManager: React.FC = () => {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_POS);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? purchaseOrders : purchaseOrders.filter(p => p.status === filter);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <POIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Purchase Orders</h1>
            <p className="text-sm text-gray-500">Create, track, and manage vendor orders.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md">
          <AddIcon style={{ fontSize: 18 }} /> Create PO
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        {(['all', 'DRAFT', 'APPROVED', 'DISPATCHED', 'RECEIVED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
            {f === 'all' ? 'All Orders' : statusConfig[f].label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pr-2">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
            <input type="text" placeholder="Search POs..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"><FilterIcon style={{ fontSize: 18 }} /></button>
        </div>
      </div>

      {/* PO Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
            <POIcon style={{ fontSize: 44 }} className="text-gray-400 mx-auto mb-2 opacity-50" />
            <p className="font-bold text-gray-700 text-lg">No Purchase Orders Found</p>
            <p className="text-sm text-gray-400 mt-1">There are no purchase orders matching your filter criteria. Click "Create PO" to issue a new order.</p>
          </div>
        ) : (
          filtered.map(po => {
          const status = statusConfig[po.status];
          return (
            <div key={po.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group">
              <div className={`h-1.5 bg-gradient-to-r ${status.gradient}`} />
              <div className="p-5 space-y-4">
                
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-bold font-mono mb-1 border border-gray-200">
                      Ref: {po.prRef}
                    </span>
                    <h3 className="text-lg font-bold text-indigo-700 font-mono leading-none mb-1">{po.id}</h3>
                    <p className="text-xs text-gray-400">Created: {new Date(po.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Vendor & Details */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-xs text-gray-500 mb-0.5">Vendor</p>
                  <p className="font-bold text-gray-800 text-sm truncate">{po.vendor}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-gray-500 mb-0.5">Items / Total</p>
                    <p className="font-black text-gray-900 text-sm">{po.items} / ₹{po.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-gray-500 mb-0.5">Expected Delivery</p>
                    <p className={`font-bold text-sm ${po.status === 'RECEIVED' ? 'text-emerald-600' : 'text-gray-800'}`}>
                      {po.expectedDate}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-50">
                  <button className="flex-1 flex items-center justify-center gap-1 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 py-2.5 rounded-xl text-xs font-bold transition-colors">
                    <PdfIcon style={{ fontSize: 16 }} /> View PDF
                  </button>
                  {po.status === 'DRAFT' && (
                    <button className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 py-2.5 rounded-xl text-xs font-bold transition-colors">
                      <ApproveIcon style={{ fontSize: 16 }} /> Approve
                    </button>
                  )}
                  {po.status === 'APPROVED' && (
                    <button className="flex-1 flex items-center justify-center gap-1 bg-purple-50 text-purple-700 hover:bg-purple-100 py-2.5 rounded-xl text-xs font-bold transition-colors">
                      <ShippingIcon style={{ fontSize: 16 }} /> Mark Dispatched
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
};

export default PurchaseOrderManager;
