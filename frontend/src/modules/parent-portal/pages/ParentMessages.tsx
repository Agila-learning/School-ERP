import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, List, ListItem, ListItemAvatar,
  ListItemText, Avatar, TextField, Button, Divider, CircularProgress,
  IconButton, Chip, Badge, Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import BackButton from '../../../shared/components/BackButton';
import api from '../../../core/api/axios';
import { useAuth } from '../../auth/hooks/useAuth';
import { useParentContext } from '../context/ParentContext';

interface TeacherContact {
  id: string;
  name: string;
  subject: string;
  role: string;
  isClassTeacher?: boolean;
  avatar: string;
  status: 'Online' | 'Available' | 'In Class';
  email: string;
  phone: string;
}

interface ChatMessage {
  id: string;
  teacherId: string;
  sender: 'parent' | 'teacher';
  senderName: string;
  text: string;
  timestamp: string;
}

const ASSIGNED_TEACHERS: TeacherContact[] = [
  {
    id: 'tch-kg-01',
    name: 'Mrs. Devaki Raman',
    subject: 'Early Childhood & Pre-Primary',
    role: 'Lead Kindergarten Educator (Butterflies UKG)',
    isClassTeacher: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    status: 'Online',
    email: 'kg.staff@ficschool.edu',
    phone: '+91 94440 12345'
  },
  {
    id: 'tch-01',
    name: 'Mrs. Radhika Iyer',
    subject: 'Mathematics & Algebra',
    role: 'Class Teacher & Senior Math Coordinator',
    isClassTeacher: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    status: 'Online',
    email: 'radhika.iyer@ficschool.edu',
    phone: '+91 94481 67890'
  },
  {
    id: 'tch-02',
    name: 'Dr. Arvind Swaminathan',
    subject: 'Physics & Laboratory',
    role: 'Physics Dept In-Charge',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    status: 'Online',
    email: 'arvind.s@ficschool.edu',
    phone: '+91 98402 11223'
  },
  {
    id: 'tch-03',
    name: 'Dr. Meenakshi Sundaram',
    subject: 'Chemistry & Lab',
    role: 'Chemistry Faculty',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    status: 'Available',
    email: 'meenakshi.s@ficschool.edu',
    phone: '+91 97908 33445'
  },
  {
    id: 'tch-04',
    name: 'Ms. Priya Raghavan',
    subject: 'Computer Science & AI',
    role: 'Computer Lab 3 Lead',
    avatar: 'https://images.unsplash.com/photo-1580894732444-8ecded7900ce?w=120&auto=format&fit=crop&q=80',
    status: 'Available',
    email: 'priya.raghavan@ficschool.edu',
    phone: '+91 98840 55667'
  },
  {
    id: 'tch-05',
    name: 'Mr. David Fernandez',
    subject: 'English Literature',
    role: 'Senior English Coordinator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    status: 'Available',
    email: 'david.f@ficschool.edu',
    phone: '+91 94432 77889'
  },
  {
    id: 'tch-06',
    name: 'Coach Rajesh Varma',
    subject: 'Physical Education & Athletics',
    role: 'Head of Sports & Physical Education',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    status: 'Available',
    email: 'rajesh.varma@ficschool.edu',
    phone: '+91 98410 99001'
  }
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'tch-kg-01': [
    {
      id: 'm-kg-1',
      teacherId: 'tch-kg-01',
      sender: 'teacher',
      senderName: 'Mrs. Devaki Raman',
      text: 'Good afternoon Rajesh ji! Aarav had an amazing day in Butterflies (UKG A). He finished his warm lunch and happily helped sort colored blocks.',
      timestamp: 'Today, 11:30 AM'
    },
    {
      id: 'm-kg-2',
      teacherId: 'tch-kg-01',
      sender: 'parent',
      senderName: 'Rajesh Sharma (Parent)',
      text: 'Thank you Mrs. Devaki! Did he drink sufficient water during outdoor playtime?',
      timestamp: 'Today, 11:45 AM'
    },
    {
      id: 'm-kg-3',
      teacherId: 'tch-kg-01',
      sender: 'teacher',
      senderName: 'Mrs. Devaki Raman',
      text: 'Yes! He finished his full water bottle and took a peaceful 75-minute nap on his cot.',
      timestamp: 'Today, 01:15 PM'
    }
  ],
  'tch-01': [
    {
      id: 'm1',
      teacherId: 'tch-01',
      sender: 'teacher',
      senderName: 'Mrs. Radhika Iyer',
      text: 'Good afternoon, Avi. Advik demonstrated exceptional analytical problem solving during our quadratic roots lecture today.',
      timestamp: 'Today, 11:20 AM'
    },
    {
      id: 'm2',
      teacherId: 'tch-01',
      sender: 'parent',
      senderName: 'Avi (Parent)',
      text: 'Thank you Mrs. Radhika! We reviewed his homework assignments yesterday evening as well.',
      timestamp: 'Today, 11:45 AM'
    },
    {
      id: 'm3',
      teacherId: 'tch-01',
      sender: 'teacher',
      senderName: 'Mrs. Radhika Iyer',
      text: 'Wonderful! Please remind him to submit the worksheet before Friday practicals.',
      timestamp: 'Today, 01:15 PM'
    }
  ],
  'tch-02': [
    {
      id: 'm4',
      teacherId: 'tch-02',
      sender: 'teacher',
      senderName: 'Dr. Arvind Swaminathan',
      text: 'Hello Avi, Advik completed the ray optics refraction experiment very neatly in the physics lab.',
      timestamp: 'Yesterday, 03:30 PM'
    }
  ]
};

export default function ParentMessages() {
  const { user } = useAuth();
  const { selectedChild } = useParentContext();

  const isKgChild = selectedChild?.class?.toLowerCase().includes('kg') || 
                    user?.email?.toLowerCase().includes('kg.parent') ||
                    selectedChild?.firstName?.toLowerCase().includes('aarav');

  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(() => isKgChild ? 'tch-kg-01' : 'tch-01');
  
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('school_erp_kg_parent_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_MESSAGES, ...parsed };
      }
    } catch {}
    return INITIAL_MESSAGES;
  });

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync to localStorage
  const updateMessages = (updater: (prev: Record<string, ChatMessage[]>) => Record<string, ChatMessage[]>) => {
    setAllMessages(prev => {
      const updated = updater(prev);
      try {
        localStorage.setItem('school_erp_kg_parent_chat', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Sync cross-tab when teacher sends message
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'school_erp_kg_parent_chat' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setAllMessages(prev => ({ ...prev, ...parsed }));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const activeTeacher = ASSIGNED_TEACHERS.find(t => t.id === selectedTeacherId) || ASSIGNED_TEACHERS[0];
  const activeChatMessages = allMessages[selectedTeacherId] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedTeacherId, activeChatMessages.length, isTyping]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsgText = inputText.trim();
    setInputText('');

    const newParentMsg: ChatMessage = {
      id: `PMSG-${Date.now()}`,
      teacherId: selectedTeacherId,
      sender: 'parent',
      senderName: user?.firstName ? `${user.firstName} (Parent)` : (isKgChild ? 'Rajesh Sharma (Parent)' : 'Avi (Parent)'),
      text: newMsgText,
      timestamp: 'Just now'
    };

    updateMessages(prev => ({
      ...prev,
      [selectedTeacherId]: [...(prev[selectedTeacherId] || []), newParentMsg]
    }));

    // Trigger realistic real-time teacher response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const kgReplies = [
        `Thank you for checking in, Rajesh ji! Aarav is having a fantastic, happy day with his friends.`,
        `Received! Aarav has been smiling and very enthusiastic in circle time today.`,
        `Thank you for letting me know! We will ensure he drinks his water and has a peaceful rest.`,
        `Noted! Aarav completed his drawing and ate all his healthy snacks today.`
      ];
      const generalReplies = [
        `Thank you for reaching out! I have noted your message regarding ${selectedChild?.firstName || 'Advik'}. I will discuss this in class tomorrow.`,
        `Received! ${selectedChild?.firstName || 'Advik'} has been attentive and diligent in coursework.`,
        `Thank you for checking in! Everything is on schedule for upcoming evaluations.`,
        `Noted! I appreciate your active involvement in ${selectedChild?.firstName || 'Advik'}'s learning journey.`
      ];
      const repliesPool = selectedTeacherId === 'tch-kg-01' ? kgReplies : generalReplies;
      const randomReply = repliesPool[Math.floor(Math.random() * repliesPool.length)];

      const teacherMsg: ChatMessage = {
        id: `TMSG-${Date.now()}`,
        teacherId: selectedTeacherId,
        sender: 'teacher',
        senderName: activeTeacher.name,
        text: randomReply,
        timestamp: 'Just now'
      };

      updateMessages(prev => ({
        ...prev,
        [selectedTeacherId]: [...(prev[selectedTeacherId] || []), teacherMsg]
      }));
    }, 2400);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      <BackButton to="/parent-portal" />

      {/* Header Area */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ChatBubbleOutlinedIcon sx={{ fontSize: 36, color: '#2563eb' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Parent-Teacher Real-Time Chat
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Direct live communication with {selectedChild ? `${selectedChild.firstName}'s` : "your child's"} assigned class teacher and subject mentors.
            </Typography>
          </Box>
        </Box>
        <Chip 
          icon={<SchoolIcon />} 
          label={`Enrolled Student: ${selectedChild?.firstName || 'Advik'} ${selectedChild?.lastName || 'A'} (Class 10-A)`} 
          color="primary" 
          variant="outlined" 
          sx={{ fontWeight: 700, bgcolor: 'white' }} 
        />
      </Box>

      {/* Main Messaging Desk Grid */}
      <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 560 }}>
        
        {/* Left Column: Assigned Teachers List */}
        <Grid item xs={12} md={4} sx={{ height: { xs: 340, md: 'calc(100vh - 230px)' } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: 3, 
              height: '100%', 
              overflow: 'hidden', 
              display: 'flex', 
              flexDirection: 'column',
              bgcolor: 'white'
            }}
          >
            <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>
                Assigned Teachers ({ASSIGNED_TEACHERS.length})
              </Typography>
              <Chip label="Real-time Available" size="small" color="success" sx={{ fontSize: '0.72rem', fontWeight: 700 }} />
            </Box>

            <List sx={{ overflowY: 'auto', flexGrow: 1, p: 1 }}>
              {ASSIGNED_TEACHERS.map(teacher => {
                const isSelected = teacher.id === selectedTeacherId;
                const lastMsg = allMessages[teacher.id]?.[allMessages[teacher.id]?.length - 1];

                return (
                  <ListItem
                    key={teacher.id}
                    component="div"
                    onClick={() => setSelectedTeacherId(teacher.id)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2.5,
                      mb: 0.8,
                      p: 1.5,
                      bgcolor: isSelected ? '#eff6ff' : 'transparent',
                      border: isSelected ? '1.5px solid #bfdbfe' : '1px solid transparent',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: isSelected ? '#eff6ff' : '#f8fafc' }
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                        color={teacher.status === 'Online' ? 'success' : 'default'}
                      >
                        <Avatar 
                          src={teacher.avatar} 
                          sx={{ 
                            width: 46, 
                            height: 46, 
                            border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0' 
                          }}
                        >
                          {teacher.name.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {teacher.name}
                          </Typography>
                          {teacher.isClassTeacher && (
                            <Chip label="Class Teacher" size="small" color="primary" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 0.3 }}>
                          <Typography variant="caption" sx={{ color: '#2563eb', fontWeight: 700, display: 'block' }}>
                            {teacher.subject}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                            {lastMsg ? lastMsg.text : `${teacher.status} • Direct chat enabled`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Right Column: Live Chat Pane */}
        <Grid item xs={12} md={8} sx={{ height: { xs: 520, md: 'calc(100vh - 230px)' } }}>
          <Paper 
            elevation={0} 
            sx={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: 3, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              bgcolor: 'white',
              overflow: 'hidden'
            }}
          >
            {/* Active Teacher Banner */}
            <Box sx={{ p: 2, px: 3, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar src={activeTeacher.avatar} sx={{ width: 44, height: 44 }}>
                  {activeTeacher.name.charAt(0)}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                      {activeTeacher.name}
                    </Typography>
                    <Chip label={activeTeacher.status} color={activeTeacher.status === 'Online' ? 'success' : 'default'} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {activeTeacher.role} • 📧 {activeTeacher.email} • 📞 {activeTeacher.phone}
                  </Typography>
                </Box>
              </Box>
              <Chip label={`Teaching: ${activeTeacher.subject}`} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700 }} />
            </Box>

            {/* Chat Thread Messages Box */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f8fafc' }}>
              {activeChatMessages.map(msg => {
                const isParent = msg.sender === 'parent';
                return (
                  <Box 
                    key={msg.id}
                    sx={{ 
                      alignSelf: isParent ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      display: 'flex',
                      gap: 1.5
                    }}
                  >
                    {!isParent && (
                      <Avatar src={activeTeacher.avatar} sx={{ width: 34, height: 34, mt: 0.5 }}>
                        {activeTeacher.name.charAt(0)}
                      </Avatar>
                    )}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3, justifyContent: isParent ? 'flex-end' : 'flex-start' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: isParent ? '#1d4ed8' : '#334155' }}>
                          {msg.senderName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {msg.timestamp}
                        </Typography>
                      </Box>
                      <Paper 
                        elevation={0}
                        sx={{ 
                          p: 1.8, 
                          px: 2.2, 
                          borderRadius: 3, 
                          borderTopRightRadius: isParent ? 0 : 12,
                          borderTopLeftRadius: !isParent ? 0 : 12,
                          bgcolor: isParent ? '#2563eb' : '#ffffff', 
                          color: isParent ? '#ffffff' : '#0f172a',
                          border: isParent ? 'none' : '1px solid #e2e8f0',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}
                      >
                        <Typography variant="body2" sx={{ lineHeight: 1.5, fontSize: '0.92rem' }}>
                          {msg.text}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <Box sx={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 1, p: 1, px: 2, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Avatar src={activeTeacher.avatar} sx={{ width: 24, height: 24 }} />
                  <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                    {activeTeacher.name} is typing...
                  </Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Divider />

            {/* Input Form Box */}
            <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <TextField 
                fullWidth 
                size="small" 
                placeholder={`Type your message to ${activeTeacher.name}...`}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isTyping}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
              <Button 
                variant="contained" 
                endIcon={<SendIcon />} 
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                sx={{ borderRadius: 2.5, px: 3, textTransform: 'none', fontWeight: 700 }}
              >
                Send
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
