import React, { useState, useEffect } from 'react';
import {
  ShoppingCart as CartIcon,
  ReceiptLong as POIcon,
  AssignmentTurnedIn as ReceiveIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendIcon,
  CheckCircle as CheckIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { LinearProgress } from '@mui/material';
import api from '../../../core/api/axios';
import { useNavigate } from 'react-router-dom';

const statusColors: Record<string, string> = {
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  DISPATCHED: 'bg-purple-100 text-purple-700 animate-pulse',
  IN_TRANSIT: 'bg-purple-100 text-purple-700 animate-pulse',
  RECEIVED: 'bg-gray-100 text-gray-500',
  PENDING_VENDOR: 'bg-orange-100 text-orange-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const ProcurementDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [prs, setPrs] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/procurement/requests').catch(() => null),
      api.get('/procurement/orders').catch(() => null),
    ])
      .then(([prRes, poRes]) => {
        if (prRes?.data?.data && Array.isArray(prRes.data.data)) {
          setPrs(prRes.data.data);
        }
        if (poRes?.data?.data && Array.isArray(poRes.data.data)) {
          setPos(poRes.data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingPRsCount = prs.filter((p: any) => p.status === 'PENDING_APPROVAL' || p.status === 'PENDING').length;
  const activePOsCount = pos.filter((p: any) => p.status !== 'CANCELLED' && p.status !== 'RECEIVED').length;
  const inTransitCount = pos.filter((p: any) => p.status === 'DISPATCHED' || p.status === 'IN_TRANSIT').length;
  const totalSpent = pos.reduce((acc, p) => acc + (p.totalAmount || p.total || p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 space-y-6">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 left-10 w-32 h-32 bg-white/5 rounded-full" />
        
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">📦 Procurement Command Center</h1>
            <p className="text-blue-200 text-sm">Manage supply chain, purchase requests, vendor orders, and inventory receiving.</p>
          </div>
          
          <div className="flex gap-3">
            {[
              { label: 'Pending PRs', value: pendingPRsCount, color: 'bg-amber-500/30' },
              { label: 'Active POs', value: activePOsCount, color: 'bg-blue-500/30' },
              { label: 'In Transit', value: inTransitCount, color: 'bg-purple-500/30' },
            ].map(s => (
              <div key={s.label} className={`${s.color} backdrop-blur rounded-2xl px-4 py-3 text-center`}>
                <p className="text-xl font-black">{s.value}</p>
                <p className="text-xs text-blue-200 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Purchase Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <CartIcon style={{ fontSize: 18 }} />
                </div>
                <h2 className="font-bold text-gray-800">Recent Purchase Requests</h2>
              </div>
              <button onClick={() => navigate('/inventory/purchases')} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 border-0 bg-transparent cursor-pointer">
                View All <ArrowIcon style={{ fontSize: 14 }} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {prs.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No purchase requests found. Requisitions created by departments will appear here.
                </div>
              ) : (
                prs.map(pr => (
                  <div key={pr._id || pr.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-gray-400">{pr.code || pr.id || 'PR-001'}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${pr.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {pr.priority || 'NORMAL'} Priority
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900">{pr.title || pr.item || 'Purchase Requisition'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Requested by {pr.department || pr.dept || 'Administration'} on {pr.createdAt ? new Date(pr.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 mb-1">₹ {(pr.estimatedAmount || pr.amount || 0).toLocaleString()}</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${statusColors[pr.status] || 'bg-gray-100 text-gray-600'}`}>
                        {(pr.status || 'PENDING').replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Purchase Orders */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <POIcon style={{ fontSize: 18 }} />
                </div>
                <h2 className="font-bold text-gray-800">Active Purchase Orders</h2>
              </div>
              <button onClick={() => navigate('/inventory/purchases')} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 border-0 bg-transparent cursor-pointer">
                View All <ArrowIcon style={{ fontSize: 14 }} />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {pos.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No active purchase orders found. Orders issued to vendors will appear here.
                </div>
              ) : (
                pos.map(po => (
                  <div key={po._id || po.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-black text-xs border border-gray-300">
                        {(po.vendorName || po.vendor || 'V').charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-indigo-500">{po.orderNumber || po.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[po.status] || 'bg-gray-100 text-gray-600'}`}>
                            {(po.status || 'ACTIVE').replace('_', ' ')}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900">{po.vendorName || po.vendor || 'Authorized Supplier'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{po.items?.length || po.itemsCount || 0} items · Date: {po.createdAt ? new Date(po.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900">₹ {(po.totalAmount || po.total || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Quick Actions & Spend Analysis */}
        <div className="space-y-6">
          
          {/* Quick Actions Grid */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'New Request', icon: <CartIcon />, color: 'bg-blue-50 text-blue-600 hover:bg-blue-100', path: '/inventory/purchases' },
                { label: 'Create PO', icon: <POIcon />, color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100', path: '/inventory/purchases' },
                { label: 'Receive Goods', icon: <ReceiveIcon />, color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100', path: '/procurement/goods-receiving' },
                { label: 'Item Catalog', icon: <CheckIcon />, color: 'bg-purple-50 text-purple-600 hover:bg-purple-100', path: '/inventory/items' },
              ].map(action => (
                <button 
                  key={action.label} 
                  onClick={() => navigate(action.path)}
                  className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors border-0 cursor-pointer ${action.color}`}
                >
                  <div style={{ fontSize: 24, display: 'flex' }}>
                    {action.icon}
                  </div>
                  <span className="text-xs font-bold text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Spend Analysis */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 opacity-10 rounded-bl-full transition-transform group-hover:scale-110" />
            
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <MoneyIcon style={{ fontSize: 18 }} />
              </div>
              <h2 className="font-bold text-gray-800">Spend Analysis</h2>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Ordered (YTD)</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-gray-900">₹ {totalSpent.toLocaleString()}</p>
                <span className="text-xs font-bold text-emerald-600 flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-md">
                  <TrendIcon style={{ fontSize: 12, marginRight: 2 }} /> Live
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-400">
                Department spend distribution will populate automatically as purchase orders are fulfilled.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;
