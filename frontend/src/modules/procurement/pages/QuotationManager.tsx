import React, { useState } from 'react';
import { 
  CompareArrows as CompareIcon, 
  RequestQuote as QuoteIcon, 
  Gavel as GavelIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

const QuotationManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const quotes = [
    { id: '1', reqId: 'REQ-2026-089', title: 'Library Books Replenishment', suppliers: 3, lowestBid: '₹45,000', status: 'pending' },
    { id: '2', reqId: 'REQ-2026-088', title: 'New Projectors (Class 10)', suppliers: 4, lowestBid: '₹1,20,000', status: 'pending' },
    { id: '3', reqId: 'REQ-2026-085', title: 'Sports Equipment', suppliers: 2, lowestBid: '₹35,000', status: 'awarded' },
  ];

  const filteredQuotes = quotes.filter(q => q.status === activeTab);

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col bg-gray-50/50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QuoteIcon className="text-indigo-600" /> Quotations & Bidding
          </h1>
          <p className="text-sm text-gray-500">Compare supplier quotations, evaluate bids, and award contracts</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow hover:bg-indigo-700">
          + Request New Quote
        </button>
      </div>

      <div className="flex gap-4 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-3 font-medium text-sm border-b-2 flex items-center gap-2 ${activeTab === 'pending' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <CompareIcon fontSize="small" /> Pending Evaluation (2)
        </button>
        <button 
          onClick={() => setActiveTab('awarded')}
          className={`px-4 py-3 font-medium text-sm border-b-2 flex items-center gap-2 ${activeTab === 'awarded' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <GavelIcon fontSize="small" /> Awarded Contracts
        </button>
        <button 
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-3 font-medium text-sm border-b-2 flex items-center gap-2 ${activeTab === 'rejected' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <CancelIcon fontSize="small" /> Rejected / Cancelled
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search request ID or title..." 
              className="pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-sm w-64 bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredQuotes.map((quote) => (
              <div key={quote.id} className="border border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md mb-2 inline-block">
                      {quote.reqId}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg">{quote.title}</h3>
                  </div>
                  {quote.status === 'awarded' && <CheckCircleIcon className="text-emerald-500" />}
                </div>
                
                <div className="flex-1 bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Bids Received</p>
                    <p className="font-bold text-gray-900 text-xl">{quote.suppliers} Suppliers</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Lowest Bid</p>
                    <p className="font-bold text-green-600 text-xl">{quote.lowestBid}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-bold flex items-center justify-center gap-1 shadow-sm">
                    {quote.status === 'pending' ? (
                      <><CompareIcon fontSize="small" /> Compare Bids</>
                    ) : (
                      <><GavelIcon fontSize="small" /> View Contract</>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {filteredQuotes.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No quotations found in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationManager;
