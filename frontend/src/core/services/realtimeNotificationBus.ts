export type NotificationCategory = 'TRANSPORT' | 'LIBRARY' | 'SECURITY' | 'CHAT' | 'ACADEMIC' | 'ADMIN' | 'HOSTEL' | 'FEES' | 'LEAVE' | 'ATTENDANCE';
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  timestamp: string;
  read: boolean;
  link?: string;
  roleTargets?: string[];
  meta?: Record<string, any>;
}

const STORAGE_KEY = 'erp_realtime_notifications_v1';
const EVENT_NAME = 'erp_realtime_notification';

// Web Audio API synthesized notification chime
export function playNotificationChime(tone: 'chime' | 'alert' | 'message' = 'chime') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Resume context if browser suspended it
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (tone === 'message') {
      // Friendly message pop (F5 -> A5)
      osc.frequency.setValueAtTime(698.46, now);
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (tone === 'alert') {
      // Warning chime (A4 -> E5)
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.48);
    } else {
      // Pleasant dual chime (C5 -> G5)
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.42);
    }
  } catch (err) {
    // Audio context may be restricted by user agent before first gesture
    console.debug('Audio chime skipped:', err);
  }
}

export function getStoredNotifications(): RealtimeNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults: RealtimeNotification[] = [
        {
          id: 'notif-init-1',
          title: 'Fleet Ready',
          message: 'Morning transport telemetry active. 4 buses on designated routes.',
          category: 'TRANSPORT',
          severity: 'info',
          timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
          read: false,
          link: '/transport/dashboard'
        },
        {
          id: 'notif-init-2',
          title: 'Library Overdue Notice',
          message: 'Computer Networks (CS-101) issued to Rohit Sharma due today by 5:00 PM.',
          category: 'LIBRARY',
          severity: 'warning',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          read: false,
          link: '/library/circulation'
        },
        {
          id: 'notif-init-3',
          title: 'Security Gate Clearance',
          message: 'Bus BUS-01 cleared main security gate. Departure logged.',
          category: 'SECURITY',
          severity: 'success',
          timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
          read: true,
          link: '/security/watchman'
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotifications(notifications: RealtimeNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 100)));
  } catch (err) {
    console.error('Failed to save notifications', err);
  }
}

export function publishNotification(params: {
  title: string;
  message: string;
  category: NotificationCategory;
  severity?: NotificationSeverity;
  link?: string;
  roleTargets?: string[];
  meta?: Record<string, any>;
  playChime?: boolean;
}): RealtimeNotification {
  const notif: RealtimeNotification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: params.title,
    message: params.message,
    category: params.category,
    severity: params.severity || 'info',
    timestamp: new Date().toISOString(),
    read: false,
    link: params.link,
    roleTargets: params.roleTargets,
    meta: params.meta,
  };

  const existing = getStoredNotifications();
  const updated = [notif, ...existing];
  saveNotifications(updated);

  if (params.playChime !== false) {
    if (params.severity === 'error' || params.severity === 'warning') {
      playNotificationChime('alert');
    } else if (params.category === 'CHAT') {
      playNotificationChime('message');
    } else {
      playNotificationChime('chime');
    }
  }

  // Dispatch custom window event
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: notif }));

  return notif;
}

export function markNotificationAsRead(id: string): RealtimeNotification[] {
  const items = getStoredNotifications().map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(items);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { action: 'READ_UPDATED', id } }));
  return items;
}

export function markAllNotificationsAsRead(): RealtimeNotification[] {
  const items = getStoredNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(items);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { action: 'ALL_READ' } }));
  return items;
}

export function subscribeToRealtimeNotifications(callback: (notif: RealtimeNotification) => void): () => void {
  const handler = (e: Event) => {
    const custom = e as CustomEvent<RealtimeNotification>;
    if (custom.detail && (custom.detail as any).id) {
      callback(custom.detail);
    }
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}
