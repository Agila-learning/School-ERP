import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  InputBase, 
  Badge, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem,
  Divider,
  Breadcrumbs,
  Link,
  Button,
  ListItemIcon,
  ListItemText,
  Paper,
  List,
  ListItem,
  Chip,
  alpha 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BadgeIcon from '@mui/icons-material/Badge';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PaymentIcon from '@mui/icons-material/Payment';
import HotelIcon from '@mui/icons-material/Hotel';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import SecurityIcon from '@mui/icons-material/Security';
import ChatIcon from '@mui/icons-material/Chat';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from "../../modules/auth/hooks/useAuth";
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { 
  subscribeToRealtimeNotifications, 
  getStoredNotifications, 
  markAllNotificationsAsRead as markAllRealtimeRead,
  markNotificationAsRead as markRealtimeRead,
  publishNotification
} from '../services/realtimeNotificationBus';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: 0,
  marginLeft: 0,
  width: '100%',
  minWidth: 0,
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: '400px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

interface HeaderProps {
  handleDrawerToggle: () => void;
  drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ handleDrawerToggle, drawerWidth }) => {
  const { user, logout, isParent, isStudent, isTeacher } = useAuth();
  const navigate = useNavigate();
  
  // Temporary fallbacks until branch/academic year context is added to Redux
  const currentBranch = { name: 'Main Campus' };
  const academicYear = { name: '2024-2025' };
  const location = useLocation();
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState<null | HTMLElement>(null);
  const [portalAnchorEl, setPortalAnchorEl] = React.useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  // Search state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchAnchorEl, setSearchAnchorEl] = React.useState<null | HTMLElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const searchItems = [
    { title: 'Fee Payments & Dues', path: '/parent-portal/fees', category: 'Finance', keywords: 'fees payment dues receipt invoice' },
    { title: 'Fee Maintenance & Setup', path: '/finance/maintenance', category: 'Finance', keywords: 'fee structure discount head' },
    { title: 'Student Fee Collection', path: '/office/fees', category: 'Finance', keywords: 'fees collect ledger' },
    { title: 'Invoices & Billing', path: '/finance/invoices', category: 'Finance', keywords: 'invoice bill payment' },
    { title: 'Student Attendance', path: '/attendance/students', category: 'Attendance', keywords: 'attendance daily roll mark' },
    { title: 'Late Entry Register', path: '/attendance/late-comers', category: 'Attendance', keywords: 'late comers entry tardy' },
    { title: 'Attendance Policies', path: '/attendance/policy', category: 'Attendance', keywords: 'policy grace rules' },
    { title: 'Parent Portal Dashboard', path: '/parent-portal', category: 'Portals', keywords: 'parent child portal' },
    { title: 'Parent Library & Borrowed Books', path: '/parent-portal/library', category: 'Library', keywords: 'library book issue return dues fine' },
    { title: 'Parent Meetings & PTM', path: '/parent-portal/meetings', category: 'Communication', keywords: 'meeting appointment teacher parent ptm' },
    { title: 'Parent Homework & Assignments', path: '/parent-portal/homework', category: 'Academics', keywords: 'homework assignment classwork task' },
    { title: 'Parent Messages & Chat', path: '/parent-portal/messages', category: 'Communication', keywords: 'message chat teacher conversation' },
    { title: 'Complaints & Helpdesk', path: '/parent-portal/complaints', category: 'Support', keywords: 'complaint issue ticket helpdesk' },
    { title: 'Student Portal Dashboard', path: '/student-portal/dashboard', category: 'Portals', keywords: 'student dashboard scholar marks assignments' },
    { title: 'Student Library Portal', path: '/student-portal/library', category: 'Library', keywords: 'student library books catalog loan issue' },
    { title: 'Student Transport Tracking', path: '/student-portal/transport', category: 'Transport', keywords: 'student transport bus gps tracking route' },
    { title: 'Live Transport Tracking', path: '/transport/tracking', category: 'Transport', keywords: 'transport bus gps tracking route' },
    { title: 'Transport Command Center', path: '/transport/dashboard', category: 'Transport', keywords: 'fleet transport vehicle driver' },
    { title: 'Timetable Visual Editor', path: '/timetable/editor', category: 'Timetable', keywords: 'timetable schedule class period' },
    { title: 'Timetable Versions', path: '/timetable/versions', category: 'Timetable', keywords: 'timetable draft version' },
    { title: 'Assessments & Quizzes', path: '/academic/assessments', category: 'Academics', keywords: 'assessment quiz exam unit test' },
    { title: 'Practical Lab Manager', path: '/academic/practical', category: 'Academics', keywords: 'practical lab experiment science' },
    { title: 'Staff Leave Approvals', path: '/leave/approvals', category: 'HR', keywords: 'leave approval request time off' },
    { title: 'My Leaves & Applications', path: '/leave/my-leave', category: 'HR', keywords: 'apply leave balance' },
    { title: 'Student Directory', path: '/admin/students', category: 'Students', keywords: 'students admission directory profile' },
    { title: 'Staff Directory', path: '/admin/staff', category: 'Staff', keywords: 'staff employee teacher hr' },
    { title: 'Super Admin Dashboard', path: '/super-admin/dashboard', category: 'SaaS', keywords: 'super admin saas platform tenant' },
    { title: 'Principal Dashboard', path: '/principal/dashboard', category: 'Executive', keywords: 'principal school overview performance' }
  ];

  const filteredSearchResults = searchQuery.trim()
    ? searchItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      setSearchAnchorEl(e.currentTarget);
    } else {
      setSearchAnchorEl(null);
    }
  };

  const handleSelectSearchResult = (path: string) => {
    setSearchQuery('');
    setSearchAnchorEl(null);
    navigate(path);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredSearchResults.length > 0) {
      handleSelectSearchResult(filteredSearchResults[0].path);
    } else if (e.key === 'Escape') {
      setSearchAnchorEl(null);
    }
  };

  // Keyboard shortcut Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePortalMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setPortalAnchorEl(event.currentTarget);
  };

  const handlePortalMenuClose = () => {
    setPortalAnchorEl(null);
  };

  const handleNavigatePortal = (path: string) => {
    setPortalAnchorEl(null);
    navigate(path);
  };

  const fetchUnreadCount = async () => {
    try {
      const stored = getStoredNotifications();
      const localUnread = stored.filter(n => !n.read).length;

      const token = localStorage.getItem('token');
      let serverUnread = 0;
      if (token) {
        const res = await axios.get('/api/v1/communication/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
        if (res?.data?.success) {
          serverUnread = res.data.data.count || 0;
        }
      }
      setUnreadCount(localUnread + serverUnread);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const stored = getStoredNotifications().map(n => ({
        _id: n.id,
        id: n.id,
        title: n.title,
        message: n.message,
        category: n.category,
        severity: n.severity,
        read: n.read,
        status: n.read ? 'READ' : 'UNREAD',
        createdAt: n.timestamp,
        timestamp: n.timestamp,
        link: n.link,
        isBus: true
      }));

      const token = localStorage.getItem('token');
      let serverItems: any[] = [];
      if (token) {
        const res = await axios.get('/api/v1/communication/notifications?limit=15', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
        if (res?.data?.success && Array.isArray(res.data.data.notifications)) {
          serverItems = res.data.data.notifications;
        }
      }

      // Merge and sort newest first
      const combined = [...stored, ...serverItems];
      const seen = new Set();
      const unique = combined.filter(item => {
        const key = item._id || item.id;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setNotifications(unique);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchUnreadCount();
    fetchNotifications();

    // Subscribe to client-side real-time bus (Transport, Library, Watchman, Chat, Hostel)
    const unsubscribeBus = subscribeToRealtimeNotifications((notif) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [
        {
          _id: notif.id,
          id: notif.id,
          title: notif.title,
          message: notif.message,
          category: notif.category,
          severity: notif.severity,
          read: false,
          status: 'UNREAD',
          createdAt: notif.timestamp,
          timestamp: notif.timestamp,
          link: notif.link,
          isBus: true
        },
        ...prev
      ]);
    });
    
    const token = localStorage.getItem('token');
    if (!token) return () => unsubscribeBus();

    // Socket.io real-time connection
    let socketInstance: any = null;
    import('socket.io-client').then(({ io }) => {
      const socketUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5001';
      socketInstance = io(socketUrl, { auth: { token } });

      socketInstance.on('connect', () => {
        console.log('Connected to real-time notification socket');
      });

      socketInstance.on('new_notification', (data: any) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [data, ...prev]);

        // Publish to bus so that Toast pops up with audio chime
        publishNotification({
          title: data.title || data.communicationId?.title || 'New Notification',
          message: data.message || data.communicationId?.content || 'You have received an update.',
          category: (data.category || data.type || 'ADMIN') as any,
          severity: data.priority === 'URGENT' ? 'warning' : 'info',
          link: data.link
        });
      });
    }).catch(err => console.debug('Socket init error:', err));

    return () => {
      unsubscribeBus();
      if (socketInstance) socketInstance.disconnect();
    };
  }, []);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleNotifMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotifAnchorEl(null);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.patch(`/api/v1/communication/notifications/${id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
      }
      markRealtimeRead(id);
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      markAllRealtimeRead();
      const token = localStorage.getItem('token');
      if (token) {
        await axios.patch(`/api/v1/communication/notifications/read-all`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => null);
      }
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true, status: 'READ' })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif: any) => {
    const notifId = notif.id || notif._id;
    if (notif.isBus || String(notifId).startsWith('notif-')) {
      markRealtimeRead(notifId);
    } else {
      handleMarkAsRead(notifId);
    }

    setNotifications(prev => prev.map(n => (n._id === notifId || n.id === notifId) ? { ...n, read: true, status: 'READ' } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));

    handleMenuClose();

    // Determine target redirect path
    let targetLink = notif.link;
    if (!targetLink) {
      const cat = (notif.category || '').toUpperCase();
      const title = (notif.title || notif.communicationId?.title || '').toLowerCase();
      const msg = (notif.message || notif.communicationId?.content || '').toLowerCase();

      if (cat === 'TRANSPORT' || title.includes('bus') || title.includes('fleet') || msg.includes('transport') || msg.includes('route')) {
        targetLink = isParent ? '/parent-portal' : isStudent ? '/student-portal/transport' : '/transport/dashboard';
      } else if (cat === 'LIBRARY' || title.includes('library') || title.includes('book') || msg.includes('circulation')) {
        targetLink = isParent ? '/parent-portal/library' : isStudent ? '/student-portal/library' : '/library/circulation';
      } else if (cat === 'HOSTEL' || title.includes('hostel') || title.includes('mess') || title.includes('room') || title.includes('bed') || title.includes('outpass') || title.includes('warden')) {
        targetLink = '/hostel/dashboard';
      } else if (cat === 'SECURITY' || title.includes('gate') || title.includes('security') || title.includes('watchman')) {
        targetLink = '/security/watchman';
      } else if (cat === 'CHAT') {
        window.dispatchEvent(new CustomEvent('erp:open-role-chat'));
        return;
      } else if (title.includes('fee') || title.includes('payment') || title.includes('due') || msg.includes('invoice')) {
        targetLink = isParent ? '/parent-portal/fees' : '/office/fees';
      } else if (title.includes('leave') || title.includes('absence') || title.includes('approv')) {
        targetLink = '/principal/approvals';
      } else if (title.includes('circular') || title.includes('notice')) {
        targetLink = '/office/circulars';
      } else if (title.includes('exam') || title.includes('marks')) {
        targetLink = '/examination/public-exams';
      } else {
        targetLink = '/principal/notifications';
      }
    }

    if (targetLink) {
      navigate(targetLink);
    }
  };

  // Generate breadcrumbs from path
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        color: 'text.primary',
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        {/* Breadcrumbs */}
        <Box sx={{ display: { xs: 'none', md: 'block' }, flex: 1, minWidth: 0, mr: 2 }}>
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" sx={{ opacity: 0.5 }} />} 
            aria-label="breadcrumb"
            sx={{ 
              '& .MuiBreadcrumbs-ol': { 
                flexWrap: 'nowrap', 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              } 
            }}
          >
            {(() => {
              const homeDashboard = isParent ? '/parent-portal' : isStudent ? '/student-portal/dashboard' : isTeacher ? '/teacher/dashboard' : '/admin/dashboard';
              return (
                <Link component={RouterLink} underline="hover" color="inherit" to={homeDashboard} sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                  ERP
                </Link>
              );
            })()}
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const rawTo = `/${pathnames.slice(0, index + 1).join('/')}`;
              const safeRoutes: Record<string, string> = {
                '/lab': '/lab/dashboard',
                '/hr': '/hr/dashboard',
                '/admin': '/admin/dashboard',
                '/teacher': '/teacher/dashboard',
                '/student': '/student-portal/dashboard',
                '/student-portal': '/student-portal/dashboard',
                '/parent': '/parent-portal',
                '/attendance': '/attendance/teacher',
                '/finance': '/finance/dashboard',
                '/timetable': '/timetable/teacher',
                '/transport': '/transport/dashboard',
                '/library': '/library/portal',
                '/sports': '/sports/dashboard',
                '/office': '/office/dashboard',
                '/hostel': '/hostel/dashboard',
                '/health': '/health/dashboard',
                '/safety': '/safety/dashboard',
                '/events': '/events/dashboard',
                '/inventory': '/inventory/dashboard',
                '/procurement': '/procurement/dashboard',
                '/assets': '/assets/register',
                '/communication': '/communication/announcements',
                '/super-admin': '/super-admin/dashboard',
                '/lms': '/lms/teacher/dashboard',
                '/academic': '/academic/dashboard',
              };
              const to = safeRoutes[rawTo] || rawTo;
              // Capitalize each word and replace hyphens
              const title = value
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return last ? (
                <Typography color="text.primary" key={rawTo} sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {title}
                </Typography>
              ) : (
                <Link component={RouterLink} underline="hover" color="inherit" to={to} key={rawTo} sx={{ fontSize: '0.85rem' }}>
                  {title}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>

        {/* Interactive Global Search */}
        <Box sx={{ position: 'relative', flex: { xs: 1, sm: 'none' }, width: { xs: 'auto', sm: 340, md: 400 }, mr: { xs: 1, sm: 2 }, minWidth: 0 }}>
          <Search sx={{ mr: 0 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              inputRef={searchInputRef}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search features, fees, portal... (Cmd+K)"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>

          {/* Search Results Dropdown */}
          {searchQuery.trim().length > 0 && (
            <Paper
              elevation={4}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                mt: 1,
                borderRadius: 2.5,
                bgcolor: 'background.paper',
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                zIndex: 1400,
                maxHeight: 380,
                overflowY: 'auto'
              }}
            >
              <Box sx={{ p: 1.5, pb: 0.5, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Search Results ({filteredSearchResults.length})
                </Typography>
                <Typography variant="caption" color="text.secondary">Press Enter ↵ to go</Typography>
              </Box>

              {filteredSearchResults.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body2">No matching modules or pages found for "{searchQuery}"</Typography>
                </Box>
              ) : (
                <List dense sx={{ py: 0.5 }}>
                  {filteredSearchResults.map((item, idx) => (
                    <ListItem
                      key={idx}
                      onClick={() => handleSelectSearchResult(item.path)}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 1.5,
                        mx: 0.5,
                        my: 0.25,
                        width: 'auto',
                        '&:hover': { bgcolor: '#f1f5f9' }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {item.title}
                            </Typography>
                            <Chip size="small" label={item.category} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                          </Box>
                        }
                        secondary={<Typography variant="caption" color="text.secondary">{item.path}</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          )}
        </Box>

        {/* Context Selectors */}
        <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 2, mr: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Branch</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentBranch.name}</Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ my: 1.5 }} />
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Academic Year</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{academicYear.name}</Typography>
          </Box>
        </Box>
        

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="large"
            aria-label="open role-based chat"
            color="inherit"
            onClick={() => window.dispatchEvent(new CustomEvent('open_role_chat'))}
            sx={{
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' }
            }}
            title="Open Role-Based ERP Chat"
          >
            <Badge color="primary" variant="dot">
              <ChatIcon />
            </Badge>
          </IconButton>

          <IconButton size="large" aria-label="show new notifications" color="inherit" onClick={handleNotifMenuOpen}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            '& .MuiPaper-root': {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
              mt: 1.5,
              minWidth: 220,
            }
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email}
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {user?.roles?.map((role: any, index: number) => (
                <Badge key={role?._id || index} badgeContent={role?.name || 'Role'} color="primary" sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none' } }} />
              ))}
            </Box>
          </Box>
          <Divider />
          <MenuItem component={RouterLink} to="/admin/profile" onClick={handleMenuClose}>
            <SettingsIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Account Settings
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: 'error.main' }} />
            <Typography color="error.main">Logout</Typography>
          </MenuItem>
        </Menu>
        
        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleMenuClose}
          slotProps={{ paper: { sx: { width: 380, maxHeight: 480, borderRadius: 2.5, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' } } }}
        >
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>Notifications</Typography>
              {unreadCount > 0 && (
                <Chip label={`${unreadCount} new`} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
              )}
            </Box>
            <Link component="button" onClick={handleMarkAllAsRead} underline="hover" variant="caption" sx={{ fontWeight: 600, color: '#4f46e5' }}>
              Mark all as read
            </Link>
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">No notifications right now</Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
              {notifications.map((notif) => {
                const isUnread = notif.status !== 'READ' && !notif.read;
                const displayTitle = notif.title || notif.communicationId?.title || 'System Notification';
                const rawContent = notif.message || notif.communicationId?.content || '';
                const displayContent = rawContent.replace(/<[^>]*>?/gm, '');
                const cat = (notif.category || notif.type || '').toUpperCase();
                
                const getCategoryIcon = () => {
                  if (cat === 'TRANSPORT') return <DirectionsBusIcon fontSize="small" sx={{ color: '#2563eb' }} />;
                  if (cat === 'LIBRARY') return <LocalLibraryIcon fontSize="small" sx={{ color: '#7c3aed' }} />;
                  if (cat === 'HOSTEL') return <HotelIcon fontSize="small" sx={{ color: '#059669' }} />;
                  if (cat === 'SECURITY') return <SecurityIcon fontSize="small" sx={{ color: '#d97706' }} />;
                  if (cat === 'FEES' || cat === 'FINANCE') return <PaymentIcon fontSize="small" sx={{ color: '#d97706' }} />;
                  if (cat === 'CHAT') return <ChatIcon fontSize="small" sx={{ color: '#4f46e5' }} />;
                  return <NotificationsIcon fontSize="small" sx={{ color: '#4f46e5' }} />;
                };

                return (
                  <MenuItem 
                    key={notif._id || notif.id} 
                    sx={{ 
                      py: 1.5, 
                      px: 2,
                      bgcolor: isUnread ? '#f8fafc' : 'inherit',
                      borderLeft: isUnread ? '3px solid #4f46e5' : '3px solid transparent',
                      borderBottom: '1px solid #f1f5f9',
                      '&:hover': { bgcolor: '#f1f5f9' },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <Box sx={{ width: '100%', whiteSpace: 'normal', display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Box sx={{ mt: 0.5, p: 0.75, borderRadius: 1.5, bgcolor: '#f1f5f9', display: 'flex' }}>
                        {getCategoryIcon()}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                          <Typography variant="body2" sx={{ fontWeight: isUnread ? 700 : 500, color: '#0f172a' }}>
                            {displayTitle}
                          </Typography>
                          {isUnread && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4f46e5', display: 'inline-block' }} />
                          )}
                        </Box>
                        {displayContent && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              display: '-webkit-box', 
                              WebkitLineClamp: 2, 
                              WebkitBoxOrient: 'vertical', 
                              overflow: 'hidden',
                              lineHeight: 1.3
                            }}
                          >
                            {displayContent}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.75 }}>
                          <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                            {notif.createdAt || notif.timestamp ? formatDistanceToNow(new Date(notif.createdAt || notif.timestamp), { addSuffix: true }) : 'Just now'}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#4f46e5' }}>
                            View details →
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </MenuItem>
                );
              })}
            </Box>
          )}
          <Divider />
          <Box sx={{ p: 1, textAlign: 'center', bgcolor: '#f8fafc' }}>
            <Button 
              size="small" 
              fullWidth 
              onClick={() => { handleMenuClose(); navigate('/principal/notifications'); }}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', color: '#4f46e5' }}
            >
              Open Complete Notifications Desk
            </Button>
          </Box>
        </Menu>


      </Toolbar>
    </AppBar>
  );
};

export default Header;
