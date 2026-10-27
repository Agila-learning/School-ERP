import React, { useState, useRef, useEffect } from 'react';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Event as EventIcon,
  Phone as PhoneIcon,
  CheckCircle as OkIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { createComplaint } from '../../modules/complaints/api/complaint.api';
import { useAuth } from '../../modules/auth/hooks/useAuth';
import './AIChatbot.css'; // Import the new animation styles

type Message = {
  id: string;
  sender: 'bot' | 'user' | 'system';
  text: string;
  timestamp: Date;
  actions?: Action[];
  options?: string[]; // Quick reply options
};

type Action = {
  label: string;
  type: 'link' | 'action';
  payload?: string;
  icon?: React.ReactNode;
};

const AIChatbot: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { isSuperAdmin, isAdmin, isPrincipal, isTeacher, isParent, isStudent } = useAuth();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMounting, setIsMounting] = useState(false); // For animation states
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRoleChatOpen, setIsRoleChatOpen] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to Role Chat state & open requests
  useEffect(() => {
    const handleRoleChatState = (e: any) => {
      if (e.detail && typeof e.detail.open === 'boolean') {
        setIsRoleChatOpen(e.detail.open);
      }
    };
    const handleOpenAiChat = () => {
      setIsOpen(true);
      setIsMounting(true);
    };

    window.addEventListener('erp:role-chat-state', handleRoleChatState);
    window.addEventListener('erp:open-ai-chat', handleOpenAiChat);
    return () => {
      window.removeEventListener('erp:role-chat-state', handleRoleChatState);
      window.removeEventListener('erp:open-ai-chat', handleOpenAiChat);
    };
  }, []);

  // Broadcast AI chat state to prevent collisions
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('erp:ai-chat-state', { detail: { open: isOpen } }));
  }, [isOpen]);

  // Initialize welcome message based on role
  useEffect(() => {
    if (messages.length === 0) {
      const name = user?.firstName || 'there';
      
      let welcomeText = `Hi ${name}! I'm EduNexus AI. How can I assist you today?`;
      let quickOptions = ['View Timetable', 'Contact Principal'];

      if (isSuperAdmin) {
        welcomeText = `Welcome Platform Super Admin, ${name}! Ready to manage school tenants, 1-day trials, or coordinate with School Admins.`;
        quickOptions = ['Manage Subscriptions', 'Chat with School Admin', 'Platform Support Tickets'];
      } else if (isParent) {
        welcomeText = `Welcome back, ${name}! I'm your Parent Assistant. Do you need help checking your child's progress or contacting staff?`;
        quickOptions = ['Check Child\'s Marks', 'Contact Principal', 'Pay Fees'];
      } else if (isTeacher) {
        welcomeText = `Hello ${name}. Need help managing your classes or entering marks today?`;
        quickOptions = ['Enter Marks', 'Mark Attendance', 'View Schedule'];
      } else if (isAdmin || isPrincipal) {
        welcomeText = `School Admin portal ready. What operations do you want to manage today?`;
        quickOptions = ['View Pending Complaints', 'Check Fleet Status', 'Manage Staff'];
      } else if (isStudent) {
        welcomeText = `Hello ${name}! Need help with your homework, attendance, or querying the school desk?`;
        quickOptions = ['View Homework', 'Check Attendance', 'Query Principal'];
      }

      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: welcomeText,
          timestamp: new Date(),
          options: quickOptions
        }
      ]);
    }
  }, [user, messages.length, isSuperAdmin, isParent, isTeacher, isAdmin, isPrincipal, isStudent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMounting(true);
    } else {
      setIsMounting(false);
      setTimeout(() => setIsOpen(false), 300); // Wait for exit animation
    }
  };

  const simulateBotResponse = (userText: string) => {
    setIsTyping(true);
    const lowerText = userText.toLowerCase();
    
    // Determine response delay based on complexity (simulating AI thought)
    const delay = Math.random() * 800 + 1000;

    setTimeout(() => {
      let botResponse: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        text: "I'm still learning! Could you try asking that in a different way?",
        timestamp: new Date()
      };

      // --- Robust Intent Parsing ---
      
      // 1. Contacting Principal / Scheduling
      if (lowerText.includes('contact principal') || lowerText.includes('meet principal') || lowerText.includes('appointment')) {
        if (isSuperAdmin) {
          botResponse.text = "You can initiate a direct, isolated conversation with the school Principal via Super Admin Chat.";
          botResponse.actions = [
            { label: 'Chat with Principal', type: 'action', icon: <PhoneIcon style={{fontSize: 16}} /> }
          ];
        } else {
          botResponse.text = "I can certainly help you schedule an appointment with the Principal. When would you prefer to meet?";
          botResponse.actions = [
            { label: 'Schedule Appointment', type: 'action', icon: <EventIcon style={{fontSize: 16}} /> },
            { label: 'Call Office Now', type: 'action', icon: <PhoneIcon style={{fontSize: 16}} /> }
          ];
        }
      } 
      // 2. Results, Marks, Rank Cards
      else if (lowerText.includes('rank') || lowerText.includes('mark') || lowerText.includes('result') || lowerText.includes('progress')) {
        if (isTeacher) {
          botResponse.text = "You can enter and publish marks from the Examination Desk.";
          botResponse.actions = [{ label: 'Go to Marks Entry', type: 'link', payload: '/examination/marks-entry' }];
        } else if (isParent) {
          botResponse.text = "I've pulled up the results for your selected child. You can switch children from the dashboard dropdown at any time.";
          botResponse.actions = [{ label: 'View Rank Card', type: 'link', payload: '/parent-portal/marks' }];
        } else {
          botResponse.text = "I've pulled up the latest examination results and rank cards for you.";
          botResponse.actions = [{ label: 'View Rank Card', type: 'link', payload: '/examination/reports' }];
        }
      } 
      // 3. Timetable / Schedules
      else if (lowerText.includes('timetable') || lowerText.includes('schedule') || lowerText.includes('class')) {
        botResponse.text = "Here is the quick link to the daily timetable.";
        botResponse.actions = [{ label: 'Open Timetable', type: 'link', payload: '/timetable/dashboard' }];
      } 
      // 4. Complaints, Support, Grievance & Helpdesk
      else if (lowerText.includes('support') || lowerText.includes('complain') || lowerText.includes('issue') || lowerText.includes('problem') || lowerText.includes('ticket') || lowerText.includes('help')) {
        if (isSuperAdmin) {
          botResponse.text = "As Super Admin, you can review school platform support tickets or coordinate directly with School Admins.";
          botResponse.actions = [
            { label: 'Platform Support Tickets', type: 'link', payload: '/super-admin/support-tickets' },
            { label: 'Chat with School Admin', type: 'action', icon: <PhoneIcon style={{fontSize: 16}} /> }
          ];
        } else if (isParent) {
          botResponse.text = "I'm sorry to hear that. You can raise a formal ticket in the Parent Helpdesk portal.";
          botResponse.actions = [{ label: 'Raise Ticket', type: 'link', payload: '/parent-portal/complaints' }];
        } else if (isStudent) {
          botResponse.text = "If you are facing an issue, you can send an inquiry or query directly to the Principal's Desk.";
          botResponse.actions = [{ label: 'Query to Principal', type: 'link', payload: '/principal/queries' }];
        } else if (isAdmin || isPrincipal || isTeacher) {
          botResponse.text = "I'm sorry to hear that. You can log or track an operational ticket in the Staff Complaints portal.";
          botResponse.actions = [{ label: 'Raise Ticket', type: 'link', payload: '/operations/complaints' }];
        } else {
          botResponse.text = "Please reach out to your school administrator for assistance.";
        }
      }
      // 5. Finance / Fees
      else if (lowerText.includes('fee') || lowerText.includes('pay') || lowerText.includes('invoice')) {
        botResponse.text = "You can view pending fee invoices and make online payments securely through the Finance Dashboard.";
        if (isParent) {
          botResponse.actions = [{ label: 'Pay Fees', type: 'link', payload: '/parent-portal/fees' }];
        } else {
          botResponse.actions = [{ label: 'View Invoices', type: 'link', payload: '/finance/dashboard' }];
        }
      }
      // 6. Homework / Assignments
      else if (lowerText.includes('homework') || lowerText.includes('assignment')) {
        if (isParent) {
          botResponse.text = "You can review and track your child's pending assignments here.";
          botResponse.actions = [{ label: 'View Homework', type: 'link', payload: '/parent-portal/homework' }];
        } else if (isTeacher) {
          botResponse.text = "You can manage and grade assignments in the academic module.";
          botResponse.actions = [{ label: 'Manage Assignments', type: 'link', payload: '/admin/academics/assignments' }];
        } else {
          botResponse.text = "I can take you to the assignment dashboard.";
          botResponse.actions = [{ label: 'View Assignments', type: 'link', payload: '/admin/academics/assignments' }];
        }
      }
      // 7. Attendance
      else if (lowerText.includes('attendance') || lowerText.includes('absent')) {
        if (isParent) {
          botResponse.text = "I can pull up your child's attendance record and leave history.";
          botResponse.actions = [{ label: 'Check Attendance', type: 'link', payload: '/parent-portal/attendance' }];
        } else if (isTeacher) {
          botResponse.text = "It's time to take roll call! I can take you directly to the marking sheet.";
          botResponse.actions = [{ label: 'Mark Attendance', type: 'link', payload: '/attendance/mark' }];
        } else {
          botResponse.text = "I can pull up the attendance dashboard for you.";
          botResponse.actions = [{ label: 'View Attendance', type: 'link', payload: '/attendance/students' }];
        }
      }
      // 8. Transport
      else if (lowerText.includes('bus') || lowerText.includes('transport') || lowerText.includes('track')) {
        botResponse.text = "You can track the school bus live via our transport module.";
        if (isParent) {
          botResponse.actions = [{ label: 'Track Bus', type: 'link', payload: '/transport/parent' }];
        } else {
          botResponse.actions = [{ label: 'Transport Dashboard', type: 'link', payload: '/transport/dashboard' }];
        }
      }
      // 9. Library
      else if (lowerText.includes('book') || lowerText.includes('library')) {
        botResponse.text = "I can take you to the Library Portal where you can browse books and check dues.";
        botResponse.actions = [{ label: 'Go to Library', type: 'link', payload: '/library/portal' }];
      }
      // 10. Leave
      else if (lowerText.includes('leave') || lowerText.includes('sick')) {
        botResponse.text = "You can submit a formal leave application for approval here.";
        botResponse.actions = [{ label: 'Apply for Leave', type: 'link', payload: '/leave/apply' }];
      }
      // 11. Communication / Chat
      else if (lowerText.includes('chat') || lowerText.includes('message') || lowerText.includes('talk')) {
        if (isSuperAdmin) {
          botResponse.text = "As Super Admin, you are exclusively connected to School Admins and Principals to maintain strict confidentiality.";
          botResponse.actions = [{ label: 'Chat with School Admin', type: 'action', icon: <PhoneIcon style={{fontSize: 16}} /> }];
        } else {
          botResponse.text = "Sure! You can securely message teachers and staff in the Communication Hub.";
          botResponse.actions = [{ label: 'Open Communication Hub', type: 'link', payload: '/communication/chat' }];
        }
      }
      // 12. Subscriptions, Trials & Freezing
      else if (lowerText.includes('subscription') || lowerText.includes('trial') || lowerText.includes('freeze') || lowerText.includes('license') || lowerText.includes('plan')) {
        if (isSuperAdmin) {
          botResponse.text = "You can manage subscriptions, grant 1-day free trials, and freeze or reactivate school dashboards in Subscription Management.";
          botResponse.actions = [
            { label: 'Manage Subscriptions', type: 'link', payload: '/super-admin/subscriptions' },
            { label: 'SaaS Plans', type: 'link', payload: '/super-admin/plans' }
          ];
        } else {
          botResponse.text = "School license and subscription management is handled centrally by platform administration.";
        }
      }
      // 13. Generic Affirmation
      else if (lowerText.includes('hello') || lowerText.includes('hi ')) {
        botResponse.text = "Hello again! What's on your mind?";
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, delay);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages(prev => {
      // Remove quick options from the previous message once user replies
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        delete newMessages[newMessages.length - 1].options;
      }
      return [...newMessages, userMessage];
    });
    
    setInput('');
    simulateBotResponse(text);
  };

  const handleAction = async (action: Action) => {
    if (action.label === 'Open Admin & Principal Chat' || action.label === 'Chat with School Admin' || action.label === 'Chat with Principal') {
      toggleChat();
      window.dispatchEvent(new CustomEvent('erp:open-role-chat', { detail: { role: 'SUPER_ADMIN' } }));
      return;
    }

    if (action.type === 'link' && action.payload) {
      navigate(action.payload);
      toggleChat(); // Close chat on navigation
    } else if (action.type === 'action') {
      // Show loading indicator
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'system',
        text: `Processing your request for "${action.label}"...`,
        timestamp: new Date()
      }]);

      try {
        if (action.label === 'Schedule Appointment' || action.label === 'Call Office Now') {
          // Note: In a real app, 'Call Office Now' might trigger WebRTC or VoIP. 
          // Here we log it as a high priority callback ticket.
          await createComplaint({
            subject: action.label,
            description: `User requested "${action.label}" via Chatbot`,
            category: 'OTHER',
            priority: action.label === 'Call Office Now' ? 'HIGH' : 'MEDIUM'
          });
        }
        
        // Update the last system message with success
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            id: Date.now().toString(),
            sender: 'system',
            text: `Success! A ticket for "${action.label}" has been created in the Complaints & Helpdesk module. Office staff will review it shortly.`,
            timestamp: new Date()
          };
          return updated;
        });
      } catch (err) {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            id: Date.now().toString(),
            sender: 'system',
            text: `Failed to process "${action.label}". Please try again or use the main portal.`,
            timestamp: new Date()
          };
          return updated;
        });
      }
    }
  };

  return (
    <>
      {/* Floating Action Button - mutually exclusive with RoleChatWidget to prevent overlaps */}
      {!isOpen && !isRoleChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 w-13 h-13 bg-gradient-to-tr from-indigo-600 to-fuchsia-600 rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center text-white hover:scale-105 transition-all duration-300 z-40 group border border-white/30 cursor-pointer"
          title="EduNexus AI Assistant"
        >
          <BotIcon style={{ fontSize: 26 }} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-fuchsia-500 border-2 border-white"></span>
          </span>
        </button>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[650px] max-h-[calc(100vh-4rem)] z-[1150] flex flex-col overflow-hidden glass-panel rounded-3xl ${isMounting ? 'chat-window-enter' : 'chat-window-exit'}`}
        >
          {/* Header */}
          <div className="bg-white/40 border-b border-white/50 p-4 flex justify-between items-center backdrop-blur-xl relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <BotIcon style={{ fontSize: 22 }} />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight">EduNexus AI</h3>
                <p className="text-[11px] text-gray-500 font-medium">Always online to help you</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 relative">
              <button
                onClick={() => {
                  toggleChat();
                  window.dispatchEvent(new CustomEvent('erp:open-role-chat', {
                    detail: { role: isSuperAdmin ? 'SUPER_ADMIN' : undefined }
                  }));
                }}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[11px] font-bold text-indigo-700 flex items-center gap-1 transition-colors border border-indigo-200 cursor-pointer"
                title={isSuperAdmin ? "Direct chat with School Admin & Principal" : "Switch to Role Chat"}
              >
                <span>{isSuperAdmin ? 'Admin & Principal Chat' : (isParent || isStudent ? 'School Chat' : 'Staff Chat')}</span>
              </button>

              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-500 transition-colors cursor-pointer"
              >
                <MoreIcon style={{ fontSize: 20 }} />
              </button>
              
              {isMenuOpen && (
                <div className="absolute right-8 top-8 w-36 bg-white border border-gray-100 shadow-xl rounded-xl py-1 z-50">
                  <button 
                    onClick={() => { setMessages([]); setIsMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
                  >
                    Clear Chat
                  </button>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Settings
                  </button>
                </div>
              )}

              <button 
                onClick={toggleChat}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-gray-500 transition-colors cursor-pointer"
              >
                <CloseIcon style={{ fontSize: 20 }} />
              </button>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 scroll-smooth" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(248,250,252,0.8) 100%)' }}>
            
            {/* Timestamp */}
            <div className="text-center">
              <span className="text-[10px] font-bold text-gray-400 bg-black/5 px-3 py-1 rounded-full uppercase tracking-widest">Today</span>
            </div>

            {messages.map((msg, index) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} message-enter`} style={{ animationDelay: `${index * 0.05}s` }}>
                
                {msg.sender === 'system' ? (
                  <div className="w-full flex justify-center my-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl shadow-sm">
                      <OkIcon style={{ fontSize: 14 }} /> {msg.text}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {msg.sender === 'bot' && (
                        <div className="w-6 h-6 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center shadow-md mb-1">
                          <BotIcon style={{ fontSize: 14 }} />
                        </div>
                      )}
                      
                      <div className={`p-3.5 text-sm shadow-sm relative ${
                        msg.sender === 'user' 
                          ? 'bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white rounded-2xl rounded-br-sm' 
                          : 'bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                    
                    {/* Interactive Actions */}
                    {msg.actions && (
                      <div className="ml-8 mt-2 flex flex-col gap-2 w-[70%]">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleAction(act)}
                            className="flex items-center justify-between bg-white border border-indigo-100 text-indigo-700 p-2.5 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm group"
                          >
                            <span className="flex items-center gap-2 text-xs font-bold">
                              {act.icon} {act.label}
                            </span>
                            <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                              <SendIcon style={{ fontSize: 10, transform: 'rotate(-45deg)' }} />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick Options Bubbles */}
                    {msg.options && (
                      <div className="ml-8 mt-3 flex flex-wrap gap-2">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(opt)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    <span className={`text-[9px] font-bold text-gray-400 mt-1 ${msg.sender === 'user' ? 'mr-2' : 'ml-10'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-end gap-2 message-enter">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center shadow-md mb-1">
                  <BotIcon style={{ fontSize: 14 }} />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex gap-1.5 h-[42px] items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-300 rounded-full typing-dot"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full typing-dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 relative z-10">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }} 
              className="relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask EduNexus AI..."
                className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm font-medium shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className={`absolute right-2 w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                  input.trim() && !isTyping
                    ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <SendIcon style={{ fontSize: 16 }} className={input.trim() ? "translate-x-0.5" : ""} />
              </button>
            </form>
            <div className="mt-2.5 text-center text-[9px] font-bold text-gray-400 flex items-center justify-center gap-1 uppercase tracking-wider">
              Powered by EduNexus AI Engine
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
