import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Circle as CircleIcon,
  DoneAll as DoneAllIcon,
  DirectionsBus as BusIcon,
  LocalLibrary as LibraryIcon,
  Security as SecurityIcon,
  School as TeacherIcon,
  Person as StudentIcon,
  SupervisorAccount as ParentIcon,
  AdminPanelSettings as AdminIcon,
  Science as LabIcon,
  Hotel as HotelIcon,
  Check as CheckIcon,
  ExpandMore as ExpandMoreIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon,
  Shield as ShieldIcon
} from '@mui/icons-material';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import { publishNotification, playNotificationChime } from '../services/realtimeNotificationBus';

export type UserRoleType = 
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PRINCIPAL'
  | 'TEACHER' 
  | 'STUDENT' 
  | 'PARENT' 
  | 'TRANSPORT_DRIVER' 
  | 'WATCHMAN' 
  | 'LIBRARIAN' 
  | 'LAB_STAFF'
  | 'HOSTEL_WARDEN';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRoleType;
  text: string;
  timestamp: string;
  isMe: boolean;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatContact {
  id: string;
  name: string;
  role: UserRoleType;
  roleLabel: string;
  avatarSeed: string;
  online: boolean;
  departmentOrInfo: string;
  lastMessage?: string;
  lastTime?: string;
  unreadCount?: number;
}

const STORAGE_CHAT_KEY = 'erp_role_chat_data_v3';

// ─── STRICT ROLE-BASED ACCESS CONTROL (RBAC) MATRIX ───
// Defines which target roles a logged-in persona is allowed to chat with.
// SUPER ADMIN is strictly isolated: CAN ONLY CHAT WITH SCHOOL ADMIN & PRINCIPAL!
export const ROLE_COMMUNICATION_MATRIX: Record<UserRoleType, UserRoleType[]> = {
  SUPER_ADMIN: ['ADMIN', 'PRINCIPAL'], // Strictly only School Admin and Principal!
  ADMIN: ['ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT', 'TRANSPORT_DRIVER', 'WATCHMAN', 'LIBRARIAN', 'LAB_STAFF', 'HOSTEL_WARDEN', 'SUPER_ADMIN'],
  PRINCIPAL: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'TRANSPORT_DRIVER', 'WATCHMAN', 'LIBRARIAN', 'LAB_STAFF', 'HOSTEL_WARDEN', 'SUPER_ADMIN'],
  TEACHER: ['TEACHER', 'PARENT', 'STUDENT', 'LAB_STAFF', 'LIBRARIAN', 'ADMIN', 'PRINCIPAL'],
  STUDENT: ['TEACHER', 'LIBRARIAN', 'ADMIN', 'PRINCIPAL', 'HOSTEL_WARDEN'],
  PARENT: ['TEACHER', 'TRANSPORT_DRIVER', 'ADMIN', 'PRINCIPAL', 'HOSTEL_WARDEN'],
  WATCHMAN: ['TRANSPORT_DRIVER', 'ADMIN', 'WATCHMAN', 'HOSTEL_WARDEN'],
  LIBRARIAN: ['STUDENT', 'TEACHER', 'ADMIN', 'LIBRARIAN'],
  TRANSPORT_DRIVER: ['WATCHMAN', 'ADMIN', 'PARENT', 'TRANSPORT_DRIVER'],
  LAB_STAFF: ['TEACHER', 'ADMIN', 'LAB_STAFF'],
  HOSTEL_WARDEN: ['ADMIN', 'WATCHMAN', 'PARENT', 'STUDENT', 'HOSTEL_WARDEN']
};

// Isolated contacts visible exclusively to Platform Super Admin: ONLY School Admins and Principals
export const SUPER_ADMIN_CONTACTS: ChatContact[] = [
  { id: 'sa-sch-adm-1', name: 'Greenwood High — School Admin (Mr. Rajesh Sharma)', role: 'ADMIN', roleLabel: 'School Administrator', avatarSeed: 'RajeshAdmin', online: true, departmentOrInfo: 'Greenwood High Campus • Tenant ORG001' },
  { id: 'sa-sch-prn-1', name: 'Greenwood High — Principal (Dr. Sunita Kapoor)', role: 'PRINCIPAL', roleLabel: 'School Principal', avatarSeed: 'SunitaPrincipal', online: true, departmentOrInfo: 'Office of the Principal • Tenant ORG001' },
  { id: 'sa-sch-adm-2', name: 'St. Xavier Academy — School Admin (Mr. Anthony D\'Souza)', role: 'ADMIN', roleLabel: 'School Administrator', avatarSeed: 'AnthonyAdmin', online: true, departmentOrInfo: 'St. Xavier Campus • Tenant ORG002' },
  { id: 'sa-sch-prn-2', name: 'St. Xavier Academy — Principal (Rev. Dr. Thomas Paul)', role: 'PRINCIPAL', roleLabel: 'School Principal', avatarSeed: 'ThomasPrincipal', online: true, departmentOrInfo: 'Principal Secretariat • Tenant ORG002' },
  { id: 'sa-sch-adm-3', name: 'Delhi Public School — School Admin (Ms. Neha Gupta)', role: 'ADMIN', roleLabel: 'School Administrator', avatarSeed: 'NehaAdmin', online: true, departmentOrInfo: 'DPS City Campus • Tenant ORG003' },
  { id: 'sa-sch-prn-3', name: 'Delhi Public School — Principal (Prof. R.K. Mehta)', role: 'PRINCIPAL', roleLabel: 'School Principal', avatarSeed: 'MehtaPrincipal', online: true, departmentOrInfo: 'Executive Directorate • Tenant ORG003' },
];

// General school desks / departments in the ERP (for school-level users)
const ALL_SYSTEM_CONTACTS: ChatContact[] = [
  { id: 'desk-adm-1', name: 'Office Administration', role: 'ADMIN', roleLabel: 'Central Admin', avatarSeed: 'OfficeAdmin', online: true, departmentOrInfo: 'Principal Secretariat & HR' },
  { id: 'desk-adm-2', name: 'Accounts & Fees Desk', role: 'ADMIN', roleLabel: 'Finance Office', avatarSeed: 'Accounts', online: true, departmentOrInfo: 'Bursar & Fee Collection' },
  { id: 'desk-prn-1', name: 'Principal Executive Office', role: 'PRINCIPAL', roleLabel: 'School Principal', avatarSeed: 'PrincipalOffice', online: true, departmentOrInfo: 'Campus Head & Academic Director' },
  { id: 'desk-hostel-1', name: 'Hostel Warden Command (Block A & B)', role: 'HOSTEL_WARDEN', roleLabel: 'Hostel Warden', avatarSeed: 'HostelWarden', online: true, departmentOrInfo: 'Residency, Bed Allocation & Evening Roll Call' },
  { id: 'desk-sec-1', name: 'Gate 1 Main Campus Security', role: 'WATCHMAN', roleLabel: 'Campus Security', avatarSeed: 'Gate1', online: true, departmentOrInfo: 'Main Gate & Student Outpass Checkpoint' },
  { id: 'desk-teach-1', name: 'Mrs. Kavita Rao (Class Teacher)', role: 'TEACHER', roleLabel: 'Academic Faculty', avatarSeed: 'Kavita', online: true, departmentOrInfo: 'Grade 10-A Mentor & Math' },
  { id: 'desk-teach-2', name: 'Dr. Anita Verma (Science HOD)', role: 'TEACHER', roleLabel: 'Physics Faculty', avatarSeed: 'Anita', online: true, departmentOrInfo: 'Senior Secondary Science' },
  { id: 'desk-stud-1', name: 'Rohit Sharma (Class 10A)', role: 'STUDENT', roleLabel: 'Student Scholar', avatarSeed: 'Rohit', online: true, departmentOrInfo: 'Roll #24 • Resident Room A-101' },
  { id: 'desk-par-1', name: 'Mrs. Priya Sharma (Parent)', role: 'PARENT', roleLabel: 'Guardian', avatarSeed: 'Priya', online: false, departmentOrInfo: 'Mother of Rohit (Hostel Resident)' },
  { id: 'desk-lib-1', name: 'Central Library Circulation', role: 'LIBRARIAN', roleLabel: 'Chief Librarian', avatarSeed: 'LibDesk', online: true, departmentOrInfo: 'Book Issues & Catalog Desk' },
  { id: 'desk-drv-1', name: 'Raju Driver (School Bus 01)', role: 'TRANSPORT_DRIVER', roleLabel: 'Fleet Lead', avatarSeed: 'Raju', online: true, departmentOrInfo: 'Route 1 - Western Corridor' },
  { id: 'desk-lab-1', name: 'Science Laboratory Incharge', role: 'LAB_STAFF', roleLabel: 'Lab Technician', avatarSeed: 'LabTech', online: true, departmentOrInfo: 'Physics & Chemistry Bay B' }
];

// Initial default conversations
const DEFAULT_CONVERSATIONS: Record<string, ChatMessage[]> = {
  'desk-adm-1': [
    { id: 'm-adm-1', senderId: 'desk-adm-1', senderName: 'Office Administration', senderRole: 'ADMIN', text: 'Welcome to the Role-Based ERP Communication network.', timestamp: '08:30 AM', isMe: false, status: 'read' }
  ],
  'sa-sch-adm-1': [
    { id: 'm-sa-1', senderId: 'sa-sch-adm-1', senderName: 'Greenwood High — School Admin', senderRole: 'ADMIN', text: 'Good morning Super Admin. Greenwood High portal data is synced and active.', timestamp: '08:30 AM', isMe: false, status: 'read' }
  ],
  'sa-sch-prn-1': [
    { id: 'm-sa-2', senderId: 'sa-sch-prn-1', senderName: 'Greenwood High — Principal', senderRole: 'PRINCIPAL', text: 'Greetings Super Admin. Term assessments and academic calendar are updated.', timestamp: '08:45 AM', isMe: false, status: 'read' }
  ],
  'desk-teach-1': [
    { id: 'm-t-1', senderId: 'desk-teach-1', senderName: 'Mrs. Kavita Rao', senderRole: 'TEACHER', text: 'Good morning. Academic queries can be posted here.', timestamp: '09:00 AM', isMe: false, status: 'read' }
  ],
  'desk-sec-1': [
    { id: 'm-sec-1', senderId: 'desk-sec-1', senderName: 'Gate 1 Security', senderRole: 'WATCHMAN', text: 'Gate 1 security post active. Visitor log synced.', timestamp: '07:45 AM', isMe: false, status: 'read' }
  ]
};

// Canned quick replies by role
const QUICK_RESPONSES: Record<UserRoleType, string[]> = {
  TRANSPORT_DRIVER: [
    'Approaching stop in 3 minutes.',
    'All students safely onboard and seated.',
    'Slow traffic on road, running 5 mins late.',
    'Reached school gate safely.'
  ],
  LIBRARIAN: [
    'Book is available in Rack B-3, Shelf 2.',
    'Book renewed successfully for 7 days.',
    'Reading Room Table 4B reserved for you.',
    'Please clear overdue dues of ₹15 at counter.'
  ],
  WATCHMAN: [
    'Gate 1 cleared, entry authorized.',
    'Bus arrival logged in security system.',
    'Visitor pass verified and approved.',
    'Please halt at security checkpoint.'
  ],
  TEACHER: [
    'Homework circular uploaded to portal.',
    'Student marked present in laboratory.',
    'Meeting scheduled for tomorrow at 3 PM.',
    'Observation sheet shared with student.'
  ],
  STUDENT: [
    'Thank you, will check immediately.',
    'Is the reading room open this evening?',
    'Submitted the assignment online.',
    'Will visit the circulation desk during recess.'
  ],
  PARENT: [
    'Child is ready at the bus stop.',
    'Thank you for the update.',
    'Please note child will be absent tomorrow.',
    'Fee receipt received, thank you.'
  ],
  LAB_STAFF: [
    'Lab apparatus sanitized and set up.',
    'Attendance imported for Class 12 Section B.',
    'Chemical inventory restocked.',
    'Observation record verified.'
  ],
  HOSTEL_WARDEN: [
    'Night roll call completed. All resident scholars accounted for.',
    'Gate outpass approved with verified parent consent.',
    'Room allocation confirmed. Bed keys ready at warden office.',
    'Student reported to campus sick bay for medical observation.',
    'Reminder: Boarding curfew begins strictly at 9:00 PM.'
  ],
  ADMIN: [
    'Circular published to all students and staff.',
    'Gate entry record verified.',
    'Fleet telemetry running normally.',
    'Request approved by office administration.'
  ],
  SUPER_ADMIN: [
    'Please submit the updated campus audit compliance report.',
    'School subscription renewal has been scheduled.',
    'Notice: Platform maintenance scheduled this Sunday at 2:00 AM.',
    'Please coordinate with your school principal regarding syllabus completion.'
  ],
  PRINCIPAL: [
    'Academic term results have been verified.',
    'Staff coordination meeting concluded.',
    'Parent-teacher conference schedule finalized.',
    'Campus inspection completed successfully.'
  ]
};

export const RoleChatWidget: React.FC = () => {
  const location = useLocation();
  const { 
    user, 
    isAdmin, 
    isSuperAdmin, 
    isPrincipal, 
    isTeacher, 
    isClassCoordinator,
    isStudent, 
    isParent, 
    isDriver, 
    isTransportManager, 
    isLibrarian, 
    isLabTechnician,
    isHostelWarden
  } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRoleType>('ADMIN');
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(1);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  
  // Mobile responsive view: toggle between 'contacts' list and 'chat' screen
  const [mobileScreen, setMobileScreen] = useState<'contacts' | 'chat'>('contacts');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // Determine legitimate authenticated role from user context and active path
  const detectedRole = useMemo<UserRoleType>(() => {
    if (isSuperAdmin || user?.role === 'SUPER_ADMIN' || user?.roles?.some((r: any) => r.name?.toUpperCase().includes('SUPER'))) {
      return 'SUPER_ADMIN';
    }
    if (isPrincipal) return 'PRINCIPAL';
    if (isAdmin) return 'ADMIN';
    if (isStudent) return 'STUDENT';
    if (isParent) return 'PARENT';
    if (isDriver || isTransportManager) return 'TRANSPORT_DRIVER';
    if (isLibrarian) return 'LIBRARIAN';
    if (isLabTechnician) return 'LAB_STAFF';
    if (isTeacher || isClassCoordinator) return 'TEACHER';
    if (
      isHostelWarden || 
      user?.roles?.some((r: any) => r.name?.toUpperCase().includes('WARDEN') || r.name?.toUpperCase().includes('HOSTEL')) || 
      location.pathname.startsWith('/hostel')
    ) {
      return 'HOSTEL_WARDEN';
    }
    if (user?.roles?.some((r: any) => r.name?.toUpperCase().includes('WATCH') || r.name?.toUpperCase().includes('SEC'))) {
      return 'WATCHMAN';
    }
    return 'ADMIN';
  }, [user, isStudent, isParent, isDriver, isTransportManager, isLibrarian, isLabTechnician, isTeacher, isClassCoordinator, isHostelWarden, isAdmin, isPrincipal, isSuperAdmin, location.pathname]);

  // Sync active role with authenticated role
  useEffect(() => {
    setActiveRole(detectedRole);
  }, [detectedRole]);

  // Load conversations from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CHAT_KEY);
      if (stored) {
        setConversations(JSON.parse(stored));
      } else {
        setConversations(DEFAULT_CONVERSATIONS);
        localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(DEFAULT_CONVERSATIONS));
      }
    } catch {
      setConversations(DEFAULT_CONVERSATIONS);
    }

    const handleOpenRoleChat = (e: any) => {
      setIsOpen(true);
      // Only administrators can switch persona on external events
      if ((isAdmin || isSuperAdmin) && e.detail?.role) {
        setActiveRole(e.detail.role);
      }
    };
    const handleAiChatState = (e: any) => {
      if (e.detail && typeof e.detail.open === 'boolean') {
        setIsAiChatOpen(e.detail.open);
      }
    };

    window.addEventListener('open_role_chat', handleOpenRoleChat);
    window.addEventListener('erp:open-role-chat', handleOpenRoleChat);
    window.addEventListener('erp:ai-chat-state', handleAiChatState);
    return () => {
      window.removeEventListener('open_role_chat', handleOpenRoleChat);
      window.removeEventListener('erp:open-role-chat', handleOpenRoleChat);
      window.removeEventListener('erp:ai-chat-state', handleAiChatState);
    };
  }, [isAdmin, isSuperAdmin]);

  // Broadcast state
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('erp:role-chat-state', { detail: { open: isOpen } }));
  }, [isOpen]);

  // Check if target contact is authorized or restricted for active role
  const isContactAllowed = (contactRole: UserRoleType): boolean => {
    const allowedRoles = ROLE_COMMUNICATION_MATRIX[activeRole] || [];
    return allowedRoles.includes(contactRole);
  };

  // Contacts visible to the active role: Super Admin ONLY sees School Admins and Principals
  const availableContacts = useMemo(() => {
    if (activeRole === 'SUPER_ADMIN') {
      return SUPER_ADMIN_CONTACTS;
    }
    return ALL_SYSTEM_CONTACTS;
  }, [activeRole]);

  // Select default contact when role changes
  useEffect(() => {
    const firstAllowed = availableContacts.find(c => isContactAllowed(c.role));
    if (firstAllowed) {
      setActiveContact(firstAllowed);
    } else {
      setActiveContact(availableContacts[0] || null);
    }
    setMobileScreen('contacts');
  }, [activeRole, availableContacts]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeContact?.id, isTyping]);

  const handleRoleChange = (newRole: UserRoleType) => {
    if (!isAdmin && !isSuperAdmin) return;
    setActiveRole(newRole);
    setShowRoleMenu(false);
  };

  const handleSelectContact = (contact: ChatContact) => {
    setActiveContact(contact);
    setMobileScreen('chat');
  };

  const isCurrentContactRestricted = activeContact ? !isContactAllowed(activeContact.role) : false;

  const currentMessages = activeContact ? (conversations[activeContact.id] || []) : [];

  const handleSendMessage = (textToSend?: string) => {
    const msg = (textToSend || inputText).trim();
    if (!msg || !activeContact || isCurrentContactRestricted) return;

    const newMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      senderId: 'me',
      senderName: user?.firstName || 'Me',
      senderRole: activeRole,
      text: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sent'
    };

    const updated = {
      ...conversations,
      [activeContact.id]: [...(conversations[activeContact.id] || []), newMsg]
    };

    setConversations(updated);
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(updated));
    setInputText('');

    playNotificationChime('message');

    // Counter-party reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      let replyText = `Acknowledged from ${activeContact.name}. Recorded in ERP communication log.`;
      if (activeRole === 'SUPER_ADMIN') {
        if (activeContact.role === 'PRINCIPAL') {
          replyText = `Principal's Office: Message acknowledged from Platform Super Admin. Campus academic operations and directives are confidential.`;
        } else {
          replyText = `School Administration: Message received from Platform Super Admin. School portal configurations and tenant administration are updated.`;
        }
      } else if (activeContact.role === 'WATCHMAN') {
        replyText = `Security Gate: "${msg.substring(0, 30)}..." noted in gate checkpoint log.`;
      } else if (activeContact.role === 'TRANSPORT_DRIVER') {
        replyText = `Bus Telematics: Message received. Route safety protocols active.`;
      } else if (activeContact.role === 'LIBRARIAN') {
        replyText = `Circulation Desk: Noted. Circulation records updated accordingly.`;
      } else if (activeContact.role === 'TEACHER') {
        replyText = `Teacher Desk: Thank you for reaching out. Noted in the class record.`;
      } else if (activeContact.role === 'ADMIN') {
        replyText = `Administration Office: Your message has been received and routed to the concerned officer.`;
      } else if (activeContact.role === 'PRINCIPAL') {
        replyText = `Principal Executive Desk: Your query has been logged. We will review and advise.`;
      }

      const replyMsg: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        senderId: activeContact.id,
        senderName: activeContact.name,
        senderRole: activeContact.role,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        status: 'delivered'
      };

      const finalConversations = {
        ...updated,
        [activeContact.id]: [...(updated[activeContact.id] || []), replyMsg]
      };

      setConversations(finalConversations);
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(finalConversations));

      publishNotification({
        title: `Chat from ${activeContact.name} (${activeContact.roleLabel})`,
        message: replyText,
        category: 'CHAT',
        severity: 'info',
        link: '/communication/chat'
      });
    }, 1200);
  };

  const getRoleIcon = (role: UserRoleType) => {
    switch (role) {
      case 'SUPER_ADMIN': return <ShieldIcon fontSize="inherit" />;
      case 'PRINCIPAL': return <TeacherIcon fontSize="inherit" />;
      case 'TRANSPORT_DRIVER': return <BusIcon fontSize="inherit" />;
      case 'LIBRARIAN': return <LibraryIcon fontSize="inherit" />;
      case 'WATCHMAN': return <SecurityIcon fontSize="inherit" />;
      case 'TEACHER': return <TeacherIcon fontSize="inherit" />;
      case 'STUDENT': return <StudentIcon fontSize="inherit" />;
      case 'PARENT': return <ParentIcon fontSize="inherit" />;
      case 'LAB_STAFF': return <LabIcon fontSize="inherit" />;
      case 'HOSTEL_WARDEN': return <HotelIcon fontSize="inherit" />;
      default: return <AdminIcon fontSize="inherit" />;
    }
  };

  const filteredContacts = availableContacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.roleLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.departmentOrInfo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && !isAiChatOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setUnreadTotal(0);
          }}
          className="fixed bottom-20 right-4 sm:right-6 z-40 flex items-center gap-2.5 px-3.5 py-2.5 bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 text-white rounded-full shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300 group border border-white/30 backdrop-blur-md cursor-pointer"
          title="Open Role-Based ERP Communication"
        >
          <div className="relative">
            <ChatIcon style={{ fontSize: 20 }} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-700 animate-pulse" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black tracking-wide leading-tight">Role Chat</span>
            <span className="text-[9px] text-purple-200 font-semibold">
              {activeRole === 'SUPER_ADMIN' ? 'Super Admin' : activeRole === 'HOSTEL_WARDEN' ? 'Hostel Warden' : activeRole.toLowerCase().replace('_', ' ')}
            </span>
          </div>
          {unreadTotal > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 bg-rose-500 text-white text-[9px] font-black rounded-full shadow-sm animate-bounce">
              {unreadTotal}
            </span>
          )}
        </button>
      )}

      {/* Main Responsive Docked Modal */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-2 top-14 sm:inset-auto sm:bottom-5 sm:right-6 md:right-8 z-[1150] sm:w-[780px] md:w-[840px] sm:h-[600px] max-w-[96vw] max-h-[92vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200">
          
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white px-4 py-3 flex items-center justify-between border-b border-indigo-900/50 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Back button for mobile view */}
              {mobileScreen === 'chat' && (
                <button
                  onClick={() => setMobileScreen('contacts')}
                  className="sm:hidden p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white mr-1"
                  title="Back to contacts list"
                >
                  <ArrowBackIcon style={{ fontSize: 18 }} />
                </button>
              )}

              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                {getRoleIcon(activeRole)}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm tracking-wide truncate">ERP Communication</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>

                <div className="relative inline-block mt-0.5">
                  {(isAdmin || isSuperAdmin) ? (
                    <>
                      <button
                        onClick={() => setShowRoleMenu(!showRoleMenu)}
                        className="flex items-center gap-1 text-[11px] text-indigo-200 hover:text-white font-semibold bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                        title={isSuperAdmin ? "Super Admin Communication Channel" : "Administrators can preview communication as different roles"}
                      >
                        <span>Desk: <strong>{activeRole === 'SUPER_ADMIN' ? 'Platform Super Admin' : activeRole === 'HOSTEL_WARDEN' ? 'Hostel Warden' : activeRole.replace('_', ' ')}</strong></span>
                        <ExpandMoreIcon style={{ fontSize: 14 }} />
                      </button>

                      {showRoleMenu && (
                        <div className="absolute left-0 top-full mt-2 w-56 bg-white text-gray-900 rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {isSuperAdmin ? 'Platform Desks' : 'Simulate Role Desk'}
                          </div>
                          {(isSuperAdmin ? [
                            { role: 'SUPER_ADMIN', label: 'Platform Super Admin' },
                            { role: 'ADMIN', label: 'School Admin Desk' },
                            { role: 'PRINCIPAL', label: 'Principal Executive Desk' }
                          ] : [
                            { role: 'ADMIN', label: 'Office Administrator' },
                            { role: 'HOSTEL_WARDEN', label: 'Hostel Warden' },
                            { role: 'TEACHER', label: 'Faculty / Teacher' },
                            { role: 'STUDENT', label: 'Student Scholar' },
                            { role: 'PARENT', label: 'Parent / Guardian' },
                            { role: 'WATCHMAN', label: 'Security Watchman' },
                            { role: 'TRANSPORT_DRIVER', label: 'Bus Driver' },
                            { role: 'LIBRARIAN', label: 'Librarian' },
                            { role: 'LAB_STAFF', label: 'Lab Incharge' }
                          ]).map(item => (
                            <button
                              key={item.role}
                              onClick={() => handleRoleChange(item.role as UserRoleType)}
                              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-indigo-50 transition-colors ${
                                activeRole === item.role ? 'font-bold text-indigo-700 bg-indigo-50/60' : 'text-gray-700'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                {getRoleIcon(item.role as UserRoleType)}
                                {item.label}
                              </span>
                              {activeRole === item.role && <CheckIcon style={{ fontSize: 14 }} className="text-indigo-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[11px] text-indigo-200 font-semibold bg-white/10 px-2 py-0.5 rounded-lg">
                      My Role: <strong>{activeRole === 'SUPER_ADMIN' ? 'Super Admin' : activeRole === 'HOSTEL_WARDEN' ? 'Hostel Warden' : activeRole.replace('_', ' ')}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.dispatchEvent(new CustomEvent('erp:open-ai-chat'));
                }}
                className="hidden sm:flex px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-[11px] font-bold text-indigo-200 hover:text-white items-center gap-1.5 transition-colors border border-indigo-400/30 cursor-pointer"
                title="Switch to EduNexus AI Bot"
              >
                <span>EduNexus AI</span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                title="Close Chat"
              >
                <CloseIcon style={{ fontSize: 18 }} />
              </button>
            </div>
          </div>

          {/* Main 2-Column Responsive Body */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            
            {/* Left Column: Contacts Directory */}
            <div className={`w-full sm:w-72 md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col min-h-0 shrink-0 ${
              mobileScreen === 'chat' ? 'hidden sm:flex' : 'flex'
            }`}>
              
              {/* Search Bar */}
              <div className="p-3 border-b border-slate-200 bg-white shrink-0">
                <div className="relative">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" style={{ fontSize: 16 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search desks & personnel..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Contacts List with Restriction Badges */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
                {filteredContacts.map(contact => {
                  const isSelected = activeContact?.id === contact.id;
                  const isAllowed = isContactAllowed(contact.role);

                  return (
                    <div
                      key={contact.id}
                      onClick={() => handleSelectContact(contact)}
                      className={`p-2.5 rounded-2xl cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                          : isAllowed 
                            ? 'hover:bg-slate-200/70 text-gray-700 bg-white border border-slate-200/80' 
                            : 'bg-slate-100/80 text-gray-500 border border-slate-200 hover:bg-slate-200/50 opacity-90'
                      }`}
                    >
                      <div className="relative shrink-0 mt-0.5">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.avatarSeed}&backgroundColor=e0e7ff&textColor=3730a3`}
                          alt={contact.name}
                          className="w-9 h-9 rounded-xl object-cover border border-white shadow-sm"
                        />
                        {contact.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {contact.name}
                          </h4>
                          {isAllowed ? (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                              isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {contact.role}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-0.5">
                              <LockIcon style={{ fontSize: 9 }} />
                              Restricted
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-gray-500'}`}>
                          {contact.departmentOrInfo}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer: User RBAC Badge */}
              <div className="p-2.5 bg-slate-100 border-t border-slate-200 text-[10px] text-gray-600 flex items-center justify-between shrink-0">
                <span>Access Policy:</span>
                <span className="font-bold text-indigo-700 uppercase flex items-center gap-1">
                  <ShieldIcon style={{ fontSize: 13 }} />
                  {activeRole.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Right Column: Chat Stream or Restriction Notice */}
            <div className={`flex-1 flex flex-col bg-slate-50 min-h-0 min-w-0 ${
              mobileScreen === 'contacts' ? 'hidden sm:flex' : 'flex'
            }`}>
              {activeContact ? (
                <>
                  {/* Active Header */}
                  <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeContact.avatarSeed}&backgroundColor=e0e7ff&textColor=3730a3`}
                          alt={activeContact.name}
                          className="w-10 h-10 rounded-2xl object-cover border border-slate-200"
                        />
                        {activeContact.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{activeContact.name}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100 shrink-0">
                            {activeContact.roleLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">{activeContact.departmentOrInfo}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCurrentContactRestricted ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold flex items-center gap-1">
                          <LockIcon style={{ fontSize: 13 }} />
                          Restricted Channel
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold flex items-center gap-1">
                          <CircleIcon style={{ fontSize: 8 }} /> Live Channel
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RESTRICTED CHANNEL BANNER & EXPLANATION */}
                  {isCurrentContactRestricted ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-amber-50/30 overflow-y-auto">
                      <div className="w-14 h-14 rounded-3xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mb-3 shadow-sm">
                        <LockIcon style={{ fontSize: 28 }} />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                        Communication Access Restricted
                      </h3>
                      <p className="text-xs text-gray-600 max-w-md leading-relaxed mb-4">
                        School ERP policy restricts direct communication between <strong>{activeRole.replace('_', ' ')}</strong> and <strong>{activeContact.name} ({activeContact.roleLabel})</strong>.
                        This measure ensures campus security, pupil privacy, and procedural compliance.
                      </p>
                      <div className="bg-white p-3.5 rounded-2xl border border-amber-200/80 shadow-sm text-left max-w-md text-xs text-gray-700 space-y-1.5 mb-5">
                        <div className="font-bold text-amber-900 flex items-center gap-1.5">
                          <ShieldIcon style={{ fontSize: 14 }} />
                          How to reach this desk:
                        </div>
                        <p className="text-gray-600 text-[11px]">
                          • Contact the <strong>School Office Administration</strong> for inquiries requiring this department.
                        </p>
                        <p className="text-gray-600 text-[11px]">
                          • If this is an urgent emergency, contact the reception or security helpdesk directly.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const adminDesk = ALL_SYSTEM_CONTACTS.find(c => c.role === 'ADMIN');
                          if (adminDesk) setActiveContact(adminDesk);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
                      >
                        Message Office Administration Instead
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Active Conversation Messages */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                        {currentMessages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                            <ChatIcon style={{ fontSize: 36 }} className="text-gray-300 mb-2" />
                            <p className="text-xs font-semibold text-gray-600">No prior messages with {activeContact.name}</p>
                            <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                              You have verified authorization to converse with this department. Send a message below.
                            </p>
                          </div>
                        ) : (
                          currentMessages.map(msg => (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm text-xs leading-relaxed ${
                                  msg.isMe
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-slate-200 rounded-bl-none'
                                }`}
                              >
                                <p>{msg.text}</p>
                              </div>
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 px-1">
                                <span>{msg.timestamp}</span>
                                {msg.isMe && (
                                  <DoneAllIcon style={{ fontSize: 13 }} className="text-indigo-500" />
                                )}
                              </div>
                            </div>
                          ))
                        )}

                        {/* Typing indicator */}
                        {isTyping && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-2xl w-fit shadow-sm border border-slate-200">
                            <span className="flex gap-1 items-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                            </span>
                            <span className="text-[11px] font-medium">{activeContact.name} is typing...</span>
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>

                      {/* Quick Replies Chips */}
                      <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
                        {(QUICK_RESPONSES[activeRole] || []).map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(chip)}
                            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-gray-600 text-[10px] font-semibold border border-slate-200 transition-colors cursor-pointer shrink-0"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>

                      {/* Composer Input */}
                      <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0">
                        <input
                          type="text"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder={`Message ${activeContact.name} as ${activeRole.toLowerCase().replace('_', ' ')}...`}
                          className="flex-1 px-3.5 py-2 bg-slate-100 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                        <button
                          onClick={() => handleSendMessage()}
                          disabled={!inputText.trim()}
                          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-all cursor-pointer shrink-0"
                        >
                          <SendIcon style={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                  Select a department desk on the left to start communication
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleChatWidget;
