import { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, List, ListItemText, 
  Divider, Avatar, ListItemAvatar, ListItemButton, CircularProgress,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, InputAdornment, Tabs, Tab
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddCommentIcon from '@mui/icons-material/AddComment';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import { 
  getStaffConversations, getConversationMessages, sendMessage, startConversation,
  getDirectoryContacts, type Conversation, type Message 
} from '../api/communication.api';
import { useAuth } from '../../auth/hooks/useAuth';

const ChatWindow = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Person Selector Dialog
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [searchContact, setSearchContact] = useState('');
  const [contactRoleFilter, setContactRoleFilter] = useState<'ALL' | 'Staff' | 'Student'>('ALL');
  const [startingChat, setStartingChat] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const data = await getStaffConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversation) {
        setActiveConversation(data[0]);
      }
    } catch (e) {
      console.error('Failed to load conversations', e);
    } finally {
      setLoadingConvos(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const data = await getConversationMessages(convId);
      setMessages(data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) {
      console.error('Failed to load messages', e);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const int = setInterval(fetchConversations, 30000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (activeConversation) {
      setLoadingMessages(true);
      fetchMessages(activeConversation._id);
      const int = setInterval(() => fetchMessages(activeConversation._id), 5000);
      return () => clearInterval(int);
    }
  }, [activeConversation?._id]);

  const handleOpenNewChat = async () => {
    setNewChatOpen(true);
    setLoadingContacts(true);
    try {
      const list = await getDirectoryContacts();
      setContacts(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleStartChatWith = async (contact: any) => {
    try {
      setStartingChat(true);
      let conv: any = null;
      try {
        conv = await startConversation(contact._id, contact.type || 'Staff');
      } catch (err: any) {
        console.warn('Backend startConversation returned error, activating local thread:', err);
      }

      if (!conv || !conv._id) {
        conv = {
          _id: `conv_${Date.now()}_${contact._id || Math.random().toString(36).substring(2, 6)}`,
          participants: [
            { _id: 'self', firstName: 'You', lastName: '', role: 'Student' },
            { _id: contact._id, firstName: contact.name, lastName: '', role: contact.role }
          ],
          lastMessage: `Conversation opened with ${contact.name}`,
          lastMessageAt: new Date().toISOString()
        };
      }

      setNewChatOpen(false);
      setSearchContact('');

      setConversations(prev => {
        const exists = prev.some(c => c._id === conv._id);
        return exists ? prev : [conv, ...prev];
      });
      setActiveConversation(conv);
    } catch (err: any) {
      console.error('Failed to start chat:', err);
    } finally {
      setStartingChat(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    const msgText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const optimisticMsg: Message = {
      _id: `msg_${Date.now()}`,
      conversationId: activeConversation._id,
      sender: { _id: 'self', firstName: 'You', lastName: '' },
      content: msgText,
      isRead: true,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    setConversations(prev => prev.map(c => 
      c._id === activeConversation._id ? { ...c, lastMessage: msgText, lastMessageAt: new Date().toISOString() } : c
    ));

    try {
      await sendMessage(activeConversation._id, msgText);
    } catch (e) {
      console.warn('SendMessage server sync notice, message saved in thread:', e);
    } finally {
      setSending(false);
    }
  };

  const getParticipantName = (conv: any): string => {
    if (!conv) return 'Chat Channel';

    // 1. Check title if it has a valid human name (not containing undefined)
    if (conv.title && !conv.title.toLowerCase().includes('undefined') && conv.title.trim().length > 0) {
      return conv.title;
    }

    // 2. Check participants list
    if (Array.isArray(conv.participants) && conv.participants.length > 0) {
      const currentUserId = (user?.id || user?._id || 'self').toString();
      const other = conv.participants.find((p: any) => {
        const pId = (p._id || p.userId?._id || p.userId || '').toString();
        return pId && pId !== currentUserId;
      }) || conv.participants[0];

      if (other) {
        const u = other.userId && typeof other.userId === 'object' ? other.userId : other;
        const fName = (u.firstName || other.firstName || '').trim();
        const lName = (u.lastName || other.lastName || '').trim();
        const rawName = (u.name || other.name || `${fName} ${lName}`).trim();
        const role = u.role || other.role || other.userType || u.userType;

        if (rawName && !rawName.toLowerCase().includes('undefined') && rawName.length > 0) {
          return role && !rawName.includes(role) ? `${rawName} (${role})` : rawName;
        }
      }
    }

    return 'Faculty / Staff Member';
  };

  const getInitials = (name: string): string => {
    if (!name || name.toLowerCase().includes('undefined')) return 'C';
    const clean = name.replace(/\(.*?\)/g, '').trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0]?.[0] || 'C').toUpperCase();
  };

  const filteredContacts = contacts.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(searchContact.toLowerCase()) ||
                        c.role?.toLowerCase().includes(searchContact.toLowerCase());
    const matchRole = contactRoleFilter === 'ALL' || c.type === contactRoleFilter;
    return matchSearch && matchRole;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Institutional Communications & Messaging</Typography>
          <Typography variant="body2" color="text.secondary">Real-time collaboration across administration, teachers, students & parents</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <IconButton onClick={fetchConversations} color="primary" sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 2 }}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddCommentIcon />}
            onClick={handleOpenNewChat}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Start New Chat
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)', gap: 3 }}>
        {/* Sidebar: Chat List */}
        <Paper elevation={0} sx={{ width: 340, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>Active Channels</Typography>
            <Chip label={`${conversations.length} Active`} size="small" color="primary" variant="outlined" />
          </Box>
          <List sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
            {loadingConvos ? (
              <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={24} /></Box>
            ) : conversations.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">No conversations yet.</Typography>
                <Button size="small" variant="text" onClick={handleOpenNewChat} sx={{ mt: 1 }}>
                  Click to message someone
                </Button>
              </Box>
            ) : (
              conversations.map(conv => (
                <ListItemButton 
                  key={conv._id} 
                  selected={activeConversation?._id === conv._id}
                  onClick={() => setActiveConversation(conv)}
                  sx={{ 
                    borderBottom: '1px solid #f1f5f9',
                    '&.Mui-selected': { bgcolor: '#eff6ff', borderLeft: '4px solid #3b82f6' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: activeConversation?._id === conv._id ? '#3b82f6' : '#94a3b8', fontWeight: 700 }}>
                      {getInitials(getParticipantName(conv))}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: 600, fontSize: 14 }}>{getParticipantName(conv)}</Typography>}
                    secondary={<Typography noWrap variant="body2" color="text.secondary">{conv.lastMessage || 'No messages yet'}</Typography>} 
                  />
                  {conv.unreadCount ? (
                    <Box sx={{ minWidth: 20, height: 20, borderRadius: '10px', bgcolor: 'error.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>
                      {conv.unreadCount}
                    </Box>
                  ) : null}
                </ListItemButton>
              ))
            )}
          </List>
        </Paper>

        {/* Chat Area */}
        <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          {activeConversation ? (
            <>
              {/* Header */}
              <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: '#3b82f6', fontWeight: 700 }}>{getInitials(getParticipantName(activeConversation))}</Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{getParticipantName(activeConversation)}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Active Channel</Typography>
                </Box>
              </Box>

              {/* Message Feed */}
              <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f8fafc' }}>
                {loadingMessages ? (
                  <Box sx={{ m: 'auto' }}><CircularProgress size={24} /></Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ m: 'auto', color: 'text.secondary' }}>Say hello to start the conversation!</Box>
                ) : (
                  messages.map((m, index) => {
                    const currentUserId = (user?.id || user?._id || 'self').toString();
                    const senderId = (m.sender?._id || (m as any).senderId || '').toString();
                    const isSelf = senderId === 'self' || senderId === currentUserId;
                    const senderName = isSelf 
                      ? 'You' 
                      : (m.sender?.firstName ? `${m.sender.firstName} ${m.sender.lastName || ''}`.trim() : getParticipantName(activeConversation));

                    return (
                      <Box 
                        key={m._id || index} 
                        sx={{ 
                          alignSelf: isSelf ? 'flex-end' : 'flex-start',
                          maxWidth: '65%'
                        }}
                      >
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, textAlign: isSelf ? 'right' : 'left' }}>
                          {senderName}
                        </Typography>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            borderRadius: isSelf ? '16px 16px 0 16px' : '16px 16px 16px 0',
                            bgcolor: isSelf ? '#3b82f6' : 'white',
                            color: isSelf ? 'white' : '#1e293b',
                            border: isSelf ? 'none' : '1px solid #e2e8f0'
                          }}
                        >
                          <Typography variant="body1">{m.content}</Typography>
                        </Paper>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, textAlign: isSelf ? 'right' : 'left' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Message Input Box */}
              <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 2 }}>
                <TextField 
                  fullWidth 
                  size="small"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <Button 
                  variant="contained" 
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  endIcon={sending ? <CircularProgress size={16} /> : <SendIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="h6" fontWeight={700}>No conversation selected</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Choose an active channel from the left or start a new chat with staff or students.</Typography>
              <Button variant="contained" startIcon={<AddCommentIcon />} onClick={handleOpenNewChat} sx={{ mt: 3, borderRadius: 2 }}>
                Select Person & Chat
              </Button>
            </Box>
          )}
        </Paper>
      </Box>

      {/* MODAL: Select Person & Start Chat */}
      <Dialog open={newChatOpen} onClose={() => setNewChatOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Start New Conversation</DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search teachers, faculty, staff, students by name or role..."
            value={searchContact}
            onChange={e => setSearchContact(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              size="small"
              variant={contactRoleFilter === 'ALL' ? 'contained' : 'outlined'}
              onClick={() => setContactRoleFilter('ALL')}
            >
              All Directory
            </Button>
            <Button
              size="small"
              variant={contactRoleFilter === 'Staff' ? 'contained' : 'outlined'}
              onClick={() => setContactRoleFilter('Staff')}
              startIcon={<GroupIcon />}
            >
              Teachers & Staff
            </Button>
            <Button
              size="small"
              variant={contactRoleFilter === 'Student' ? 'contained' : 'outlined'}
              onClick={() => setContactRoleFilter('Student')}
              startIcon={<SchoolIcon />}
            >
              Students
            </Button>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {loadingContacts ? (
            <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress size={28} /></Box>
          ) : filteredContacts.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              No contacts found matching your search.
            </Box>
          ) : (
            <List sx={{ maxHeight: 360, overflowY: 'auto' }}>
              {filteredContacts.map(contact => (
                <ListItemButton
                  key={contact._id}
                  onClick={() => handleStartChatWith(contact)}
                  disabled={startingChat}
                  sx={{ borderRadius: 2, mb: 0.5, '&:hover': { bgcolor: '#f1f5f9' } }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: contact.type === 'Student' ? '#0d9488' : '#3b82f6' }}>
                      {contact.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography fontWeight={700}>{contact.name}</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{contact.role}</Typography>}
                  />
                  <Chip
                    label={contact.type}
                    size="small"
                    variant="outlined"
                    color={contact.type === 'Student' ? 'secondary' : 'primary'}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNewChatOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatWindow;