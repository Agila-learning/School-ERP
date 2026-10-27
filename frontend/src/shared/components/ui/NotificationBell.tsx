import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react'; // Assuming lucide-react is available, common in modern React

interface NotificationBellProps {
  onOpenCenter: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onOpenCenter }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    // Fetch unread count from API
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/v1/communication/notifications/unread-count', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success && json.data) {
          setUnreadCount(json.data.count);
        }
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };

    fetchUnreadCount();
    // Poll every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button 
      onClick={onOpenCenter}
      className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
    >
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
