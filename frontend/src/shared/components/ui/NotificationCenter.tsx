import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  _id: string;
  status: string;
  createdAt: string;
  communicationId: {
    title: string;
    content: string;
    type: string;
    priority: string;
  };
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/communication/notifications?limit=20', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/communication/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Update local state
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'READ' } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/v1/communication/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
        <div className="flex items-center gap-4">
          <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:underline">Mark all read</button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-4">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No notifications</div>
        ) : (
          notifications.map(n => (
            <div 
              key={n._id} 
              className={`p-4 rounded-lg border ${n.status !== 'READ' ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'} transition-colors`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm font-semibold ${n.status !== 'READ' ? 'text-blue-900' : 'text-gray-800'}`}>
                  {n.communicationId?.title || 'Notification'}
                </h3>
                {n.status !== 'READ' && (
                  <button onClick={() => handleMarkAsRead(n._id)} title="Mark as read" className="text-blue-500 hover:text-blue-700">
                    <CheckCircle size={16} />
                  </button>
                )}
              </div>
              <div 
                className="text-xs text-gray-600 mb-2 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: n.communicationId?.content || '' }}
              />
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(n.createdAt).toLocaleString()}</span>
                {n.communicationId?.priority === 'URGENT' && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">URGENT</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
