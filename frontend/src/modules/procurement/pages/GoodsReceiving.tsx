import React, { useState } from 'react';
import {
  AssignmentTurnedIn as ReceiveIcon,
  Search as SearchIcon,
  Inventory as BoxIcon,
  CheckCircle as CheckIcon,
  Error as AlertIcon,
  QrCodeScanner as ScanIcon,
  Check as TickIcon,
} from '@mui/icons-material';

interface DeliveryPO {
  poId: string;
  vendor: string;
  items: number;
  expected: string;
  status: string;
}

interface DeliveryItem {
  id: string;
  name: string;
  qtyOrdered: number;
  qtyReceived: number;
  status: string;
}

const INITIAL_DELIVERIES: DeliveryPO[] = [];
const INITIAL_ITEMS: DeliveryItem[] = [];

const GoodsReceiving: React.FC = () => {
  const [deliveries, setDeliveries] = useState<DeliveryPO[]>(INITIAL_DELIVERIES);
  const [selectedPO, setSelectedPO] = useState<DeliveryPO | null>(null);
  const [items, setItems] = useState<DeliveryItem[]>(INITIAL_ITEMS);

  const handleReceive = (id: string, qty: number) => {
    setItems(items.map(i => i.id === id ? { ...i, qtyReceived: qty, status: qty === i.qtyOrdered ? 'RECEIVED' : 'PARTIAL' } : i));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-2xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <ReceiveIcon style={{ fontSize: 28 }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">Receiving Desk</h1>
            <p className="text-emerald-100 text-sm mt-1">Check-in goods against Purchase Orders and update inventory.</p>
          </div>
        </div>
        <div className="relative z-10 flex gap-3">
          <button className="flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-50 transition-colors">
            <ScanIcon style={{ fontSize: 18 }} /> Scan Barcode
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Pending Deliveries */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShippingIcon className="text-emerald-500" /> Incoming Shipments
            </h2>
            
            <div className="relative mb-4">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" style={{ fontSize: 18 }} />
              <input type="text" placeholder="Search PO Number..." className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div className="space-y-3">
              {deliveries.length === 0 ? (
                <div className="text-center p-6 border border-dashed border-gray-200 rounded-2xl text-gray-400">
                  <BoxIcon style={{ fontSize: 32 }} className="mx-auto mb-1 opacity-50" />
                  <p className="text-xs font-bold text-gray-600">No Pending Deliveries</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Incoming shipments from approved POs will appear here.</p>
                </div>
              ) : (
                deliveries.map(del => (
                <div 
                  key={del.poId} 
                  onClick={() => setSelectedPO(del)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedPO?.poId === del.poId ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-gray-100 hover:border-emerald-300'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-gray-900 font-mono">{del.poId}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${del.status === 'DELAYED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {del.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 truncate">{del.vendor}</p>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><BoxIcon style={{ fontSize: 14 }} /> {del.items} items</span>
                    <span>Expected: {del.expected}</span>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>

        {/* Right Side: Check-in Interface */}
        <div className="lg:col-span-2">
          {selectedPO ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
              
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Checking in Delivery for</p>
                  <h2 className="text-2xl font-black text-gray-900 font-mono">{selectedPO.poId}</h2>
                  <p className="text-sm font-semibold text-emerald-600 mt-1">{selectedPO.vendor}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-gray-900">{items.filter(i => i.status === 'RECEIVED').length}<span className="text-lg text-gray-400">/{items.length}</span></p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Items Checked</p>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-2">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Item Description</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Ordered</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-center">Received</th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-400 text-sm">
                          No items loaded for this purchase order.
                        </td>
                      </tr>
                    ) : (
                      items.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">Item #{item.id}</p>
                        </td>
                        <td className="p-4 text-center font-black text-gray-900">{item.qtyOrdered}</td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <input 
                              type="number" 
                              min="0" 
                              max={item.qtyOrdered}
                              value={item.qtyReceived}
                              onChange={(e) => handleReceive(item.id, parseInt(e.target.value) || 0)}
                              className="w-16 p-2 text-center font-bold bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            />
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {item.status === 'RECEIVED' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                              <CheckIcon style={{ fontSize: 14 }} /> Received
                            </span>
                          ) : item.status === 'PARTIAL' ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                              <AlertIcon style={{ fontSize: 14 }} /> Partial
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleReceive(item.id, item.qtyOrdered)}
                              className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 hover:bg-emerald-500 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                            >
                              <TickIcon style={{ fontSize: 14 }} /> Mark Full
                            </button>
                          )}
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <p className="text-sm text-gray-500 font-medium">Please verify all quantities before generating the GRN (Goods Receipt Note).</p>
                <button 
                  disabled={items.length === 0 || items.every(i => i.status === 'PENDING')}
                  className="bg-emerald-600 disabled:bg-gray-300 disabled:text-gray-500 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-200 disabled:shadow-none"
                >
                  Generate GRN
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center text-gray-400 flex flex-col items-center justify-center h-full min-h-[350px]">
              <ReceiveIcon style={{ fontSize: 48 }} className="text-gray-300 mb-2" />
              <p className="font-bold text-gray-700 text-lg">No Shipment Selected</p>
              <p className="text-sm text-gray-400 mt-1 max-w-sm">Select an incoming purchase order from the left to start checking in delivered items and verifying quantities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Dummy icon for Shipping (mocking for layout)
const ShippingIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

export default GoodsReceiving;
