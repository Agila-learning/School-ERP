import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, List, ListItem, ListItemAvatar,
  ListItemText, Avatar, TextField, Button, Divider, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, InputAdornment, Tab, Tabs
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import AddCommentIcon from '@mui/icons-material/AddComment';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import api from '../../../../core/api/axios';
import { useAuth } from '../../../auth/hooks/useAuth';

interface Conversation {
  _id: string;
  participants: Array<{
    userId: {
      _id: string;
      firstName: string;
      lastName: string;
      role: string;
      photoUrl?: string;
    };
  }>;
  lastMessageAt: string;
  lastMessage?: string;
}

interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    _id: 'conv-demo-01',
    participants: [
      { userId: { _id: 'u-self', firstName: 'Teacher', lastName: 'Faculty', role: 'Teacher' } },
      { userId: { _id: 'u-parent-01', firstName: 'Avi', lastName: 'Sharma (Parent)', role: 'Parent', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80' } }
    ],
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    lastMessage: 'Thank you for the update on Advik\'s mathematics progress.'
  },
  {
    _id: 'conv-demo-02',
    participants: [
      { userId: { _id: 'u-self', firstName: 'Teacher', lastName: 'Faculty', role: 'Teacher' } },
      { userId: { _id: 'u-student-01', firstName: 'Advik', lastName: 'A (Student)', role: 'Student', photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80' } }
    ],
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    lastMessage: 'Good afternoon, teacher. I submitted the physics refractive index worksheet.'
  },
  {
    _id: 'conv-demo-03',
    participants: [
      { userId: { _id: 'u-self', firstName: 'Teacher', lastName: 'Faculty', role: 'Teacher' } },
      { userId: { _id: 'u-student-02', firstName: 'Arjun', lastName: 'Patel (Student)', role: 'Student', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' } }
    ],
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    lastMessage: 'Can you please explain problem 4 from today\'s quadratic roots exercise?'
  }
];

const DEFAULT_MESSAGES_MAP: Record<string, Message[]> = {
  'conv-demo-01': [
    {
      _id: 'm1',
      content: 'Hello Mr. Sharma, Advik is performing exceptionally well in advanced mathematics practicals.',
      senderId: { _id: 'u-self', firstName: 'Teacher', lastName: 'Faculty' },
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: 'm2',
      content: 'Thank you for the update on Advik\'s mathematics progress. We will ensure he completes the weekend assignment.',
      senderId: { _id: 'u-parent-01', firstName: 'Avi', lastName: 'Sharma (Parent)' },
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  'conv-demo-02': [
    {
      _id: 'm3',
      content: 'Good afternoon, teacher. I submitted the physics refractive index worksheet.',
      senderId: { _id: 'u-student-01', firstName: 'Advik', lastName: 'A (Student)' },
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      _id: 'm4',
      content: 'Well done, Advik! Your ray diagrams are clear and accurate.',
      senderId: { _id: 'u-self', firstName: 'Teacher', lastName: 'Faculty' },
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  'conv-demo-03': [
    {
      _id: 'm5',
      content: 'Can you please explain problem 4 from today\'s quadratic roots exercise?',
      senderId: { _id: 'u-student-02', firstName: 'Arjun', lastName: 'Patel (Student)' },
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]
};

const CONTACT_DIRECTORY = [
  { _id: 'c-01', name: 'Advik A', role: 'Student (Class 10-A)', type: 'STUDENT', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80' },
  { _id: 'c-02', name: 'Arjun Patel', role: 'Student (Class 10-A)', type: 'STUDENT', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
  { _id: 'c-03', name: 'Avanthika A', role: 'Student (Class 10-A)', type: 'STUDENT', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
  { _id: 'c-04', name: 'Avi Sharma', role: 'Parent (Advik A)', type: 'PARENT', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80' },
  { _id: 'c-05', name: 'Rajesh Patel', role: 'Parent (Arjun Patel)', type: 'PARENT', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
  { _id: 'c-06', name: 'Dr. Arvind Swaminathan', role: 'Faculty (Physics Dept)', type: 'STAFF', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80' },
  { _id: 'c-07', name: 'Dr. Meenakshi Sundaram', role: 'Faculty (Chemistry)', type: 'STAFF', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' },
];

export default function TeacherMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(DEFAULT_CONVERSATIONS);
  const [selectedConvoId, setSelectedConvoId] = useState<string | null>('conv-demo-01');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // New Chat Dialog State
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [searchContact, setSearchContact] = useState('');
  const [contactTypeFilter, setContactTypeFilter] = useState<'ALL' | 'STUDENT' | 'PARENT' | 'STAFF'>('ALL');

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConvoId) {
      fetchMessages(selectedConvoId);
    }
  }, [selectedConvoId]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/communication/staff/conversations');
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setConversations(res.data.data);
        if (!selectedConvoId) setSelectedConvoId(res.data.data[0]._id);
      } else {
        setConversations(DEFAULT_CONVERSATIONS);
        if (!selectedConvoId) setSelectedConvoId(DEFAULT_CONVERSATIONS[0]._id);
      }
    } catch (err) {
      console.warn('Loading fallback conversations:', err);
      setConversations(DEFAULT_CONVERSATIONS);
      if (!selectedConvoId) setSelectedConvoId(DEFAULT_CONVERSATIONS[0]._id);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convoId: string) => {
    if (DEFAULT_MESSAGES_MAP[convoId]) {
      setMessages(DEFAULT_MESSAGES_MAP[convoId]);
      return;
    }
    try {
      const res = await api.get(`/communication/staff/conversations/${convoId}/messages`);
      if (res.data?.data && Array.isArray(res.data.data)) {
        setMessages(res.data.data);
      } else {
        setMessages(DEFAULT_MESSAGES_MAP[convoId] || []);
      }
    } catch (err) {
      setMessages(DEFAULT_MESSAGES_MAP[convoId] || []);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvoId) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const optimisticMsg: Message = {
      _id: `msg-opt-${Date.now()}`,
      content,
      senderId: {
        _id: user?._id || 'u-self',
        firstName: user?.firstName || 'Teacher',
        lastName: user?.lastName || 'Faculty'
      },
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    if (DEFAULT_MESSAGES_MAP[selectedConvoId]) {
      DEFAULT_MESSAGES_MAP[selectedConvoId].push(optimisticMsg);
    }

    try {
      await api.post(`/communication/staff/conversations/${selectedConvoId}/messages`, { content });
    } catch (err) {
      console.warn('Offline/Demo message cached');
    } finally {
      setSending(false);
    }
  };

  const handleStartChatWith = (contact: typeof CONTACT_DIRECTORY[0]) => {
    // Check if conversation already exists
    const existing = conversations.find(c => 
      c.participants.some(p => p.userId?.firstName?.includes(contact.name.split(' ')[0]))
    );

    if (existing) {
      setSelectedConvoId(existing._id);
      setNewChatOpen(false);
      return;
    }

    // Create new conversation entry
    const newConvoId = `conv-${Date.now()}`;
    const newConvo: Conversation = {
      _id: newConvoId,
      participants: [
        { userId: { _id: user?._id || 'u-self', firstName: user?.firstName || 'Teacher', lastName: user?.lastName || 'Faculty', role: 'Teacher' } },
        { userId: { _id: contact._id, firstName: contact.name, lastName: '', role: contact.type, photoUrl: contact.avatar } }
      ],
      lastMessageAt: new Date().toISOString(),
      lastMessage: 'Conversation started'
    };

    DEFAULT_MESSAGES_MAP[newConvoId] = [
      {
        _id: `m-init-${Date.now()}`,
        content: `Conversation initiated with ${contact.name} (${contact.role}).`,
        senderId: { _id: 'system', firstName: 'System', lastName: 'Notification' },
        createdAt: new Date().toISOString()
      }
    ];

    setConversations(prev => [newConvo, ...prev]);
    setSelectedConvoId(newConvoId);
    setNewChatOpen(false);
  };

  const getOtherParticipant = (convo: Conversation) => {
    return convo.participants.find(p => p.userId?._id !== user?._id)?.userId || convo.participants[0]?.userId;
  };

  const filteredContacts = CONTACT_DIRECTORY.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchContact.toLowerCase()) ||
                          c.role.toLowerCase().includes(searchContact.toLowerCase());
    const matchesType = contactTypeFilter === 'ALL' || c.type === contactTypeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ChatBubbleOutlinedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Institutional Messages & Chat</Typography>
            <Typography variant="body2" color="text.secondary">Direct communication with parents, students & academic colleagues</Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCommentIcon />}
          onClick={() => setNewChatOpen(true)}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
          New Message
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1, height: '100%', minHeight: 0 }}>
        {/* Conversations List */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', minHeight: 0 }}>
          <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Active Conversations</Typography>
              <Chip label={`${conversations.length} Active`} size="small" color="primary" variant="outlined" />
            </Box>
            <List sx={{ overflowY: 'auto', flexGrow: 1, p: 0 }}>
              {conversations.map(convo => {
                const other = getOtherParticipant(convo);
                const isSelected = selectedConvoId === convo._id;
                return (
                  <React.Fragment key={convo._id}>
                    <ListItem 
                      component="div"
                      onClick={() => setSelectedConvoId(convo._id)}
                      sx={{ 
                        cursor: 'pointer',
                        bgcolor: isSelected ? '#eff6ff' : 'transparent',
                        borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                        '&:hover': { bgcolor: '#f1f5f9' },
                        py: 1.5
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={other?.photoUrl} sx={{ bgcolor: isSelected ? '#3b82f6' : '#94a3b8' }}>
                          {other?.firstName?.[0] || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography sx={{ fontWeight: 700, fontSize: 14 }}>{other?.firstName} {other?.lastName}</Typography>}
                        secondary={
                          <Typography noWrap variant="body2" color="text.secondary">
                            {convo.lastMessage || 'Active chat'}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Messages Area */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%', minHeight: 0 }}>
          <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'white' }}>
            {selectedConvoId ? (
              <>
                <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {(() => {
                    const convo = conversations.find(c => c._id === selectedConvoId);
                    const other = convo ? getOtherParticipant(convo) : null;
                    return (
                      <>
                        <Avatar src={other?.photoUrl} sx={{ width: 40, height: 40, bgcolor: '#3b82f6' }}>
                          {other?.firstName?.[0] || 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            {other ? `${other.firstName} ${other.lastName}` : 'Direct Conversation'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {other?.role ? `${other.role} • Active Channel` : 'Verified Institutional Channel'}
                          </Typography>
                        </Box>
                      </>
                    );
                  })()}
                </Box>
                
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f8fafc' }}>
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId?._id === (user?._id || 'u-self') || msg.senderId?.firstName === 'Teacher';
                    return (
                      <Box key={msg._id || idx} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <Box sx={{ 
                          maxWidth: '70%', 
                          p: 2, 
                          borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px', 
                          bgcolor: isMe ? '#3b82f6' : '#ffffff',
                          color: isMe ? '#ffffff' : 'text.primary',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                          border: isMe ? 'none' : '1px solid #e2e8f0'
                        }}>
                          <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 700, opacity: isMe ? 0.9 : 0.7 }}>
                            {msg.senderId?.firstName} {msg.senderId?.lastName}
                          </Typography>
                          <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.content}</Typography>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.75, textAlign: 'right' }}>
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1.5, bgcolor: 'white' }}>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Type your message..." 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    sx={{ borderRadius: 2, px: 3, textTransform: 'none', fontWeight: 700 }}
                  >
                    Send
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Select a conversation or click 'New Message' to start chatting</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Select Contact Dialog */}
      <Dialog open={newChatOpen} onClose={() => setNewChatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Select Contact to Message</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            size="small"
            placeholder="Search students, parents, or staff..."
            value={searchContact}
            onChange={e => setSearchContact(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
            }}
            sx={{ mb: 2 }}
          />

          <Tabs
            value={contactTypeFilter}
            onChange={(_, val) => setContactTypeFilter(val)}
            sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 700 } }}
          >
            <Tab label="All Contacts" value="ALL" />
            <Tab label="Students" value="STUDENT" icon={<SchoolIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Parents" value="PARENT" icon={<FamilyRestroomIcon fontSize="small" />} iconPosition="start" />
            <Tab label="Staff & Faculty" value="STAFF" icon={<PersonIcon fontSize="small" />} iconPosition="start" />
          </Tabs>

          <List sx={{ maxHeight: 340, overflowY: 'auto' }}>
            {filteredContacts.map(contact => (
              <ListItem
                key={contact._id}
                component="div"
                onClick={() => handleStartChatWith(contact)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  mb: 1,
                  border: '1px solid #e2e8f0',
                  '&:hover': { bgcolor: '#eff6ff', borderColor: '#3b82f6' }
                }}
              >
                <ListItemAvatar>
                  <Avatar src={contact.avatar}>{contact.name[0]}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Typography sx={{ fontWeight: 700 }}>{contact.name}</Typography>}
                  secondary={contact.role}
                />
                <Chip
                  label={contact.type}
                  size="small"
                  color={contact.type === 'STUDENT' ? 'primary' : contact.type === 'PARENT' ? 'secondary' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </ListItem>
            ))}
            {filteredContacts.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                No matching contacts found.
              </Box>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChatOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
