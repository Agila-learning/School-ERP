import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  Toolbar, Divider, Box, Typography, Collapse
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkIcon from '@mui/icons-material/Work';
import FlagIcon from '@mui/icons-material/Flag';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StoreIcon from '@mui/icons-material/Store';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import ComputerIcon from '@mui/icons-material/Computer';
import EngineeringIcon from '@mui/icons-material/Engineering';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HotelIcon from '@mui/icons-material/Hotel';
import SettingsIcon from '@mui/icons-material/Settings';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SyncIcon from '@mui/icons-material/Sync';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MessageIcon from '@mui/icons-material/Message';
import CampaignIcon from '@mui/icons-material/Campaign';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScienceIcon from '@mui/icons-material/Science';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import FolderIcon from '@mui/icons-material/Folder';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PolicyIcon from '@mui/icons-material/Policy';
import SecurityIcon from '@mui/icons-material/Security';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockIcon from '@mui/icons-material/Lock';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SendIcon from '@mui/icons-material/Send';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth } from '../../modules/auth/hooks/useAuth';

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  drawerWidth: number;
}

interface MenuItemProps {
  title: string;
  path?: string;
  icon: React.ReactNode;
  permissions?: string[];
  children?: MenuItemProps[];
}

const parentMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/parent-portal', icon: <DashboardIcon /> },
  { title: 'Messages', path: '/parent-portal/messages', icon: <ChatBubbleOutlinedIcon /> },
  { title: 'Attendance', path: '/parent-portal/attendance', icon: <EventAvailableIcon /> },
  { title: 'Homework', path: '/parent-portal/homework', icon: <AssignmentIcon /> },
  { title: 'Fees', path: '/parent-portal/fees', icon: <PaymentIcon /> },
  { title: 'Meetings', path: '/parent-portal/meetings', icon: <EventNoteIcon /> },
  { title: 'Transport Tracking', path: '/parent-portal/transport', icon: <DirectionsBusIcon /> },
  { title: 'Notice Board', path: '/parent-portal/notices', icon: <CampaignIcon /> },
  { title: 'Results & Report Cards', path: '/parent-portal/results', icon: <HistoryEduIcon /> },
  { title: 'Timetable', path: '/parent-portal/timetable', icon: <CalendarMonthIcon /> },
  { title: 'Complaints', path: '/parent-portal/complaints', icon: <ReportProblemIcon /> },
  { title: 'Library', path: '/parent-portal/library', icon: <LocalLibraryIcon /> },
  { title: 'Settings', path: '/parent-portal/settings', icon: <SettingsIcon /> },
];

const studentMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/student-portal/dashboard', icon: <DashboardIcon /> },
  { title: 'Learning Management', path: '/lms/student/dashboard', icon: <AssignmentIcon /> },
  { title: 'Timetable', path: '/student-portal/timetable', icon: <CalendarMonthIcon /> },
  { title: 'Attendance', path: '/student-portal/attendance', icon: <EventAvailableIcon /> },
  { title: 'Marks & Results', path: '/student-portal/marks', icon: <HistoryEduIcon /> },
  { title: 'Library', path: '/student-portal/library', icon: <LocalLibraryIcon /> },
  { title: 'Transport', path: '/student-portal/transport', icon: <DirectionsBusIcon /> },
  { title: 'Fees', path: '/student-portal/fees', icon: <PaymentIcon /> },
  { title: 'Public Exam Hall Ticket', path: '/student-portal/public-exams', icon: <SchoolIcon /> },
  { title: 'No Due Clearance', path: '/student-portal/no-due', icon: <CheckCircleIcon /> },
  { title: 'Messages', path: '/student-portal/messages', icon: <MessageIcon /> },
  { title: 'Settings', path: '/student-portal/settings', icon: <SettingsIcon /> },
];

const teacherMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/teacher/dashboard', icon: <DashboardIcon /> },
  { title: 'Messages', path: '/academic/messages', icon: <ChatBubbleOutlinedIcon /> },
  { title: 'Take Attendance', path: '/attendance/teacher', icon: <EventAvailableIcon /> },
  { title: 'Learning Management', path: '/lms/teacher/dashboard', icon: <AssignmentIcon /> },
  { title: 'Marks & Assessment', path: '/examination/marks-entry', icon: <AssessmentIcon /> },
  { title: 'My Timetable', path: '/timetable/teacher', icon: <CalendarMonthIcon /> },
  { title: 'Period Exchange Desk', path: '/timetable/exchange', icon: <SyncAltIcon /> },
  { title: 'Substitution', path: '/timetable/substitution', icon: <SyncAltIcon /> },
  { title: 'Referral Rewards Hub', path: '/career/referrals', icon: <CardGiftcardIcon /> },
  { title: 'Lab Practical Attendance', path: '/lab/attendance', icon: <ScienceIcon /> },
  { title: 'Post Observations', path: '/lab/observations', icon: <DescriptionIcon /> },
  { title: 'My Leaves', path: '/leave/my-leave', icon: <EventNoteIcon /> },
];

const teacherOtherMenuItems: MenuItemProps[] = [
  { title: '── Other ──', path: '', icon: <SettingsIcon /> },
  { title: 'Notifications', path: '/teacher/notifications', icon: <NotificationsIcon /> },
  { title: 'Communication', path: '/communication/teacher', icon: <MessageIcon /> },
  { title: 'Library', path: '/library/portal', icon: <LocalLibraryIcon /> },
  { title: 'My Documents', path: '/hr/self-service/documents', icon: <DescriptionIcon /> },
  { title: 'Resignation / Exit Desk', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
  { title: 'Settings', path: '/teacher/settings', icon: <SettingsIcon /> },
];

const officeMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/office/dashboard', icon: <DashboardIcon /> },
  { title: 'Bonafide Certificates', path: '/office/bonafide', icon: <WorkspacePremiumIcon /> },
  { title: 'Admissions', path: '/office/admissions', icon: <PersonAddIcon /> },
  { title: 'Students', path: '/office/students', icon: <PeopleIcon /> },
  { title: 'Student Documents Vault', path: '/office/documents', icon: <FolderSharedIcon /> },
  { title: 'Office Circulars', path: '/office/circulars', icon: <CampaignIcon /> },
  { title: 'No Due Clearance', path: '/office/no-due', icon: <CheckCircleIcon /> },
  { title: 'Enquiries', path: '/office/enquiries', icon: <ContactMailIcon /> },
  { title: 'Visitors', path: '/office/visitors', icon: <BadgeIcon /> },
  { title: 'Appointments', path: '/office/appointments', icon: <EventAvailableIcon /> },
  { title: 'Fee Collection', path: '/office/fees', icon: <PaymentIcon /> },
  { title: 'My Resignation', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
];

const principalMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/principal/dashboard', icon: <DashboardIcon /> },
  { title: 'School Overview', path: '/admin/dashboard', icon: <SchoolIcon /> },
  { title: 'Students', path: '/admin/students', icon: <PeopleIcon /> },
  { title: 'Staff', path: '/admin/staff', icon: <BadgeIcon /> },
  { title: 'Attendance Overview', path: '/attendance/students', icon: <EventAvailableIcon /> },
  { title: 'Academic Performance', path: '/examination/reports', icon: <AssessmentIcon /> },
  { title: 'Timetable', path: '/timetable/dashboard', icon: <CalendarMonthIcon /> },
  { title: 'Leave Approvals', path: '/leave/approvals', icon: <AssignmentTurnedInIcon /> },
  { title: 'Approval Center', path: '/principal/approvals', icon: <CheckCircleIcon /> },
  { title: 'Exit & Resignation Approvals', path: '/hr/offboarding', icon: <AssignmentTurnedInIcon /> },
  { title: 'Learning Overview', path: '/principal/learning', icon: <MenuBookIcon /> },
  { title: 'Transport', path: '/transport/dashboard', icon: <DirectionsBusIcon /> },
  { title: 'Activities', path: '/events/dashboard', icon: <EventAvailableIcon /> },
  { title: 'Announcements', path: '/communication/announcements', icon: <CampaignIcon /> },
  { title: 'Notifications', path: '/principal/notifications', icon: <NotificationsIcon /> },
  { title: 'Calendar', path: '/events/calendar', icon: <CalendarMonthIcon /> },
  { title: 'My Resignation', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
  { title: 'Settings', path: '/admin/settings', icon: <SettingsIcon /> },
];

const coordinatorMenuItems: MenuItemProps[] = [
  { title: '── Coordinator ──', path: '/teacher/coordinator', icon: <GroupIcon /> },
  { title: 'Class Timetable', path: '/timetable/class', icon: <CalendarMonthIcon /> },
  { title: 'Take Attendance', path: '/attendance/mark', icon: <EventAvailableIcon /> },
  { title: 'My Class Students', path: '/teacher/coordinator/students', icon: <PeopleIcon /> },
  { title: 'Class Performance', path: '/teacher/coordinator/performance', icon: <AssessmentIcon /> },
  { title: 'Class Diary', path: '/teacher/coordinator/diary', icon: <MenuBookIcon /> },
  { title: 'Class Announcements', path: '/teacher/coordinator/announcements', icon: <CampaignIcon /> },
  { title: 'My Resignation', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
];

const driverMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/driver/dashboard', icon: <DashboardIcon /> },
  { title: 'My Vehicle', path: '/driver/vehicle', icon: <DirectionsBusIcon /> },
  { title: 'Today\'s Route', path: '/driver/route', icon: <DirectionsCarIcon /> },
  { title: 'Trip Status', path: '/driver/trip', icon: <LocalShippingIcon /> },
  { title: 'Notifications', path: '/driver/notifications', icon: <CampaignIcon /> },
  { title: 'My Resignation', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
];

const transportManagerMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/transport/dashboard', icon: <DashboardIcon /> },
  { title: 'Vehicles', path: '/transport/vehicles', icon: <DirectionsBusIcon /> },
  { title: 'Routes & Stops', path: '/transport/routes', icon: <DirectionsCarIcon /> },
  { title: 'Drivers', path: '/transport/drivers', icon: <PersonIcon /> },
  { title: 'Trips', path: '/transport/trips', icon: <LocalShippingIcon /> },
  { title: 'Student Assignments', path: '/transport/assignments', icon: <AssignmentIcon /> },
  { title: 'Maintenance', path: '/transport/maintenance', icon: <EngineeringIcon /> },
  { title: 'Reports', path: '/transport/reports', icon: <DescriptionIcon /> },
  { title: 'My Resignation', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
];

const librarianMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/library/dashboard', icon: <DashboardIcon /> },
  { title: 'Books Catalog', path: '/library/catalog', icon: <MenuBookIcon /> },
  { title: 'Issue & Return', path: '/library/issue', icon: <LocalLibraryIcon /> },
  { title: 'Reservations', path: '/library/reservations', icon: <EventNoteIcon /> },
  { title: 'Fines', path: '/library/fines', icon: <PaymentIcon /> },
  { title: 'Members', path: '/library/members', icon: <PeopleIcon /> },
  { title: 'Reports', path: '/library/reports', icon: <DescriptionIcon /> },
  { title: 'My Resignation', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
];

const labTechMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/lab/dashboard', icon: <DashboardIcon /> },
  { title: 'Session Attendance', path: '/lab/attendance', icon: <EventAvailableIcon /> },
  { title: 'Practical Observations', path: '/lab/observations', icon: <DescriptionIcon /> },
  { title: 'Lab Schedule', path: '/lab/schedule', icon: <CalendarMonthIcon /> },
  { title: 'Equipment', path: '/lab/equipment', icon: <ComputerIcon /> },
  { title: 'Inventory', path: '/lab/inventory', icon: <InventoryIcon /> },
  { title: 'Maintenance', path: '/lab/maintenance', icon: <EngineeringIcon /> },
  { title: 'Bookings', path: '/lab/bookings', icon: <EventAvailableIcon /> },
  { title: 'My Resignation', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
];

const sportsMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/sports/dashboard', icon: <DashboardIcon /> },
  { title: 'My Teams', path: '/sports/teams', icon: <GroupIcon /> },
  { title: 'Students', path: '/sports/students', icon: <PeopleIcon /> },
  { title: 'Practice Sessions', path: '/sports/sessions', icon: <EventAvailableIcon /> },
  { title: 'Events & Tournaments', path: '/sports/events', icon: <EmojiEventsIcon /> },
  { title: 'Equipment', path: '/sports/equipment', icon: <InventoryIcon /> },
  { title: 'My Resignation', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
];

const kindergartenMenuItems: MenuItemProps[] = [
  { title: 'Early Years Command Desk', path: '/kindergarten/dashboard', icon: <ChildCareIcon /> },
  { title: 'Toddler Daily Attendance', path: '/kindergarten/dashboard?tab=attendance', icon: <EventAvailableIcon /> },
  { title: 'Parent-Teacher Chat', path: '/kindergarten/dashboard?tab=chat', icon: <ChatBubbleOutlinedIcon /> },
  { title: 'Announcements & Circulars', path: '/kindergarten/dashboard?tab=announcements', icon: <CampaignIcon /> },
  { title: 'Meals, Naps & Daily Routine', path: '/kindergarten/dashboard?tab=meals', icon: <DashboardCustomizeIcon /> },
  { title: 'Sensory & Milestones', path: '/kindergarten/dashboard?tab=milestones', icon: <EmojiEventsIcon /> },
  { title: 'Safe Dismissal & Pick-Up', path: '/kindergarten/dashboard?tab=dismissal', icon: <VerifiedUserIcon /> },
  { title: 'Class Sections & Roster', path: '/kindergarten/dashboard?tab=sections', icon: <PeopleIcon /> },
  { title: 'Staff & Caregiver Allocation', path: '/kindergarten/dashboard?tab=staff', icon: <BadgeIcon /> },
  { title: 'My Resignation', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
];

const watchmanMenuItems: MenuItemProps[] = [
  { title: 'Watchman Command Desk', path: '/security/watchman', icon: <SecurityIcon /> },
  { title: 'People Gate Entry', path: '/security/watchman', icon: <PeopleIcon /> },
  { title: 'Bus Timings In / Out', path: '/security/watchman', icon: <DirectionsBusIcon /> },
  { title: 'QR Pass Scanner', path: '/security/watchman', icon: <QrCodeScannerIcon /> },
  { title: 'Security Overview', path: '/admin/security/dashboard', icon: <PolicyIcon /> },
  { title: 'My Resignation', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
];


const financeMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/finance/dashboard', icon: <DashboardIcon /> },
  { title: 'Fee Setup', path: '/finance/setup', icon: <SettingsIcon /> },
  { title: 'Fee Maintenance', path: '/finance/maintenance', icon: <RequestQuoteIcon /> },
  { title: 'Invoices', path: '/finance/invoices', icon: <ReceiptIcon /> },
  { title: 'Student Ledger', path: '/finance/ledger', icon: <AccountBalanceIcon /> },
  { title: 'Payments', path: '/finance/payments', icon: <PaymentIcon /> },
  { title: 'Reconciliation', path: '/finance/reconciliation', icon: <SyncIcon /> },
  { title: 'Reports', path: '/finance/reports', icon: <DescriptionIcon /> },
];

const hrMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/hr/dashboard', icon: <DashboardIcon /> },
  { title: 'Staff Documents Vault', path: '/hr/documents', icon: <FolderSharedIcon /> },
  { title: 'Recruitment Board', path: '/hr/recruitment', icon: <WorkIcon /> },
  { title: 'User Accounts', path: '/admin/users', icon: <PeopleIcon /> },
  { title: 'Employees', path: '/admin/staff', icon: <BadgeIcon /> },
  { title: 'Departments', path: '/admin/staff/departments', icon: <BusinessCenterIcon /> },
  { title: 'Staff Promotions', path: '/hr/promotions', icon: <TrendingUpIcon /> },
  { title: 'Leave Management', path: '/leave/approvals', icon: <EventNoteIcon /> },
  { title: 'Attendance', path: '/attendance/teacher', icon: <EventAvailableIcon /> },
  { title: 'Payroll Desk', path: '/hr/payroll', icon: <AttachMoneyIcon /> },
  { title: 'Resignation & Exits', path: '/hr/offboarding', icon: <AssignmentTurnedInIcon /> },
  { title: 'Referral Rewards Hub', path: '/career/referrals', icon: <CardGiftcardIcon /> },
  { title: 'Onboarding', path: '/hr/onboarding', icon: <PersonAddIcon /> },
  { title: 'Reports', path: '/hr/reports', icon: <DescriptionIcon /> },
];

const hostelMenuItems: MenuItemProps[] = [
  { title: 'Warden Command Desk', path: '/hostel/dashboard', icon: <DashboardIcon /> },
  { title: 'Rooms & Bed Matrix', path: '/hostel/structure', icon: <HotelIcon /> },
  { title: 'Bed Allocations', path: '/hostel/allocation', icon: <AssignmentIcon /> },
  { title: 'Daily Food & Mess', path: '/hostel/mess', icon: <DashboardCustomizeIcon /> },
  { title: 'Roll Call Attendance', path: '/hostel/attendance', icon: <EventAvailableIcon /> },
  { title: 'Gate Passes (In/Out)', path: '/hostel/outpass', icon: <QrCodeScannerIcon /> },
  { title: 'Hostel Fees & Dues', path: '/hostel/fees', icon: <PaymentIcon /> },
  { title: 'Special Events', path: '/hostel/events', icon: <EventNoteIcon /> },
  { title: 'Complaints & Repairs', path: '/hostel/complaints', icon: <ReportProblemIcon /> },
  { title: 'Resident Students', path: '/hostel/operations', icon: <PeopleIcon /> },
];


const superAdminMenuItems: MenuItemProps[] = [
  { title: 'SaaS Dashboard', path: '/super-admin/dashboard', icon: <DashboardIcon /> },
  { title: 'Schools & Tenants', path: '/super-admin/tenants', icon: <BusinessCenterIcon /> },
  {
    title: 'Subscriptions & Plans',
    icon: <AssignmentIcon />,
    children: [
      { title: 'Subscriptions', path: '/super-admin/subscriptions', icon: <EventAvailableIcon /> },
      { title: 'Pricing Plans', path: '/super-admin/plans', icon: <WorkspacePremiumIcon /> },
      { title: 'Plan Features & Modules', path: '/super-admin/plan-features', icon: <DashboardCustomizeIcon /> },
      { title: 'Coupons & Discounts', path: '/super-admin/coupons', icon: <ConfirmationNumberIcon /> },
    ]
  },
  {
    title: 'Billing & Finance',
    icon: <ReceiptIcon />,
    children: [
      { title: 'Invoices', path: '/super-admin/invoices', icon: <ReceiptIcon /> },
      { title: 'Payments', path: '/super-admin/payments', icon: <PaymentIcon /> },
      { title: 'Revenue Analytics', path: '/super-admin/revenue', icon: <TrendingUpIcon /> },
    ]
  },
  {
    title: 'Support & Announcements',
    icon: <CampaignIcon />,
    children: [
      { title: 'Support Tickets', path: '/super-admin/support', icon: <SupportAgentIcon /> },
      { title: 'Announcements', path: '/super-admin/announcements', icon: <CampaignIcon /> },
    ]
  },
  {
    title: 'Platform Governance',
    icon: <SettingsIcon />,
    children: [
      { title: 'Platform Settings', path: '/super-admin/settings', icon: <SettingsIcon /> },
      { title: 'Feature Flags', path: '/super-admin/feature-flags', icon: <FlagIcon /> },
      { title: 'System Health', path: '/super-admin/health', icon: <MonitorHeartIcon /> },
      { title: 'Audit Logs', path: '/super-admin/audit-logs', icon: <HistoryIcon /> },
    ]
  },
];


const staffMenuItems: MenuItemProps[] = [
  { title: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  { title: 'Document Vault & NOCs', path: '/admin/documents', icon: <FolderSharedIcon /> },
  { title: 'Teacher Portal', path: '/teacher/dashboard', icon: <SchoolIcon />, permissions: ['teacher.view'] },
  { title: 'Office Portal', path: '/office/dashboard', icon: <BusinessCenterIcon />, permissions: ['office.view'] },
  { title: 'Staff Portal', path: '/staff-portal', icon: <BadgeIcon />, permissions: ['staff_portal.view'] },
  { 
    title: 'Academic', 
    icon: <SchoolIcon />, 
    children: [
      { title: 'Academic Dashboard', path: '/academic/dashboard', icon: <DashboardIcon />, permissions: ['academic.view'] },
      { title: 'Students', path: '/admin/students', icon: <PeopleIcon />, permissions: ['students.view'] },
      { title: 'Parents', path: '/students/parents', icon: <GroupIcon />, permissions: ['parents.view'] },
      { title: 'Staff & Teachers', path: '/admin/staff', icon: <BadgeIcon />, permissions: ['staff.view', 'hr.employee.view'] },
      { title: 'Departments & Designations', path: '/admin/staff/departments', icon: <BusinessCenterIcon />, permissions: ['staff.employment.manage', 'hr.department.manage'] },
      { title: 'Academic Years', path: '/admin/academics/academic-years', icon: <EventNoteIcon />, permissions: ['academic.manage'] },
      { title: 'Classes & Sections', path: '/admin/academics/classes', icon: <AssignmentIcon />, permissions: ['academic.view'] },
      { title: 'Subjects', path: '/admin/academics/subjects', icon: <HistoryEduIcon />, permissions: ['academic.view'] },
      { title: 'Teacher Assignments', path: '/admin/academics/assignments', icon: <PersonIcon />, permissions: ['academic.view'] },
      { title: 'Online Classes', path: '/academic/online-classes', icon: <EventAvailableIcon />, permissions: ['academic.view'] },
      { title: 'Special Classes', path: '/academic/special-classes', icon: <SchoolIcon />, permissions: ['academic.view'] },
      { title: 'Projects', path: '/academic/projects', icon: <AssignmentIcon />, permissions: ['academic.view'] },
      { title: 'Assessments', path: '/academic/assessments', icon: <HistoryEduIcon />, permissions: ['academic.view'] },
      { title: 'Learning Management', path: '/lms/teacher/dashboard', icon: <AssignmentIcon />, permissions: ['academic.view'] },
      { title: 'Practicals & Lab', path: '/academic/practicals', icon: <DashboardIcon />, permissions: ['academic.view'] },
      { title: 'Kindergarten & Early Years', path: '/kindergarten/dashboard', icon: <ChildCareIcon />, permissions: ['academic.view'] },
      { 
        title: 'Timetable', 
        icon: <EventAvailableIcon />, 
        permissions: ['timetable.view'],
        children: [
          { title: 'Dashboard', path: '/timetable/dashboard', icon: <DashboardIcon /> },
          { title: 'Versions', path: '/timetable/versions', icon: <AssignmentIcon /> },
          { title: 'Allocate Staff (Builder)', path: '/timetable/editor', icon: <EventNoteIcon /> },
          { title: 'Period Exchange Desk', path: '/timetable/exchange', icon: <SyncIcon /> },
          { title: 'Class View', path: '/timetable/class', icon: <PeopleIcon /> },
          { title: 'Teacher View', path: '/timetable/teacher', icon: <PersonIcon /> },
          { title: 'Conflicts', path: '/timetable/conflicts', icon: <HistoryEduIcon /> },
          { title: 'Rooms', path: '/timetable/rooms', icon: <SchoolIcon /> },
          { title: 'Periods', path: '/timetable/periods', icon: <EventAvailableIcon /> },
        ]
      },
      { 
        title: 'Attendance', 
        icon: <EventAvailableIcon />, 
        permissions: ['attendance.view'],
        children: [
          { title: 'Dashboard', path: '/attendance/students', icon: <DashboardIcon /> },
          { title: 'Teacher Desk', path: '/attendance/teacher', icon: <PersonIcon /> },
          { title: 'Corrections', path: '/attendance/corrections', icon: <AssignmentIcon /> },
          { title: 'Class Report', path: '/attendance/class-report', icon: <PeopleIcon /> },
          { title: 'Student Profile', path: '/attendance/profile', icon: <HistoryEduIcon /> },
          { title: 'Attendance Policies', path: '/attendance/policy', icon: <SettingsIcon /> },
          { title: 'Late Comers', path: '/attendance/late-comers', icon: <AssignmentIcon /> },
        ]
      },
      { 
        title: 'Leave & Absence', 
        icon: <EventNoteIcon />, 
        permissions: ['leave.view'],
        children: [
          { title: 'My Leave', path: '/leave/my-leave', icon: <EventNoteIcon /> },
          { title: 'Approvals', path: '/leave/approvals', icon: <AssignmentIcon /> },
          { title: 'Calendar', path: '/leave/calendar', icon: <EventAvailableIcon /> },
          { title: 'Balances', path: '/leave/balances', icon: <PeopleIcon /> },
          { title: 'Leave Types', path: '/leave/types', icon: <SettingsIcon /> },
        ]
      },
      {
        title: 'Health & Wellness',
        icon: <LocalHospitalIcon />,
        permissions: ['health.view'],
        children: [
          { title: 'Dashboard', path: '/admin/health/dashboard', icon: <DashboardIcon /> },
          { title: 'Emergencies', path: '/admin/health/emergency', icon: <WarningAmberIcon /> },
          { title: 'Visits', path: '/admin/health/visits', icon: <EventNoteIcon /> },
          { title: 'First Aid', path: '/admin/health/first-aid', icon: <AssignmentIcon /> },
          { title: 'Profiles', path: '/admin/health/profiles', icon: <PeopleIcon /> },
          { title: 'Immunization', path: '/admin/health/immunization', icon: <SettingsIcon /> },
          { title: 'Medical Alerts', path: '/admin/health/alerts', icon: <WarningAmberIcon /> },
          { title: 'Emergency Contacts', path: '/admin/health/emergency-contacts', icon: <PersonIcon /> },
          { title: 'Incidents', path: '/admin/health/incidents', icon: <HistoryEduIcon /> },
          { title: 'Wellness', path: '/admin/health/wellness', icon: <SchoolIcon /> },
        ]
      },
      { 
        title: 'Examinations', 
        icon: <AssignmentIcon />, 
        permissions: ['examination.view'],
        children: [
          { title: 'Dashboard', path: '/examination/dashboard', icon: <AssignmentIcon /> },
          { title: 'Manage Exams', path: '/examination/manage', icon: <SettingsIcon /> },
          { title: 'Exam Calendar', path: '/examination/calendar', icon: <EventIcon /> },
          { title: 'Types & Terms', path: '/examination/types', icon: <SettingsIcon /> },
          { title: 'Room Logistics', path: '/examination/logistics', icon: <MeetingRoomIcon /> },
          { title: 'Attendance', path: '/examination/attendance', icon: <PersonIcon /> },
          { title: 'Question Bank', path: '/examination/question-bank', icon: <DescriptionIcon /> },
          { title: 'Build Papers', path: '/examination/question-papers', icon: <DescriptionIcon /> },
          { title: 'Marks Entry', path: '/examination/marks-entry', icon: <AssignmentIcon /> },
          { title: 'Bulk Import', path: '/examination/marks-import', icon: <UploadFileIcon /> },
          { title: 'Verify Results', path: '/examination/verification', icon: <AssignmentIcon /> },
          { title: 'Moderate Marks', path: '/examination/moderation', icon: <AssignmentIcon /> },
          { title: 'Process Results', path: '/examination/process-results', icon: <AssessmentIcon /> },
          { title: 'Publish Results', path: '/examination/result-publisher', icon: <SendIcon /> },
          { title: 'Report Cards', path: '/examination/report-cards', icon: <AssignmentIcon /> },
          { title: 'Public Exams (Higher Sec)', path: '/examination/public-exams', icon: <SchoolIcon /> },
          { title: 'Rankings', path: '/examination/ranking', icon: <EmojiEventsIcon /> },
          { title: 'Analytics', path: '/examination/analytics', icon: <ShowChartIcon /> },
          { title: 'Reports', path: '/examination/reports', icon: <DescriptionIcon /> },
          { title: 'Settings', path: '/examination/settings', icon: <SettingsIcon /> },
        ]
      },
      { 
        title: 'Academic Progression', 
        icon: <TrendingUpIcon />, 
        permissions: ['promotion.view'],
        children: [
          { title: 'Dashboard', path: '/promotion/dashboard', icon: <AssignmentIcon /> },
          { title: 'Promotion Policies', path: '/promotion/policies', icon: <SettingsIcon /> },
          { title: 'Eligibility Engine', path: '/promotion/eligibility', icon: <AssignmentTurnedInIcon /> },
          { title: 'Promotion Approval', path: '/promotion/approval', icon: <CheckCircleIcon /> },
          { title: 'Subject Allocation', path: '/promotion/subject-allocation', icon: <GroupIcon /> },
          { title: 'Year Rollover', path: '/promotion/rollover', icon: <SyncIcon /> },
        ]
      },
    ]
  },
  {
    title: 'Alumni & Graduates',
    icon: <GroupIcon />,
    children: [
      { title: 'Dashboard', path: '/alumni/dashboard', icon: <DashboardIcon />, permissions: ['alumni.view'] },
      { title: 'My Profile', path: '/alumni/profile', icon: <PersonIcon />, permissions: ['alumni.profile.edit'] },
      { title: 'Alumni Directory', path: '/alumni/directory', icon: <PeopleIcon />, permissions: ['alumni.directory.view'] },
      { title: 'Mentorship Hub', path: '/alumni/mentorship', icon: <GroupIcon />, permissions: ['alumni.mentorship.view'] },
      { title: 'Events Board', path: '/alumni/events', icon: <EventIcon />, permissions: ['alumni.events.view'] },
      { title: 'Job Board', path: '/alumni/jobs', icon: <AssignmentIcon />, permissions: ['alumni.jobs.view'] },
      { title: 'Fundraising', path: '/alumni/donations', icon: <AttachMoneyIcon />, permissions: ['alumni.donations.create'] },
    ]
  },
  { 
    title: 'Finance',  
    icon: <AccountBalanceIcon />, 
    children: [
      { title: 'Dashboard', path: '/finance/dashboard', icon: <AccountBalanceIcon />, permissions: ['finance.view'] },
      { title: 'Fee Setup', path: '/finance/setup', icon: <SettingsIcon />, permissions: ['finance.manage'] },
      { title: 'Fee Maintenance', path: '/finance/maintenance', icon: <RequestQuoteIcon />, permissions: ['finance.manage'] },
      { title: 'Invoices', path: '/finance/invoices', icon: <ReceiptIcon />, permissions: ['finance.manage'] },
      { title: 'Student Ledger', path: '/finance/ledger', icon: <AccountBalanceIcon />, permissions: ['finance.manage'] },
      { title: 'Payments', path: '/finance/payments', icon: <PaymentIcon />, permissions: ['finance.manage'] },
      { title: 'Reconciliation', path: '/finance/reconciliation', icon: <SyncIcon />, permissions: ['finance.manage'] },
      { title: 'Reports', path: '/finance/reports', icon: <DescriptionIcon />, permissions: ['finance.report.view'] },
    ]
  },
  { 
    title: 'Accounting', 
    icon: <AccountBalanceIcon />, 
    children: [
      { title: 'Dashboard', path: '/accounting/dashboard', icon: <TrendingUpIcon />, permissions: ['accounting.view'] },
      { title: 'Chart of Accounts', path: '/accounting/chart-of-accounts', icon: <AccountBalanceIcon />, permissions: ['accounting.accounts.manage'] },
      { title: 'Journal Entries', path: '/accounting/journals', icon: <ReceiptIcon />, permissions: ['accounting.journal.post'] },
      { title: 'General Ledger', path: '/accounting/ledger', icon: <AccountBalanceIcon />, permissions: ['accounting.ledger.view'] },
      { title: 'Trial Balance', path: '/accounting/trial-balance', icon: <AccountBalanceIcon />, permissions: ['accounting.trial_balance.view'] },
      { title: 'Expense Manager', path: '/accounting/expenses', icon: <PaymentIcon />, permissions: ['accounting.expense.manage'] },
      { title: 'Budget Management', path: '/accounting/budgets', icon: <AccountBalanceIcon />, permissions: ['accounting.view'] },
      { title: 'Financial Reports', path: '/accounting/reports', icon: <TrendingUpIcon />, permissions: ['accounting.view'] },
    ]
  },
  { 
    title: 'Communication', 
    icon: <CampaignIcon />, 
    children: [
      { title: 'Dashboard', path: '/communication/dashboard', icon: <DashboardIcon />, permissions: ['communication.view'] },
      { title: 'Announcements', path: '/communication/announcements', icon: <CampaignIcon />, permissions: ['communication.manage'] },
      { title: 'Complaint Desk', path: '/communication/complaints', icon: <AssignmentIcon />, permissions: ['communication.manage'] },
      { title: 'Messages', path: '/communication/chat', icon: <MessageIcon />, permissions: ['communication.view'] },
    ]
  },
  { 
    title: 'Operations', 
    icon: <SettingsIcon />, 
    children: [
      { 
        title: 'Library', 
        icon: <LocalLibraryIcon />, 
        permissions: ['library.view'],
        children: [
          { title: 'Dashboard', path: '/library/dashboard', icon: <DashboardIcon /> },
          { title: 'Analytics', path: '/library/analytics', icon: <TrendingUpIcon /> },
          { title: 'Book Catalog', path: '/library/catalogue', icon: <LocalLibraryIcon /> },
          { title: 'Categories', path: '/library/categories', icon: <CategoryIcon /> },
          { title: 'Shelves', path: '/library/shelves', icon: <MeetingRoomIcon /> },
          { title: 'Barcodes & QR', path: '/library/barcodes', icon: <QrCodeScannerIcon /> },
          { title: 'Circulation', path: '/library/circulation', icon: <AssignmentIcon /> },
          { title: 'Members', path: '/library/portal', icon: <PeopleIcon /> },
          { title: 'Library Cards', path: '/library/cards', icon: <BadgeIcon /> },
          { title: 'Reading Programs', path: '/library/reading-programs', icon: <EventNoteIcon /> },
          { title: 'Reading Log', path: '/library/reading-log', icon: <MenuBookIcon /> },
          { title: 'Attendance', path: '/library/attendance', icon: <GroupIcon /> },
          { title: 'Fines', path: '/library/fines', icon: <ReceiptIcon /> },
          { title: 'Stocktake', path: '/library/stocktake', icon: <InventoryIcon /> },
          { title: 'Donations', path: '/library/donations', icon: <BusinessCenterIcon /> },
        ]
      },
      { 
        title: 'Transport', 
        icon: <DirectionsBusIcon />, 
        permissions: ['transport.view'],
        children: [
          { title: 'Dashboard', path: '/transport/dashboard', icon: <DashboardIcon /> },
          { title: 'Fleet', path: '/transport/fleet', icon: <DirectionsBusIcon /> },
          { title: 'Drivers & Staff', path: '/transport/staff', icon: <DirectionsBusIcon /> },
          { title: 'Live Driver Console', path: '/driver', icon: <DashboardIcon /> },
          { title: 'Routes', path: '/transport/routes', icon: <EventNoteIcon /> }
        ]
      },
      { 
        title: 'Inventory', 
        icon: <BusinessCenterIcon />, 
        permissions: ['inventory.view'],
        children: [
          { title: 'Dashboard', path: '/inventory', icon: <DashboardIcon /> },
          { title: 'Catalog', path: '/inventory/catalog', icon: <AssignmentIcon /> },
          { title: 'Stock Ledger', path: '/inventory/ledger', icon: <ReceiptIcon /> },
          { title: 'Operations', path: '/inventory/operations', icon: <SyncIcon /> },
        ]
      },
      { 
        title: 'Procurement', 
        icon: <PaymentIcon />, 
        permissions: ['procurement.view'],
        children: [
          { title: 'Dashboard', path: '/procurement', icon: <DashboardIcon /> },
          { title: 'Quotations', path: '/procurement/quotations', icon: <ReceiptIcon /> },
          { title: 'Purchase Orders', path: '/procurement/orders', icon: <AssignmentIcon /> },
          { title: 'Goods Receipt', path: '/procurement/receiving', icon: <SyncIcon /> },
        ]
      },
      { 
        title: 'Assets', 
        icon: <BusinessCenterIcon />, 
        permissions: ['assets.view'],
        children: [
          { title: 'Asset Register', path: '/assets', icon: <DashboardIcon /> },
          { title: 'Operations', path: '/assets/operations', icon: <SyncIcon /> },
          { title: 'Maintenance', path: '/assets/maintenance', icon: <SettingsIcon /> },
        ]
      },
      { 
        title: 'Hostel', 
        icon: <HotelIcon />, 
        permissions: ['hostel.view'],
        children: [
          { title: 'Dashboard', path: '/hostel/dashboard', icon: <DashboardIcon /> },
          { title: 'Structure & Rooms', path: '/hostel/rooms', icon: <SchoolIcon /> },
          { title: 'Allocations', path: '/hostel/allocation', icon: <AssignmentIcon /> },
          { title: 'Outpass Manager', path: '/hostel/outpass', icon: <EventNoteIcon /> },
          { title: 'Mess Management', path: '/hostel/mess', icon: <ReceiptIcon /> },
          { title: 'Incidents', path: '/hostel/complaints', icon: <MessageIcon /> },
        ]
      },
      { 
        title: 'Health & Medical', 
        icon: <LocalHospitalIcon />, 
        permissions: ['health.view'],
        children: [
          { title: 'Dashboard', path: '/health/dashboard', icon: <DashboardIcon /> },
          { title: 'Student Profiles', path: '/health/profiles', icon: <PeopleIcon /> },
          { title: 'Clinic Desk', path: '/health/clinic', icon: <LocalHospitalIcon /> },
          { title: 'Medication', path: '/health/medication', icon: <MedicalServicesIcon /> },
          { title: 'Screenings', path: '/health/screening', icon: <AssignmentIcon /> },
          { title: 'Emergencies', path: '/health/emergency', icon: <WarningAmberIcon /> },
        ]
      },
      { 
        title: 'Safety & Security', 
        icon: <VerifiedUserIcon />, 
        permissions: ['safety.view'],
        children: [
          { title: 'Safety Dashboard', path: '/safety/dashboard', icon: <DashboardIcon /> },
          { title: 'Security Dashboard', path: '/safety/security', icon: <PolicyIcon /> },
          { title: 'Command Center', path: '/safety/command-center', icon: <WarningAmberIcon /> },
          { title: 'Risk & Inspections', path: '/safety/risks', icon: <AssignmentIcon /> },
          { title: 'Incidents', path: '/safety/incidents', icon: <MessageIcon /> },
        ]
      },
      { 
        title: 'Alumni & Community', 
        icon: <SchoolIcon />, 
        permissions: ['alumni.view'],
        children: [
          { title: 'Alumni Dashboard', path: '/alumni/dashboard', icon: <DashboardIcon /> },
          { title: 'Alumni Directory', path: '/alumni/directory', icon: <PeopleIcon /> },
          { title: 'Mentorship Hub', path: '/alumni/mentorship', icon: <PersonIcon /> },
          { title: 'Career & Jobs', path: '/alumni/jobs', icon: <AssignmentIcon /> },
          { title: 'Fundraising', path: '/alumni/fundraising', icon: <AccountBalanceIcon /> },
        ]
      },
      { 
        title: 'Events & Activities', 
        icon: <EventIcon />, 
        permissions: ['events.view'],
        children: [
          { title: 'Event Dashboard', path: '/events/dashboard', icon: <DashboardIcon /> },
          { title: 'Calendar', path: '/events/calendar', icon: <EventIcon /> },
          { title: 'Registrations', path: '/events/registration', icon: <AssignmentIcon /> },
          { title: 'Competitions', path: '/events/competitions', icon: <EmojiEventsIcon /> },
          { title: 'Trips & Tours', path: '/events/trips', icon: <DirectionsBusIcon /> },
          { title: 'Clubs', path: '/events/clubs', icon: <GroupIcon /> },
          { title: 'Birthdays', path: '/events/birthdays', icon: <EventIcon /> },
          { title: 'Prayers & Assemblies', path: '/events/prayers', icon: <GroupIcon /> },
        ]
      },
      { 
        title: 'Student Engagement', 
        icon: <EmojiEventsIcon />, 
        permissions: ['activities.view'],
        children: [
          { title: 'House Management', path: '/engagement/houses', icon: <GroupIcon /> },
          { title: 'Student Elections', path: '/engagement/elections', icon: <HowToVoteIcon /> },
          { title: 'Achievements', path: '/engagement/achievements', icon: <WorkspacePremiumIcon /> },
          { title: 'Student Portfolio', path: '/engagement/portfolio', icon: <AssignmentIcon /> },
        ]
      },
      { 
        title: 'Career & Placement', 
        icon: <WorkIcon />, 
        permissions: ['career.view'],
        children: [
          { title: 'Overview Dashboard', path: '/career/dashboard', icon: <DashboardIcon /> },
          { title: 'Student Career Hub', path: '/career/student-hub', icon: <FlagIcon /> },
          { title: 'Counseling Portal', path: '/career/counseling', icon: <GroupIcon /> },
          { title: 'Higher Ed Tracker', path: '/career/higher-ed', icon: <SchoolIcon /> },
          { title: 'Placement Drives', path: '/career/placements', icon: <WorkIcon /> },
          { title: 'Referral Rewards Hub', path: '/career/referrals', icon: <CardGiftcardIcon /> },
        ]
      },
      { 
        title: 'Laboratories', 
        icon: <ScienceIcon />, 
        children: [
          { title: 'Lab Dashboard', path: '/lab/dashboard', icon: <DashboardIcon /> },
          { title: 'Equipment', path: '/lab/equipment', icon: <ComputerIcon /> },
          { title: 'Inventory', path: '/lab/inventory', icon: <InventoryIcon /> },
          { title: 'Bookings', path: '/lab/bookings', icon: <EventAvailableIcon /> },
        ]
      },
      { 
        title: 'Sports & Athletics', 
        icon: <EmojiEventsIcon />, 
        children: [
          { title: 'Sports Dashboard', path: '/sports/dashboard', icon: <DashboardIcon /> },
          { title: 'Teams & Squads', path: '/sports/teams', icon: <GroupIcon /> },
          { title: 'Events & Tournaments', path: '/sports/events', icon: <EmojiEventsIcon /> },
          { title: 'Sports Equipment', path: '/sports/equipment', icon: <InventoryIcon /> },
          { title: 'Practice Sessions', path: '/sports/sessions', icon: <EventAvailableIcon /> },
        ]
      },
    ]
  },
  {
    title: 'Operations & Control', 
    icon: <DashboardCustomizeIcon />, 
    permissions: ['control_center.view'],
    children: [
      { title: 'Admin Dashboard', path: '/operations/dashboard', icon: <DashboardIcon /> },
      { title: 'Task Board', path: '/operations/tasks', icon: <TaskAltIcon /> },
      { title: 'My Approvals', path: '/operations/approvals', icon: <CheckCircleIcon /> },
      { title: 'Request Portal', path: '/operations/requests', icon: <DynamicFormIcon /> },
      { title: 'Grievance', path: '/operations/complaints', icon: <WarningAmberIcon /> },
    ]
  },

  { 
    title: 'Inventory & Procurement', 
    icon: <InventoryIcon />, 
    permissions: ['inventory.view'],
    children: [
      { title: 'Procurement Dashboard', path: '/procurement/dashboard', icon: <DashboardIcon /> },
      { title: 'RFQ Manager', path: '/procurement/rfq', icon: <AssignmentIcon /> },
      { title: 'Quotations', path: '/procurement/quotations', icon: <RequestQuoteIcon /> },
      { title: 'Purchase Orders', path: '/inventory/purchases', icon: <ShoppingCartIcon /> },
      { title: 'Goods Receiving', path: '/procurement/goods-receiving', icon: <CheckCircleIcon /> },
      { title: 'Invoice Matching', path: '/procurement/invoice-matching', icon: <CompareArrowsIcon /> },
      { title: 'Vendor Directory', path: '/vendors/directory', icon: <StoreIcon /> },
      { title: 'Vendor Analytics', path: '/vendors/performance', icon: <AssessmentIcon /> },
      { title: 'Stock Ledger', path: '/inventory/ledger', icon: <ReceiptIcon /> },
      { title: 'Item Catalog', path: '/inventory/items', icon: <CategoryIcon /> },
    ]
  },
  {
    title: 'Asset Management',
    icon: <ComputerIcon />,
    permissions: ['assets.view'],
    children: [
      { title: 'Asset Dashboard', path: '/assets/dashboard', icon: <DashboardIcon /> },
      { title: 'Asset Registry', path: '/assets/registry', icon: <CategoryIcon /> },
      { title: 'Maintenance', path: '/assets/maintenance', icon: <EngineeringIcon /> },
      { title: 'Work Orders', path: '/assets/work-orders', icon: <AssignmentIcon /> },
    ]
  },
  {
    title: 'Facilities Management',
    icon: <MeetingRoomIcon />,
    permissions: ['facilities.view'],
    children: [
      { title: 'Facility Dashboard', path: '/facilities/dashboard', icon: <DashboardIcon /> },
      { title: 'Room Booking', path: '/facilities/bookings', icon: <EventAvailableIcon /> },
    ]
  },
  { 
    title: 'HR', 
    icon: <BusinessCenterIcon />,
    permissions: ['hr.view', 'hr.manage', 'payroll.manage'],
    children: [
      { title: 'Staff', path: '/hr/directory', icon: <PeopleIcon />, permissions: ['hr.view'] },
      { title: 'Leave', path: '/leave/approvals', icon: <EventAvailableIcon />, permissions: ['hr.manage'] },
      { title: 'Payroll', path: '/hr/payroll', icon: <AccountBalanceIcon />, permissions: ['payroll.manage'] },
      { title: 'Onboarding', path: '/admin/staff/new', icon: <PersonAddIcon />, permissions: ['hr.manage'] },
      { title: 'Offboarding & Clearances', path: '/hr/offboarding', icon: <WarningAmberIcon />, permissions: ['hr.manage'] },
      { title: 'Staff Resignation Portal', path: '/staff/resignation', icon: <AssignmentTurnedInIcon /> },
      { title: 'Promotions', path: '/hr/promotions', icon: <TrendingUpIcon />, permissions: ['hr.manage'] },
    ]
  },
  {
    title: 'Document Management',
    icon: <DescriptionIcon />,
    permissions: ['document.view', 'document.manage'],
    children: [
      { title: 'Document Dashboard', path: '/documents/dashboard', icon: <DashboardIcon /> },
      { title: 'All Documents', path: '/documents/all', icon: <FolderIcon /> },
      { title: 'Upload Document', path: '/documents/upload', icon: <CloudUploadIcon /> },
      { title: 'Pending Approvals', path: '/documents/approvals', icon: <VerifiedUserIcon />, permissions: ['document.approve'] },
    ]
  },
  {
    title: 'Campus Security',
    icon: <SecurityIcon />,
    permissions: ['security.view'],
    children: [
      { title: 'Watchman Gate Desk', path: '/security/watchman', icon: <SecurityIcon /> },
      { title: 'Security Dashboard', path: '/admin/security/dashboard', icon: <DashboardIcon /> },
      { title: 'Visitor Registration', path: '/admin/security/visitors', icon: <PersonAddIcon />, permissions: ['security.visitor.view'] },
      { title: 'Pre-Registration', path: '/admin/security/pre-registration', icon: <EventNoteIcon />, permissions: ['security.visitor.manage'] },
      { title: 'Student Pickup', path: '/admin/security/pickup', icon: <ChildCareIcon />, permissions: ['security.pickup.view'] },
      { title: 'Gate Passes', path: '/admin/security/gate-passes', icon: <QrCodeScannerIcon />, permissions: ['security.pass.view'] },
      { title: 'Vehicles & Parking', path: '/admin/security/vehicles', icon: <DirectionsCarIcon />, permissions: ['security.vehicle.view'] },
      { title: 'Deliveries & Contractors', path: '/admin/security/deliveries', icon: <LocalShippingIcon />, permissions: ['security.delivery.view'] },
      { title: 'Security Incidents', path: '/admin/security/incidents', icon: <WarningAmberIcon />, permissions: ['security.incident.view'] },
      { title: 'Emergency Lockdown', path: '/admin/security/lockdown', icon: <LockIcon />, permissions: ['security.lockdown.view'] },
      { title: 'Guard Shifts', path: '/admin/security/shifts', icon: <BadgeIcon />, permissions: ['security.shift.view'] },
      { title: 'Lost & Found', path: '/admin/security/lost-found', icon: <FindInPageIcon /> },
      { title: 'Access Audit Log', path: '/admin/security/audit', icon: <PolicyIcon />, permissions: ['security.audit.view'] },
    ]
  },
  {
    title: 'System Audit',
    icon: <PolicyIcon />,
    permissions: ['system.audit'],
    path: '/admin/audit-logs'
  },
  { title: 'Branches & Campuses', path: '/organization/branches', icon: <AccountBalanceIcon />, permissions: ['organization.manage', 'tenant.manage'] },
  { title: 'Settings', path: '/admin/settings', icon: <SettingsIcon />, permissions: ['tenant.manage'] },
];

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, handleDrawerToggle, drawerWidth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, primaryRole, isClassCoordinator, isParent, isStudent } = useAuth();
  
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({});

  const handleSubMenuToggle = (title: string) => {
    setOpenSubMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const checkPermission = (permissions?: string[]) => {
    if (!permissions || permissions.length === 0) return true;
    return permissions.some(p => hasPermission(p));
  };

  const hasVisibleChildren = (children: MenuItemProps[]): boolean => {
    return children.some(child => {
      if (!checkPermission(child.permissions)) return false;
      if (child.children && child.children.length > 0) {
        return hasVisibleChildren(child.children);
      }
      return true;
    });
  };

  const renderMenuItem = (item: MenuItemProps, depth = 0) => {
    if (!checkPermission(item.permissions)) return null;

    const hasChildren = item.children && item.children.length > 0;
    
    // Hide parent folder if all its children are hidden by permissions
    if (hasChildren && !hasVisibleChildren(item.children!)) {
      return null;
    }

    const currentUrl = location.pathname + location.search;
    const isActive = item.path 
      ? (item.path.includes('?') 
          ? currentUrl === item.path 
          : (location.pathname === item.path || (item.path !== '/' && !location.search && location.pathname.startsWith(item.path))))
      : false;
    const isOpen = openSubMenus[item.title];

    return (
      <React.Fragment key={item.title}>
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
          <ListItemButton
            onClick={() => hasChildren ? handleSubMenuToggle(item.title) : navigate(item.path!)}
            sx={{
              minHeight: 44,
              px: 2,
              pl: 2 + depth * 2,
              mx: 1.5,
              borderRadius: 2,
              bgcolor: isActive && !hasChildren ? 'primary.50' : 'transparent',
              color: isActive && !hasChildren ? 'primary.main' : 'text.secondary',
              '&:hover': {
                bgcolor: isActive && !hasChildren ? 'primary.50' : 'action.hover',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography sx={{ 
                  fontSize: '0.875rem', 
                  fontWeight: isActive ? 600 : 500,
                  color: 'inherit'
                }}>
                  {item.title}
                </Typography>
              } 
            />
            {hasChildren && (
              isOpen ? <ExpandLess sx={{ color: 'text.disabled' }} /> : <ExpandMore sx={{ color: 'text.disabled' }} />
            )}
          </ListItemButton>
        </ListItem>
        
        {hasChildren && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  // ─── Role-Based Sidebar Selection ───
  // Uses primaryRole from useAuth (which reads from DB roles, NOT URL path)
  const ROLE_MENU_MAP: Record<string, MenuItemProps[]> = {
    'SUPER_ADMIN':       superAdminMenuItems,
    'SCHOOL_ADMIN':      staffMenuItems,
    'ADMIN':             staffMenuItems,
    'PRINCIPAL':         principalMenuItems,
    'VICE_PRINCIPAL':    principalMenuItems,
    'TEACHER':           isClassCoordinator
                           ? [...teacherMenuItems, ...coordinatorMenuItems, ...teacherOtherMenuItems]
                           : [...teacherMenuItems, ...teacherOtherMenuItems],
    'CLASS_TEACHER':     isClassCoordinator
                           ? [...teacherMenuItems, ...coordinatorMenuItems, ...teacherOtherMenuItems]
                           : [...teacherMenuItems, ...teacherOtherMenuItems],
    'CLASS_COORDINATOR': [...teacherMenuItems, ...coordinatorMenuItems, ...teacherOtherMenuItems],
    'STUDENT':           studentMenuItems,
    'PARENT':            parentMenuItems,
    'DRIVER':            driverMenuItems,
    'TRANSPORT_MANAGER': transportManagerMenuItems,
    'LIBRARIAN':         librarianMenuItems,
    'LAB_INCHARGE':      labTechMenuItems,
    'LAB_TECHNICIAN':    labTechMenuItems,
    'SPORTS_COACH':      sportsMenuItems,
    'FINANCE_ADMIN':     financeMenuItems,
    'ACCOUNTANT':        financeMenuItems,
    'HR_ADMIN':          hrMenuItems,
    'HR':                hrMenuItems,
    'HOSTEL_WARDEN':     hostelMenuItems,
    'OFFICE_ADMIN':      officeMenuItems,
    'ADMISSION_STAFF':   officeMenuItems,
    'KINDERGARTEN_TEACHER': kindergartenMenuItems,
    'KINDERGARTEN_STAFF':   kindergartenMenuItems,
    'WATCHMAN':          watchmanMenuItems,
    'SECURITY_GUARD':    watchmanMenuItems,
    'SECURITY_HEAD':     watchmanMenuItems,
    'SECURITY':          watchmanMenuItems,
  };

  let menuItems = ROLE_MENU_MAP[primaryRole] || staffMenuItems;

  const ROLE_TITLE_MAP: Record<string, string> = {
    'SUPER_ADMIN':       'Super Admin',
    'SCHOOL_ADMIN':      'School Admin',
    'ADMIN':             'Admin',
    'PRINCIPAL':         'Principal',
    'VICE_PRINCIPAL':    'Vice Principal',
    'TEACHER':           isClassCoordinator ? 'Teacher & Coordinator' : 'Teacher',
    'CLASS_TEACHER':     isClassCoordinator ? 'Teacher & Coordinator' : 'Teacher',
    'CLASS_COORDINATOR': 'Class Coordinator',
    'STUDENT':           'Student',
    'PARENT':            'Parent',
    'DRIVER':            'Driver',
    'TRANSPORT_MANAGER': 'Transport',
    'LIBRARIAN':         'Librarian',
    'LAB_INCHARGE':      'Lab In-Charge',
    'LAB_TECHNICIAN':    'Lab Tech',
    'SPORTS_COACH':      'Sports',
    'FINANCE_ADMIN':     'Finance',
    'HR_ADMIN':          'HR',
    'HOSTEL_WARDEN':     'Hostel',
    'OFFICE_ADMIN':      'Office',
    'ADMISSION_STAFF':   'Admissions',
    'KINDERGARTEN_TEACHER': 'Kindergarten',
    'KINDERGARTEN_STAFF':   'Kindergarten',
    'WATCHMAN':          'Watchman / Gate Duty',
    'SECURITY_GUARD':    'Security Guard',
    'SECURITY_HEAD':     'Security Head',
    'SECURITY':          'Campus Security',
  };

  let activeRoleTitle = ROLE_TITLE_MAP[primaryRole] || 'Staff';

  if (location.pathname.startsWith('/parent-portal') || (location.pathname.startsWith('/parent') && !location.pathname.startsWith('/students/parents'))) {
    menuItems = parentMenuItems;
    activeRoleTitle = 'Parent Portal';
  } else if (
    (location.pathname.startsWith('/student-portal') || location.pathname.startsWith('/lms/student') || location.pathname.startsWith('/student/dashboard')) &&
    !location.pathname.startsWith('/students/')
  ) {
    menuItems = studentMenuItems;
    activeRoleTitle = 'Student Portal';
  } else if (
    location.pathname.startsWith('/kindergarten') ||
    primaryRole === 'KINDERGARTEN_TEACHER' ||
    primaryRole === 'KINDERGARTEN_STAFF'
  ) {
    menuItems = kindergartenMenuItems;
    activeRoleTitle = 'Kindergarten & Early Years';
  } else if (location.pathname.startsWith('/transport/tracking')) {
    if (isParent || primaryRole === 'PARENT') {
      menuItems = parentMenuItems;
      activeRoleTitle = 'Parent Portal';
    } else if (isStudent || primaryRole === 'STUDENT') {
      menuItems = studentMenuItems;
      activeRoleTitle = 'Student Portal';
    }
  } else if (location.pathname.startsWith('/library/portal')) {
    if (isStudent || primaryRole === 'STUDENT') {
      menuItems = studentMenuItems;
      activeRoleTitle = 'Student Portal';
    }
  } else if (location.pathname.startsWith('/teacher') || location.pathname.startsWith('/lms/teacher')) {
    menuItems = isClassCoordinator 
      ? [...teacherMenuItems, ...coordinatorMenuItems, ...teacherOtherMenuItems]
      : [...teacherMenuItems, ...teacherOtherMenuItems];
    activeRoleTitle = 'Teacher Portal';
  } else if (location.pathname.startsWith('/super-admin')) {
    menuItems = superAdminMenuItems;
    activeRoleTitle = 'Super Admin';
  } else if (location.pathname.startsWith('/principal')) {
    menuItems = principalMenuItems;
    activeRoleTitle = 'Principal';
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, display: 'flex', alignItems: 'center' }}>
        <SchoolIcon sx={{ color: 'primary.main', mr: 1.5, fontSize: 32 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
          EduCore {activeRoleTitle}
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'divider', mb: 2 }} />
      <List sx={{ flex: 1, overflowY: 'auto', px: 0 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          ERP System v2.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.paper' },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;
