import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Notifications as BellIcon,
  Close as CloseIcon,
  DirectionsBus as BusIcon,
  LocalLibrary as LibraryIcon,
  Security as SecurityIcon,
  Chat as ChatIcon,
  Hotel as HotelIcon,
  Payment as PaymentIcon,
  EventAvailable as LeaveIcon,
  CheckCircle as AttendanceIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import {
  subscribeToRealtimeNotifications,
  type RealtimeNotification
} from '../services/realtimeNotificationBus';

export const RealtimeNotificationToaster: React.FC = () => {
  const navigate = useNavigate();
  const [activeNotif, setActiveNotif] = useState<RealtimeNotification | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeNotifications((notif) => {
      setActiveNotif(notif);
      const timer = setTimeout(() => {
        setActiveNotif(curr => (curr?.id === notif.id ? null : curr));
      }, 6000);
      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  if (!activeNotif) return null;

  const getCategoryIcon = () => {
    switch (activeNotif.category) {
      case 'TRANSPORT': return <BusIcon fontSize="small" className="text-blue-500" />;
      case 'LIBRARY': return <LibraryIcon fontSize="small" className="text-purple-500" />;
      case 'SECURITY': return <SecurityIcon fontSize="small" className="text-emerald-500" />;
      case 'CHAT': return <ChatIcon fontSize="small" className="text-indigo-500" />;
      case 'HOSTEL': return <HotelIcon fontSize="small" className="text-teal-600" />;
      case 'FEES': return <PaymentIcon fontSize="small" className="text-amber-600" />;
      case 'LEAVE': return <LeaveIcon fontSize="small" className="text-indigo-600" />;
      case 'ATTENDANCE': return <AttendanceIcon fontSize="small" className="text-emerald-600" />;
      default: return <BellIcon fontSize="small" className="text-amber-500" />;
    }
  };

  const getBorderColor = () => {
    switch (activeNotif.severity) {
      case 'error': return 'border-rose-500/80 bg-rose-50/95';
      case 'warning': return 'border-amber-500/80 bg-amber-50/95';
      case 'success': return 'border-emerald-500/80 bg-emerald-50/95';
      default: return 'border-blue-500/80 bg-blue-50/95';
    }
  };

  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 relative ${getBorderColor()}`}>
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-200">
          {getCategoryIcon()}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              {activeNotif.category}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 leading-tight">
            {activeNotif.title}
          </h4>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {activeNotif.message}
          </p>

          {activeNotif.link && (
            <button
              onClick={() => {
                navigate(activeNotif.link!);
                setActiveNotif(null);
              }}
              className="mt-2 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
            >
              View Details <ArrowIcon style={{ fontSize: 12 }} />
            </button>
          )}
        </div>

        <button
          onClick={() => setActiveNotif(null)}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
        >
          <CloseIcon style={{ fontSize: 16 }} />
        </button>
      </div>
    </div>
  );
};

export default RealtimeNotificationToaster;
