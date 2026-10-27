import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  IconButton,
  Tooltip,
  Badge,
  Alert,
  Stack,
  InputAdornment
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import PaletteIcon from '@mui/icons-material/Palette';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintIcon from '@mui/icons-material/Print';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BadgeIcon from '@mui/icons-material/Badge';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import MoodIcon from '@mui/icons-material/Mood';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import CampaignIcon from '@mui/icons-material/Campaign';
import SendIcon from '@mui/icons-material/Send';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import TodayIcon from '@mui/icons-material/Today';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Wing Definitions
type EducationalWing = 'KINDERGARTEN' | 'PRIMARY' | 'SECONDARY' | 'HIGHER_SECONDARY';

interface WingMeta {
  id: EducationalWing;
  label: string;
  icon: string;
  grades: string;
  headmaster: string;
  totalStudents: number;
  totalStaff: number;
}

const WINGS_CONFIG: WingMeta[] = [
  {
    id: 'KINDERGARTEN',
    label: '🧸 Kindergarten / Early Years (Pre-KG, LKG, UKG)',
    icon: '🧸',
    grades: 'Pre-KG, LKG, UKG (Ages 2.5 - 5.5 yrs)',
    headmaster: 'Mrs. Devaki Raman (ECCE Early Childhood Specialist)',
    totalStudents: 46,
    totalStaff: 9
  },
  {
    id: 'PRIMARY',
    label: '🎒 Primary Wing (Grades 1 to 5)',
    icon: '🎒',
    grades: 'Grade 1 through Grade 5',
    headmaster: 'Mr. Anand Chandrasekar (Primary Coordinator)',
    totalStudents: 180,
    totalStaff: 14
  },
  {
    id: 'SECONDARY',
    label: '📚 Secondary Wing (Grades 6 to 10)',
    icon: '📚',
    grades: 'Grade 6 through Grade 10',
    headmaster: 'Mrs. Meenakshi Sunder (Academic Vice Principal)',
    totalStudents: 240,
    totalStaff: 22
  },
  {
    id: 'HIGHER_SECONDARY',
    label: '🎓 Higher Secondary Wing (Grades 11 & 12)',
    icon: '🎓',
    grades: 'Grades 11 & 12 (Science, Commerce, Arts)',
    headmaster: 'Dr. Ramesh Sundaram (Senior Principal)',
    totalStudents: 120,
    totalStaff: 16
  }
];

// Kindergarten Sections Data
interface KGSection {
  id: string;
  grade: 'Pre-KG' | 'LKG' | 'UKG';
  name: string;
  room: string;
  ageGroup: string;
  enrolled: number;
  capacity: number;
  leadTeacher: string;
  assistantTeacher: string;
  caregiverAyah: string;
  theme: string;
}

const DEMO_KG_SECTIONS: KGSection[] = [
  {
    id: 'SEC-KG-01',
    grade: 'Pre-KG',
    name: 'Little Stars (Pre-KG A)',
    room: 'Toddler Care Suite 101',
    ageGroup: '2.5 - 3.5 yrs',
    enrolled: 12,
    capacity: 15,
    leadTeacher: 'Mrs. Devaki Raman (ECCE)',
    assistantTeacher: 'Ms. Keerthana R',
    caregiverAyah: 'Amudha Amma (Lead Ayah)',
    theme: 'Sensory Sand & Water Play, Finger Painting'
  },
  {
    id: 'SEC-KG-02',
    grade: 'LKG',
    name: 'Sunshine Explorers (LKG B)',
    room: 'Activity Hall 102',
    ageGroup: '3.5 - 4.5 yrs',
    enrolled: 16,
    capacity: 18,
    leadTeacher: 'Ms. Keerthana R',
    assistantTeacher: 'Ms. Sneha V',
    caregiverAyah: 'Lakshmi Amma',
    theme: 'Phonics Rhymes, Shapes & Color Sorting'
  },
  {
    id: 'SEC-KG-03',
    grade: 'UKG',
    name: 'Butterflies (UKG A)',
    room: 'Discovery Classroom 104',
    ageGroup: '4.5 - 5.5 yrs',
    enrolled: 18,
    capacity: 20,
    leadTeacher: 'Mrs. Radhika Iyer',
    assistantTeacher: 'Ms. Meena K',
    caregiverAyah: 'Parvathi Amma',
    theme: 'Early Literacy, Sight Words & Nature Safari'
  }
];

// Toddler Daily Care & Routine
interface ToddlerTracker {
  id: string;
  name: string;
  section: string;
  photoUrl: string;
  morningSnack: 'Ate All' | 'Ate Half' | 'Picky / Skipped';
  lunch: 'Ate All' | 'Ate Half' | 'Picky / Skipped';
  afternoonSnack: 'Ate All' | 'Ate Half' | 'Picky / Skipped';
  napStatus: 'Sound Asleep' | 'Resting Quietly' | 'Restless' | 'Awake & Reading';
  napMinutes: number;
  mood: 'Very Happy' | 'Playful' | 'A Bit Shy' | 'Cried at Morning Drop';
  sensoryActivity: string;
  toiletIndependence: 'Fully Independent' | 'Assisted by Ayah' | 'Accident Handled Calmly';
  pickupGuardian: string;
  pickupRfid: string;
  pickupRelation: string;
  pickupStatus: 'Verified & Departed' | 'Authorized Guardian Arrived' | 'Awaiting Pickup in Daycare';
  allergyAlert?: string;
  teacherNote: string;
}

const DEMO_TODDLERS: ToddlerTracker[] = [
  {
    id: 'KG-2026-001',
    name: 'Aarav Sharma',
    section: 'Butterflies (UKG A)',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    morningSnack: 'Ate All',
    lunch: 'Ate All',
    afternoonSnack: 'Ate All',
    napStatus: 'Sound Asleep',
    napMinutes: 75,
    mood: 'Very Happy',
    sensoryActivity: 'Finger painting butterflies & playdough alphabet shapes',
    toiletIndependence: 'Fully Independent',
    pickupGuardian: 'Rajesh Sharma',
    pickupRfid: 'RFID-KG-9841',
    pickupRelation: 'Father (Verified Pickup Card)',
    pickupStatus: 'Awaiting Pickup in Daycare',
    allergyAlert: undefined,
    teacherNote: 'Aarav enthusiastically sang the nursery rhyme and helped his classmates put away crayons neatly!'
  },
  {
    id: 'KG-2026-002',
    name: 'Ananya Nair',
    section: 'Little Stars (Pre-KG A)',
    photoUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=200&auto=format&fit=crop&q=80',
    morningSnack: 'Ate Half',
    lunch: 'Ate All',
    afternoonSnack: 'Ate All',
    napStatus: 'Sound Asleep',
    napMinutes: 90,
    mood: 'Playful',
    sensoryActivity: 'Warm water basin splash & soft textured toy matching',
    toiletIndependence: 'Assisted by Ayah',
    pickupGuardian: 'Meera Nair',
    pickupRfid: 'RFID-KG-3320',
    pickupRelation: 'Mother (Primary Guardian)',
    pickupStatus: 'Authorized Guardian Arrived',
    allergyAlert: 'Mild Lactose Sensitivity',
    teacherNote: 'Ananya enjoyed listening to puppet storytime and took a very peaceful afternoon nap.'
  },
  {
    id: 'KG-2026-003',
    name: 'Kabir Verma',
    section: 'Sunshine Explorers (LKG B)',
    photoUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&auto=format&fit=crop&q=80',
    morningSnack: 'Ate All',
    lunch: 'Ate Half',
    afternoonSnack: 'Picky / Skipped',
    napStatus: 'Resting Quietly',
    napMinutes: 50,
    mood: 'A Bit Shy',
    sensoryActivity: 'Wooden block castle building & color sorting beads',
    toiletIndependence: 'Fully Independent',
    pickupGuardian: 'Sunil Verma',
    pickupRfid: 'RFID-KG-5512',
    pickupRelation: 'Father (Verified Pickup Card)',
    pickupStatus: 'Verified & Departed',
    allergyAlert: undefined,
    teacherNote: 'Built an impressive 10-block tower with peer cooperation. Great hand-eye coordination.'
  },
  {
    id: 'KG-2026-004',
    name: 'Riya Sen',
    section: 'Butterflies (UKG A)',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    morningSnack: 'Ate All',
    lunch: 'Ate All',
    afternoonSnack: 'Ate Half',
    napStatus: 'Sound Asleep',
    napMinutes: 65,
    mood: 'Playful',
    sensoryActivity: 'Rainbow rice sensory bin & alphabet tracing',
    toiletIndependence: 'Fully Independent',
    pickupGuardian: 'Pooja Sen',
    pickupRfid: 'RFID-KG-1129',
    pickupRelation: 'Mother',
    pickupStatus: 'Awaiting Pickup in Daycare',
    allergyAlert: undefined,
    teacherNote: 'Very excited about tomorrow’s splash activity.'
  },
  {
    id: 'KG-2026-005',
    name: 'Vivaan Patel',
    section: 'Little Stars (Pre-KG A)',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    morningSnack: 'Picky / Skipped',
    lunch: 'Picky / Skipped',
    afternoonSnack: 'Picky / Skipped',
    napStatus: 'Restless',
    napMinutes: 30,
    mood: 'Cried at Morning Drop',
    sensoryActivity: 'Soft plush animal soothing',
    toiletIndependence: 'Assisted by Ayah',
    pickupGuardian: 'Kunal Patel',
    pickupRfid: 'RFID-KG-7711',
    pickupRelation: 'Father',
    pickupStatus: 'Verified & Departed',
    allergyAlert: 'Peanut Alert',
    teacherNote: 'Mild cold today; comforted by Ayah Amudha.'
  }
];

// 📋 Attendance Record Interface
interface ToddlerAttendance {
  studentId: string;
  name: string;
  rollNumber: string;
  section: string;
  photoUrl: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  arrivalTime: string;
  dropOffMethod: 'Parent Drop-off' | 'School Bus' | 'School Van' | 'Ayah Escort';
  guardianName: string;
  guardianPhone: string;
  remarks: string;
  alertSent: boolean;
}

const DEMO_ATTENDANCE: ToddlerAttendance[] = [
  {
    studentId: 'KG-2026-001',
    name: 'Aarav Sharma',
    rollNumber: '01',
    section: 'Butterflies (UKG A)',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    status: 'PRESENT',
    arrivalTime: '08:25 AM',
    dropOffMethod: 'Parent Drop-off',
    guardianName: 'Rajesh Sharma (Father)',
    guardianPhone: '+91 98401 23456',
    remarks: 'Arrived smiling; enthusiastically put bag in cubby.',
    alertSent: true
  },
  {
    studentId: 'KG-2026-002',
    name: 'Ananya Nair',
    rollNumber: '02',
    section: 'Little Stars (Pre-KG A)',
    photoUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=200&auto=format&fit=crop&q=80',
    status: 'PRESENT',
    arrivalTime: '08:40 AM',
    dropOffMethod: 'Parent Drop-off',
    guardianName: 'Meera Nair (Mother)',
    guardianPhone: '+91 98402 34567',
    remarks: 'Carried small water bottle; calm morning drop.',
    alertSent: true
  },
  {
    studentId: 'KG-2026-003',
    name: 'Kabir Verma',
    rollNumber: '03',
    section: 'Sunshine Explorers (LKG B)',
    photoUrl: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=200&auto=format&fit=crop&q=80',
    status: 'PRESENT',
    arrivalTime: '08:35 AM',
    dropOffMethod: 'School Van',
    guardianName: 'Sunil Verma (Father)',
    guardianPhone: '+91 98403 45678',
    remarks: 'Escorted safely from Van #2 by Ayah Amudha.',
    alertSent: true
  },
  {
    studentId: 'KG-2026-004',
    name: 'Riya Sen',
    rollNumber: '04',
    section: 'Butterflies (UKG A)',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    status: 'LATE',
    arrivalTime: '09:15 AM',
    dropOffMethod: 'Parent Drop-off',
    guardianName: 'Pooja Sen (Mother)',
    guardianPhone: '+91 98404 56789',
    remarks: 'Traffic delay; joined circle time nicely.',
    alertSent: true
  },
  {
    studentId: 'KG-2026-005',
    name: 'Vivaan Patel',
    rollNumber: '05',
    section: 'Little Stars (Pre-KG A)',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    status: 'ABSENT',
    arrivalTime: '-',
    dropOffMethod: 'Parent Drop-off',
    guardianName: 'Kunal Patel (Father)',
    guardianPhone: '+91 98405 67890',
    remarks: 'Mild fever; resting at home under pediatric advice.',
    alertSent: true
  },
  {
    studentId: 'KG-2026-006',
    name: 'Diya Krishnan',
    rollNumber: '06',
    section: 'Sunshine Explorers (LKG B)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    status: 'HALF_DAY',
    arrivalTime: '08:30 AM',
    dropOffMethod: 'Parent Drop-off',
    guardianName: 'Suresh Krishnan (Father)',
    guardianPhone: '+91 98406 78901',
    remarks: 'Family event; afternoon pickup scheduled at 12:30 PM.',
    alertSent: true
  }
];

// 💬 Parent Chat Interface
interface ChatMessage {
  id: string;
  teacherId: string;
  sender: 'parent' | 'teacher';
  senderName: string;
  text: string;
  timestamp: string;
}

interface ParentContact {
  id: string;
  teacherId: string;
  parentName: string;
  relation: string;
  childName: string;
  studentId: string;
  section: string;
  phone: string;
  email: string;
  avatar: string;
  online: boolean;
  unread: number;
}

const DEMO_PARENT_CONTACTS: ParentContact[] = [
  {
    id: 'p-01',
    teacherId: 'tch-kg-01',
    parentName: 'Rajesh Sharma',
    relation: 'Father',
    childName: 'Aarav Sharma',
    studentId: 'KG-2026-001',
    section: 'Butterflies (UKG A)',
    phone: '+91 98401 23456',
    email: 'kg.parent@ficschool.edu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    online: true,
    unread: 0
  },
  {
    id: 'p-02',
    teacherId: 'tch-kg-02',
    parentName: 'Meera Nair',
    relation: 'Mother',
    childName: 'Ananya Nair',
    studentId: 'KG-2026-002',
    section: 'Little Stars (Pre-KG A)',
    phone: '+91 98402 34567',
    email: 'meera.nair@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    online: true,
    unread: 1
  },
  {
    id: 'p-03',
    teacherId: 'tch-kg-03',
    parentName: 'Sunil Verma',
    relation: 'Father',
    childName: 'Kabir Verma',
    studentId: 'KG-2026-003',
    section: 'Sunshine Explorers (LKG B)',
    phone: '+91 98403 45678',
    email: 'sunil.v@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    online: false,
    unread: 0
  }
];

// 📢 Announcements Interface
interface KGAnnouncement {
  id: string;
  title: string;
  category: 'EVENT' | 'HOLIDAY' | 'HEALTH_SAFETY' | 'GENERAL';
  targetGrade: 'All Kindergarten' | 'Pre-KG' | 'LKG' | 'UKG';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  eventDate?: string;
  createdAt: string;
  author: string;
  content: string;
  isBroadcasted: boolean;
}

const DEMO_ANNOUNCEMENTS: KGAnnouncement[] = [
  {
    id: 'kga-01',
    title: 'Preschool Annual Splash & Sports Day 2026',
    category: 'EVENT',
    targetGrade: 'All Kindergarten',
    priority: 'HIGH',
    eventDate: 'Nov 15, 2026',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    author: 'Mrs. Devaki Raman (Lead Educator)',
    content: 'Dear Parents, we are thrilled to host our annual Early Childhood Splash & Sports Fiesta! Toddlers will enjoy water balloon catch, mini hurdle hop, and obstacle crawling. Please send an extra labeled towel and dry clothes.',
    isBroadcasted: true
  },
  {
    id: 'kga-02',
    title: 'Rainbow Fruit Salad Day - Sensory Nutrition Activity',
    category: 'EVENT',
    targetGrade: 'Pre-KG',
    priority: 'NORMAL',
    eventDate: 'Nov 04, 2026',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    author: 'Ms. Keerthana R',
    content: 'To encourage wholesome eating habits, please pack one washed and peeled fruit (apple slice, banana, or seedless grapes). Children will identify colors and make a shared healthy fruit bowl!',
    isBroadcasted: true
  },
  {
    id: 'kga-03',
    title: 'Early Childhood Pediatric Wellness & Dental Checkup',
    category: 'HEALTH_SAFETY',
    targetGrade: 'All Kindergarten',
    priority: 'URGENT',
    eventDate: 'Nov 08, 2026',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    author: 'Mrs. Devaki Raman (Lead Educator)',
    content: 'Campus pediatrician Dr. Shanthi will conduct height, weight, ENT, vision, and dental examinations. Digital wellness cards will be available in your Parent Portal Documents vault.',
    isBroadcasted: true
  },
  {
    id: 'kga-04',
    title: 'Deepavali Festival Early Release & Holiday Notice',
    category: 'HOLIDAY',
    targetGrade: 'All Kindergarten',
    priority: 'NORMAL',
    eventDate: 'Oct 31, 2026',
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    author: 'Early Years Administration',
    content: 'Early Years classes will adjourn at 12:30 PM on Thursday for Deepavali festivities. Daycare pickup commences at 12:45 PM. School reopens on Monday morning as usual.',
    isBroadcasted: true
  }
];

export const KindergartenDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Wing Selector (Kindergarten, Primary, Secondary, Higher Secondary)
  const [selectedWing, setSelectedWing] = useState<EducationalWing>('KINDERGARTEN');

  // Tabs Mapping
  const TAB_KEYS = [
    'overview',
    'attendance',
    'chat',
    'announcements',
    'meals',
    'milestones',
    'dismissal',
    'sections',
    'staff'
  ];

  const currentTabParam = searchParams.get('tab') || 'overview';
  const initialTabIndex = Math.max(0, TAB_KEYS.indexOf(currentTabParam));
  const [activeTab, setActiveTab] = useState<number>(initialTabIndex);

  useEffect(() => {
    const tabParam = searchParams.get('tab') || 'overview';
    const idx = TAB_KEYS.indexOf(tabParam);
    if (idx !== -1 && idx !== activeTab) {
      setActiveTab(idx);
    }
  }, [searchParams]);

  const handleTabChange = (newVal: number) => {
    setActiveTab(newVal);
    setSearchParams({ tab: TAB_KEYS[newVal] });
  };

  // 1. Sections State with localStorage
  const [sections, setSections] = useState<KGSection[]>(() => {
    try {
      const saved = localStorage.getItem('school_erp_kg_sections');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_KG_SECTIONS;
  });
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('ALL');

  // 2. Toddler Trackers State with localStorage
  const [toddlers, setToddlers] = useState<ToddlerTracker[]>(() => {
    try {
      const saved = localStorage.getItem('school_erp_kg_toddlers');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_TODDLERS;
  });

  // 3. Attendance State with localStorage
  const [todayDate, setTodayDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [attendanceList, setAttendanceList] = useState<ToddlerAttendance[]>(() => {
    try {
      const saved = localStorage.getItem('school_erp_kg_attendance');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_ATTENDANCE;
  });
  const [attendanceSectionFilter, setAttendanceSectionFilter] = useState<string>('ALL');

  // 4. Parent Chat State with localStorage & cross-tab sync
  const [selectedChatContactId, setSelectedChatContactId] = useState<string>('p-01');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    try {
      const saved = localStorage.getItem('school_erp_kg_parent_chat');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
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
      'tch-kg-02': [
        {
          id: 'm-kg-201',
          teacherId: 'tch-kg-02',
          sender: 'parent',
          senderName: 'Meera Nair (Parent)',
          text: 'Hello teacher, Ananya has a slight lactose allergy, please monitor her morning milkshake.',
          timestamp: 'Today, 08:15 AM'
        },
        {
          id: 'm-kg-202',
          teacherId: 'tch-kg-02',
          sender: 'teacher',
          senderName: 'Mrs. Devaki Raman',
          text: 'Noted Meera ji! We served her warm almond coconut milk instead. She enjoyed it thoroughly.',
          timestamp: 'Today, 09:20 AM'
        }
      ],
      'tch-kg-03': [
        {
          id: 'm-kg-301',
          teacherId: 'tch-kg-03',
          sender: 'parent',
          senderName: 'Sunil Verma (Parent)',
          text: 'Good morning, will Kabir be boarding Van #2 for the return drop today?',
          timestamp: 'Today, 08:00 AM'
        },
        {
          id: 'm-kg-302',
          teacherId: 'tch-kg-03',
          sender: 'teacher',
          senderName: 'Mrs. Devaki Raman',
          text: 'Yes, Sunil ji! Ayah Amudha is assigned as his bus monitor. He will depart at 02:30 PM.',
          timestamp: 'Today, 08:30 AM'
        }
      ]
    };
  });
  const [chatInputText, setChatInputText] = useState('');
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // 5. Announcements State with localStorage
  const [announcements, setAnnouncements] = useState<KGAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem('school_erp_kg_announcements');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEMO_ANNOUNCEMENTS;
  });
  const [announcementCategoryFilter, setAnnouncementCategoryFilter] = useState<string>('ALL');
  const [isAddAnnouncementOpen, setIsAddAnnouncementOpen] = useState(false);
  const [newAnnouncementForm, setNewAnnouncementForm] = useState({
    title: '',
    category: 'EVENT' as 'EVENT' | 'HOLIDAY' | 'HEALTH_SAFETY' | 'GENERAL',
    targetGrade: 'All Kindergarten' as 'All Kindergarten' | 'Pre-KG' | 'LKG' | 'UKG',
    priority: 'NORMAL' as 'NORMAL' | 'HIGH' | 'URGENT',
    eventDate: '',
    content: ''
  });

  // Cross-tab sync for chat and announcements
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'school_erp_kg_parent_chat' && e.newValue) {
        try {
          setChatMessages(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'school_erp_kg_announcements' && e.newValue) {
        try {
          setAnnouncements(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'school_erp_kg_attendance' && e.newValue) {
        try {
          setAttendanceList(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sync state updaters
  const updateSections = (newSections: KGSection[] | ((prev: KGSection[]) => KGSection[])) => {
    setSections(prev => {
      const res = typeof newSections === 'function' ? newSections(prev) : newSections;
      localStorage.setItem('school_erp_kg_sections', JSON.stringify(res));
      return res;
    });
  };

  const updateToddlers = (newToddlers: ToddlerTracker[] | ((prev: ToddlerTracker[]) => ToddlerTracker[])) => {
    setToddlers(prev => {
      const res = typeof newToddlers === 'function' ? newToddlers(prev) : newToddlers;
      localStorage.setItem('school_erp_kg_toddlers', JSON.stringify(res));
      return res;
    });
  };

  const updateAttendance = (newAttendance: ToddlerAttendance[] | ((prev: ToddlerAttendance[]) => ToddlerAttendance[])) => {
    setAttendanceList(prev => {
      const res = typeof newAttendance === 'function' ? newAttendance(prev) : newAttendance;
      localStorage.setItem('school_erp_kg_attendance', JSON.stringify(res));
      return res;
    });
  };

  const updateChatMessages = (newMessages: Record<string, ChatMessage[]> | ((prev: Record<string, ChatMessage[]>) => Record<string, ChatMessage[]>)) => {
    setChatMessages(prev => {
      const res = typeof newMessages === 'function' ? newMessages(prev) : newMessages;
      localStorage.setItem('school_erp_kg_parent_chat', JSON.stringify(res));
      return res;
    });
  };

  const updateAnnouncements = (newAnnouncements: KGAnnouncement[] | ((prev: KGAnnouncement[]) => KGAnnouncement[])) => {
    setAnnouncements(prev => {
      const res = typeof newAnnouncements === 'function' ? newAnnouncements(prev) : newAnnouncements;
      localStorage.setItem('school_erp_kg_announcements', JSON.stringify(res));
      return res;
    });
  };

  // Modals State
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSectionForm, setNewSectionForm] = useState({
    grade: 'Pre-KG' as 'Pre-KG' | 'LKG' | 'UKG',
    name: '',
    room: 'Toddler Care Room 105',
    capacity: 15,
    leadTeacher: 'Mrs. Devaki Raman (ECCE)',
    assistantTeacher: 'Ms. Keerthana R',
    caregiverAyah: 'Amudha Amma',
    theme: 'Sensory Exploration & Music Rhymes'
  });

  const [isAddToddlerOpen, setIsAddToddlerOpen] = useState(false);
  const [newToddlerForm, setNewToddlerForm] = useState({
    id: `KG-2026-${String(toddlers.length + 1).padStart(3, '0')}`,
    name: '',
    section: 'Butterflies (UKG A)',
    morningSnack: 'Ate All' as 'Ate All' | 'Ate Half' | 'Picky / Skipped',
    lunch: 'Ate All' as 'Ate All' | 'Ate Half' | 'Picky / Skipped',
    napStatus: 'Sound Asleep' as 'Sound Asleep' | 'Resting Quietly' | 'Restless' | 'Awake & Reading',
    napMinutes: 60,
    mood: 'Very Happy' as 'Very Happy' | 'Playful' | 'A Bit Shy' | 'Cried at Morning Drop',
    sensoryActivity: 'Finger painting & clay modelling',
    toiletIndependence: 'Fully Independent' as 'Fully Independent' | 'Assisted by Ayah' | 'Accident Handled Calmly',
    pickupGuardian: '',
    pickupRelation: 'Father',
    pickupRfid: `RFID-KG-${Math.floor(1000 + Math.random() * 9000)}`,
    teacherNote: 'Very active and happy participation in circle time today.'
  });

  const [selectedToddlerForSlip, setSelectedToddlerForSlip] = useState<ToddlerTracker | null>(null);
  const [isSlipOpen, setIsSlipOpen] = useState<boolean>(false);

  const [isAllocationOpen, setIsAllocationOpen] = useState<boolean>(false);
  const [allocationForm, setAllocationForm] = useState({
    wing: 'KINDERGARTEN',
    grade: 'Pre-KG',
    sectionName: 'Little Stars (Section A)',
    leadTeacher: 'Ms. Keerthana R. (Montessori Dip.)',
    assistantTeacher: 'Ms. Sneha V.',
    caregiverAyah: 'Amudha Amma (Lead Ayah)',
    shiftTiming: 'Full Day (8:00 AM - 3:30 PM)'
  });

  const activeWingMeta = WINGS_CONFIG.find(w => w.id === selectedWing)!;

  // Operational metrics
  const totalEnrolled = attendanceList.length;
  const presentCount = attendanceList.filter(a => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'HALF_DAY').length;
  const absentCount = attendanceList.filter(a => a.status === 'ABSENT').length;
  const lateCount = attendanceList.filter(a => a.status === 'LATE').length;
  const halfDayCount = attendanceList.filter(a => a.status === 'HALF_DAY').length;
  const attendancePct = totalEnrolled > 0 ? Math.round((presentCount / totalEnrolled) * 100) : 0;

  const fullMealsAte = toddlers.filter(t => t.lunch === 'Ate All').length;
  const soundSleepers = toddlers.filter(t => t.napStatus === 'Sound Asleep' || t.napStatus === 'Resting Quietly').length;
  const departedCount = toddlers.filter(t => t.pickupStatus === 'Verified & Departed').length;

  // Active chat contact & messages
  const activeChatContact = DEMO_PARENT_CONTACTS.find(p => p.id === selectedChatContactId) || DEMO_PARENT_CONTACTS[0];
  const activeChatThread = chatMessages[activeChatContact.teacherId] || [];

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatThread.length, selectedChatContactId]);

  // Handle Attendance status toggle
  const handleSetAttendanceStatus = (studentId: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY') => {
    updateAttendance(prev => prev.map(item => {
      if (item.studentId === studentId) {
        return {
          ...item,
          status: newStatus,
          arrivalTime: newStatus === 'ABSENT' ? '-' : (item.arrivalTime === '-' ? '08:30 AM' : item.arrivalTime)
        };
      }
      return item;
    }));
  };

  const handleMarkAllPresent = () => {
    updateAttendance(prev => prev.map(item => ({
      ...item,
      status: 'PRESENT',
      arrivalTime: item.arrivalTime === '-' ? '08:30 AM' : item.arrivalTime
    })));
  };

  const handleResetAttendance = () => {
    updateAttendance(DEMO_ATTENDANCE);
  };

  // Handle Send Chat Message
  const handleSendChatMessage = (textToSend?: string) => {
    const text = (textToSend || chatInputText).trim();
    if (!text) return;
    setChatInputText('');

    const newMsg: ChatMessage = {
      id: `TMSG-${Date.now()}`,
      teacherId: activeChatContact.teacherId,
      sender: 'teacher',
      senderName: 'Mrs. Devaki Raman (Educator)',
      text,
      timestamp: 'Just now'
    };

    updateChatMessages(prev => ({
      ...prev,
      [activeChatContact.teacherId]: [...(prev[activeChatContact.teacherId] || []), newMsg]
    }));

    // Realistic auto-reply simulation for demo if tested in single tab
    setTimeout(() => {
      const parentReplies: Record<string, string[]> = {
        'tch-kg-01': [
          'Thank you Mrs. Devaki! So glad to hear Aarav is participating nicely. We will see you at 3:00 PM pickup.',
          'Noted teacher! Rajesh will pick up Aarav with his RFID card today.',
          'Thank you for the update! We have packed his favorite storybook in his bag.'
        ],
        'tch-kg-02': [
          'Thank you for looking after Ananya so attentively!',
          'Understood, thank you for confirming her milk and snack schedule.'
        ],
        'tch-kg-03': [
          'Thank you teacher! I will be waiting at the van stop #2.'
        ]
      };
      const pool = parentReplies[activeChatContact.teacherId] || ['Thank you for the update!'];
      const randomReply = pool[Math.floor(Math.random() * pool.length)];

      const replyMsg: ChatMessage = {
        id: `PMSG-${Date.now()}`,
        teacherId: activeChatContact.teacherId,
        sender: 'parent',
        senderName: `${activeChatContact.parentName} (${activeChatContact.relation})`,
        text: randomReply,
        timestamp: 'Just now'
      };

      updateChatMessages(prev => ({
        ...prev,
        [activeChatContact.teacherId]: [...(prev[activeChatContact.teacherId] || []), replyMsg]
      }));
    }, 2000);
  };

  // Handle Create Announcement
  const handleCreateAnnouncement = () => {
    if (!newAnnouncementForm.title || !newAnnouncementForm.content) return;
    const newNotice: KGAnnouncement = {
      id: `kga-${Date.now()}`,
      title: newAnnouncementForm.title,
      category: newAnnouncementForm.category,
      targetGrade: newAnnouncementForm.targetGrade,
      priority: newAnnouncementForm.priority,
      eventDate: newAnnouncementForm.eventDate || undefined,
      createdAt: new Date().toISOString(),
      author: 'Mrs. Devaki Raman (Lead Educator)',
      content: newAnnouncementForm.content,
      isBroadcasted: true
    };

    updateAnnouncements(prev => [newNotice, ...prev]);
    setIsAddAnnouncementOpen(false);
    setNewAnnouncementForm({
      title: '',
      category: 'EVENT',
      targetGrade: 'All Kindergarten',
      priority: 'NORMAL',
      eventDate: '',
      content: ''
    });
  };

  const handleDeleteAnnouncement = (id: string) => {
    updateAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  // Canned preschool replies
  const CANNED_REPLIES = [
    '🥣 Finished all warm lunch & healthy fruit today.',
    '🛏️ Took a peaceful 75-minute nap on designated cot.',
    '🎨 Very active and happy during sensory table play!',
    '👕 Please send an extra labeled change of clothes tomorrow.',
    '📢 Kindly check the new circular on the Parent Notice Board.',
    '💧 Completed his full water bottle during outdoor play.'
  ];

  const handleOpenSlip = (toddler: ToddlerTracker) => {
    setSelectedToddlerForSlip(toddler);
    setIsSlipOpen(true);
  };

  const handleSaveAllocation = () => {
    if (allocationForm.wing === 'KINDERGARTEN') {
      updateSections(prev => {
        const found = prev.some(s => s.name.includes(allocationForm.sectionName) || s.grade === allocationForm.grade);
        if (found) {
          return prev.map(s => {
            if (s.name.includes(allocationForm.sectionName) || s.grade === allocationForm.grade) {
              return {
                ...s,
                leadTeacher: allocationForm.leadTeacher,
                assistantTeacher: allocationForm.assistantTeacher,
                caregiverAyah: allocationForm.caregiverAyah
              };
            }
            return s;
          });
        }
        return [
          ...prev,
          {
            id: `SEC-KG-${Date.now().toString().slice(-4)}`,
            grade: (allocationForm.grade as any) || 'Pre-KG',
            name: allocationForm.sectionName || `${allocationForm.grade} Section`,
            room: 'Toddler Room',
            ageGroup: allocationForm.grade === 'Pre-KG' ? '2.5 - 3.5 yrs' : allocationForm.grade === 'LKG' ? '3.5 - 4.5 yrs' : '4.5 - 5.5 yrs',
            enrolled: 1,
            capacity: 18,
            leadTeacher: allocationForm.leadTeacher,
            assistantTeacher: allocationForm.assistantTeacher,
            caregiverAyah: allocationForm.caregiverAyah,
            theme: 'Early Childhood Development'
          }
        ];
      });
    }
    setIsAllocationOpen(false);
  };

  const handleCreateSection = () => {
    if (!newSectionForm.name) return;
    const newSec: KGSection = {
      id: `SEC-KG-${Date.now().toString().slice(-4)}`,
      grade: newSectionForm.grade,
      name: newSectionForm.name,
      room: newSectionForm.room,
      ageGroup: newSectionForm.grade === 'Pre-KG' ? '2.5 - 3.5 yrs' : newSectionForm.grade === 'LKG' ? '3.5 - 4.5 yrs' : '4.5 - 5.5 yrs',
      enrolled: 0,
      capacity: newSectionForm.capacity,
      leadTeacher: newSectionForm.leadTeacher,
      assistantTeacher: newSectionForm.assistantTeacher,
      caregiverAyah: newSectionForm.caregiverAyah,
      theme: newSectionForm.theme
    };
    updateSections(prev => [...prev, newSec]);
    setIsAddSectionOpen(false);
    setNewSectionForm({
      grade: 'Pre-KG',
      name: '',
      room: 'Toddler Care Room 105',
      capacity: 15,
      leadTeacher: 'Mrs. Devaki Raman (ECCE)',
      assistantTeacher: 'Ms. Keerthana R',
      caregiverAyah: 'Amudha Amma',
      theme: 'Sensory Exploration & Music Rhymes'
    });
  };

  const handleCreateToddler = () => {
    if (!newToddlerForm.name) return;
    const newT: ToddlerTracker = {
      id: newToddlerForm.id || `KG-2026-${String(toddlers.length + 1).padStart(3, '0')}`,
      name: newToddlerForm.name,
      section: newToddlerForm.section,
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
      morningSnack: newToddlerForm.morningSnack,
      lunch: newToddlerForm.lunch,
      afternoonSnack: 'Ate All',
      napStatus: newToddlerForm.napStatus,
      napMinutes: Number(newToddlerForm.napMinutes) || 60,
      mood: newToddlerForm.mood,
      sensoryActivity: newToddlerForm.sensoryActivity,
      toiletIndependence: newToddlerForm.toiletIndependence,
      pickupGuardian: newToddlerForm.pickupGuardian || 'Parent / Guardian',
      pickupRfid: newToddlerForm.pickupRfid,
      pickupRelation: newToddlerForm.pickupRelation,
      pickupStatus: 'Awaiting Pickup in Daycare',
      teacherNote: newToddlerForm.teacherNote
    };
    updateToddlers(prev => [newT, ...prev]);
    setIsAddToddlerOpen(false);
  };

  const handleLoadDemoRoster = () => {
    updateSections(DEMO_KG_SECTIONS);
    updateToddlers(DEMO_TODDLERS);
    updateAttendance(DEMO_ATTENDANCE);
    updateAnnouncements(DEMO_ANNOUNCEMENTS);
  };

  const handleClearRoster = () => {
    updateSections([]);
    updateToddlers([]);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1440, margin: '0 auto' }}>
      {/* ─── Top Educational Wing & Command Center Header ─── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.5 },
          mb: 3,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 3,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#ec4899', width: 56, height: 56, fontSize: '1.9rem', boxShadow: '0 4px 10px rgba(236, 72, 153, 0.25)' }}>
                {activeWingMeta.icon}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    {selectedWing === 'KINDERGARTEN' ? 'Kindergarten & Early Childhood Command Center' : `${activeWingMeta.label} Overview`}
                  </Typography>
                  <Chip
                    size="small"
                    label={activeWingMeta.grades}
                    sx={{ bgcolor: '#fdf2f8', color: '#db2777', fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Lead Supervisor: <b>{activeWingMeta.headmaster}</b> • Total Enrolled: <b>{activeWingMeta.totalStudents} Toddlers</b> • Staff & Ayahs: <b>{activeWingMeta.totalStaff}</b>
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Wing Selector & Quick Actions Toolbar */}
          <Grid size={{ xs: 12, lg: 6 }}>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, flexWrap: 'wrap' }}>
              <Box sx={{ minWidth: 260, flexGrow: { xs: 1, sm: 0 } }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={selectedWing}
                  onChange={(e) => setSelectedWing(e.target.value as EducationalWing)}
                  sx={{
                    bgcolor: '#f8fafc',
                    '& .MuiSelect-select': { fontWeight: 700, py: 1 }
                  }}
                >
                  {WINGS_CONFIG.map(w => (
                    <MenuItem key={w.id} value={w.id} sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <span>{w.icon}</span>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{w.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<AssignmentIndIcon />}
                onClick={() => {
                  setAllocationForm(prev => ({ ...prev, wing: selectedWing }));
                  setIsAllocationOpen(true);
                }}
                sx={{ height: 40, fontWeight: 700, borderRadius: 2, textTransform: 'none', px: 2 }}
              >
                Allocate Staff
              </Button>

              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={<VolunteerActivismIcon />}
                onClick={handleLoadDemoRoster}
                sx={{ height: 40, fontWeight: 700, borderRadius: 2, textTransform: 'none', px: 2 }}
              >
                Load Roster
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                size="small"
                onClick={handleClearRoster}
                sx={{ height: 40, fontWeight: 600, borderRadius: 2, color: 'text.secondary', textTransform: 'none' }}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* ─── Non-Kindergarten Wing Fallback View ─── */}
      {selectedWing !== 'KINDERGARTEN' ? (
        <Card sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
          <Box sx={{ maxWidth: 800 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#1e293b' }}>
              {activeWingMeta.label} - Academic Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              This wing covers {activeWingMeta.grades}. Curriculum pacing, grade-wise class teacher allocation, term syllabus pacing, and exam schedules are managed here.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">TOTAL ENROLLED</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 0.5 }}>
                    {activeWingMeta.totalStudents}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">FACULTY & STAFF</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#10b981', mt: 0.5 }}>
                    {activeWingMeta.totalStaff}
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Paper sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">COORDINATOR / HOD</Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.5 }}>
                    {activeWingMeta.headmaster}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => setSelectedWing('KINDERGARTEN')}
                startIcon={<ChildCareIcon />}
                sx={{ fontWeight: 700 }}
              >
                Return to Kindergarten View
              </Button>
            </Box>
          </Box>
        </Card>
      ) : (
        /* ─── Specialized Kindergarten Command Center ─── */
        <>
          {/* Quick Pre-Primary Operational Stats (5 Cleanly Aligned Cards) */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Card 1: Attendance */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <Card sx={{ bgcolor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 2.5, height: '100%' }}>
                <CardContent sx={{ p: 2.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#e11d48', textTransform: 'uppercase' }}>
                        Toddlers Present
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#9f1239', mt: 0.5 }}>
                        {presentCount} <Typography component="span" variant="body2" sx={{ color: '#e11d48' }}>/ {totalEnrolled}</Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{attendancePct}% Attendance Rate</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f43f5e', width: 44, height: 44 }}>
                      <EventAvailableIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 2: Meals & Lunch */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <Card sx={{ bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 2.5, height: '100%' }}>
                <CardContent sx={{ p: 2.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>
                        Meals & Lunch
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#92400e', mt: 0.5 }}>
                        {fullMealsAte} <Typography component="span" variant="body2" sx={{ color: '#d97706' }}>/ {toddlers.length}</Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Finished Warm Lunch</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#f59e0b', width: 44, height: 44 }}>
                      <RestaurantIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 3: Nap Routine */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <Card sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 2.5, height: '100%' }}>
                <CardContent sx={{ p: 2.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                        Nap Time Rested
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#14532d', mt: 0.5 }}>
                        {soundSleepers} <Typography component="span" variant="body2" sx={{ color: '#16a34a' }}>/ {toddlers.length}</Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Rest Routine Completed</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#10b981', width: 44, height: 44 }}>
                      <BedtimeIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 4: Safe Dismissal */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <Card sx={{ bgcolor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 2.5, height: '100%' }}>
                <CardContent sx={{ p: 2.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                        Safe Dismissal
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#5b21b6', mt: 0.5 }}>
                        {departedCount} <Typography component="span" variant="body2" sx={{ color: '#7c3aed' }}>Handed Over</Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">RFID Cards Verified</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#8b5cf6', width: 44, height: 44 }}>
                      <VerifiedUserIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Card 5: Parent Chat & Inquiries */}
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
              <Card sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 2.5, height: '100%' }}>
                <CardContent sx={{ p: 2.2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>
                        Parent Chat Desk
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e40af', mt: 0.5 }}>
                        {DEMO_PARENT_CONTACTS.length} <Typography component="span" variant="body2" sx={{ color: '#2563eb' }}>Parents</Typography>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Direct 2-Way Messaging</Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: '#3b82f6', width: 44, height: 44 }}>
                      <ChatBubbleOutlinedIcon />
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ─── Kindergarten Tabs Navigation ─── */}
          <Paper sx={{ mb: 3, borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <Tabs
              value={activeTab}
              onChange={(_, newVal) => handleTabChange(newVal)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ px: 2, minHeight: 52 }}
            >
              <Tab icon={<ChildCareIcon />} iconPosition="start" label="1. Overview" sx={{ fontWeight: 700, textTransform: 'none' }} />
              <Tab icon={<EventAvailableIcon />} iconPosition="start" label="2. Toddler Daily Attendance" sx={{ fontWeight: 700, textTransform: 'none' }} />
              <Tab icon={<ChatBubbleOutlinedIcon />} iconPosition="start" label="3. Parent-Teacher Chat" sx={{ fontWeight: 700, textTransform: 'none' }} />
              <Tab icon={<CampaignIcon />} iconPosition="start" label="4. Announcements & Circulars" sx={{ fontWeight: 700, textTransform: 'none' }} />
              <Tab icon={<RestaurantIcon />} iconPosition="start" label="5. Meals, Naps & Routine" sx={{ fontWeight: 700, textTransform: 'none' }} />
              <Tab icon={<PaletteIcon />} iconPosition="start" label="6. Sensory & Milestones" sx={{ fontWeight: 700, textTransform: 'none' }} />
              <Tab icon={<SecurityIcon />} iconPosition="start" label="7. Safe Dismissal & Pick-Up" sx={{ fontWeight: 700, textTransform: 'none' }} />
              <Tab icon={<PeopleIcon />} iconPosition="start" label="8. Class Sections & Roster" sx={{ fontWeight: 700, textTransform: 'none' }} />
              <Tab icon={<AssignmentIndIcon />} iconPosition="start" label="9. Staff & Ayah Allocation" sx={{ fontWeight: 700, textTransform: 'none' }} />
            </Tabs>
          </Paper>

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB 0: EARLY YEARS OVERVIEW & DAILY SCHEDULE
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 0 && (
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
                    <CardHeader
                      title="Today's Early Childhood Rhythm & Schedule"
                      subheader="Reggio Emilia inspired interactive play, phonics, nap rest, and wholesome meals"
                      sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        {[
                          { time: '08:00 AM - 08:45 AM', activity: 'Toddler Morning Welcome & Free Hand Play', theme: 'Health temperature check, cubby storage, warm water sips, gentle classical lullabies.', status: 'COMPLETED', color: 'success' },
                          { time: '08:45 AM - 09:30 AM', activity: 'Sensory Sand, Clay & Finger Painting', theme: 'Sensory fine motor stimulation, color mixing, and playdough shapes.', status: 'COMPLETED', color: 'success' },
                          { time: '09:30 AM - 10:15 AM', activity: 'Morning Nutrition Snack & Fruit Bowl', theme: 'Fresh fruit slices, warm almond milk, and independent napkin wipe.', status: 'COMPLETED', color: 'success' },
                          { time: '10:15 AM - 11:30 AM', activity: 'Phonics Rhymes, Story Puppets & Circle Time', theme: 'Nursery songs, picture flashcards, and animal sound mimicry.', status: 'IN_PROGRESS', color: 'warning' },
                          { time: '11:30 AM - 12:30 PM', activity: 'Warm Balanced Lunch & Ayah Assisted Dining', theme: 'Warm vegetable khichdi, curd rice, and table etiquette training.', status: 'UPCOMING', color: 'default' },
                          { time: '12:30 PM - 02:00 PM', activity: 'Cot Nap Time & Gentle Relaxation', theme: 'Quiet nap room, dim lighting, soothing white noise, and Ayah monitoring.', status: 'UPCOMING', color: 'default' },
                          { time: '02:00 PM - 03:00 PM', activity: 'Safe Dismissal & Authorized RFID Handover', theme: 'Dual identity verification, gate card scan, and parent communication slip.', status: 'UPCOMING', color: 'default' }
                        ].map((item, idx) => (
                          <Paper key={idx} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                {idx + 1}
                              </Box>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                  {item.activity}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ⏱️ {item.time} • {item.theme}
                                </Typography>
                              </Box>
                            </Box>
                            <Chip size="small" label={item.status} color={item.color as any} sx={{ fontWeight: 700 }} />
                          </Paper>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                  {/* Quick Notice Card */}
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
                    <CardHeader
                      title="Latest Kindergarten Circular"
                      avatar={<CampaignIcon color="primary" />}
                      sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                    />
                    <CardContent sx={{ p: 2.5 }}>
                      {announcements.length > 0 ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            {announcements[0].title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', my: 1 }}>
                            Target: {announcements[0].targetGrade} • Priority: {announcements[0].priority}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {announcements[0].content}
                          </Typography>
                          <Button size="small" variant="outlined" onClick={() => handleTabChange(3)} sx={{ fontWeight: 700 }}>
                            View All Circulars
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No active circulars.</Typography>
                      )}
                    </CardContent>
                  </Card>

                  {/* Active Teacher Profile */}
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <CardHeader
                      title="Staff on Duty"
                      avatar={<BadgeIcon color="secondary" />}
                      sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                    />
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80" sx={{ width: 56, height: 56 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Mrs. Devaki Raman</Typography>
                          <Typography variant="caption" color="text.secondary">Lead Educator & ECCE Specialist</Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip size="small" color="success" label="On Duty (Suite 101)" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                          </Box>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 1.5 }} />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          📞 Emergency Contact: <b>+91 94440 12345</b>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ✉️ Email: <b>kg.staff@ficschool.edu</b>
                        </Typography>
                        <Button size="small" variant="contained" color="primary" onClick={() => handleTabChange(2)} sx={{ mt: 1, fontWeight: 700, borderRadius: 2 }}>
                          Open Parent Chat Desk
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB 1: TODDLER DAILY ATTENDANCE REGISTER
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 1 && (
            <Box>
              {/* Controls & Filter Bar */}
              <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                      <TextField
                        type="date"
                        size="small"
                        label="Attendance Date"
                        value={todayDate}
                        onChange={(e) => setTodayDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 170 }}
                      />

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {['ALL', 'Pre-KG', 'LKG', 'UKG'].map(grade => (
                          <Button
                            key={grade}
                            size="small"
                            variant={attendanceSectionFilter === grade ? 'contained' : 'outlined'}
                            onClick={() => setAttendanceSectionFilter(grade)}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                          >
                            {grade}
                          </Button>
                        ))}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 5 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<CheckIcon />}
                        onClick={handleMarkAllPresent}
                        sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                      >
                        Mark All Present
                      </Button>
                      <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={handleResetAttendance}
                        sx={{ fontWeight: 600, borderRadius: 2, color: 'text.secondary', textTransform: 'none' }}
                      >
                        Reset
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                {/* Status Counters Strip */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                    Summary for {todayDate}:
                  </Typography>
                  <Chip size="small" label={`Total: ${totalEnrolled}`} sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
                  <Chip size="small" color="success" label={`Present: ${presentCount}`} sx={{ fontWeight: 700 }} />
                  <Chip size="small" color="error" label={`Absent: ${absentCount}`} sx={{ fontWeight: 700 }} />
                  <Chip size="small" color="warning" label={`Late: ${lateCount}`} sx={{ fontWeight: 700 }} />
                  <Chip size="small" color="info" label={`Half Day: ${halfDayCount}`} sx={{ fontWeight: 700 }} />
                  <Chip size="small" label={`Rate: ${attendancePct}%`} sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 800 }} />
                </Box>
              </Paper>

              {/* Attendance Table */}
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Toddler</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Section</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Attendance Status</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Arrival Time</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Drop-off Mode</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }}>Health / Absence Notes</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#334155' }} align="center">Parent Alert</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceList
                      .filter(item => attendanceSectionFilter === 'ALL' || item.section.includes(attendanceSectionFilter))
                      .map((item) => (
                        <TableRow key={item.studentId} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar src={item.photoUrl} sx={{ width: 44, height: 44, border: '2px solid #e2e8f0' }} />
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                  {item.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {item.studentId} • Roll: {item.rollNumber}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell>
                            <Chip size="small" label={item.section} sx={{ fontWeight: 600, bgcolor: '#f1f5f9' }} />
                          </TableCell>

                          {/* Interactive Status Selector */}
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Button
                                size="small"
                                variant={item.status === 'PRESENT' ? 'contained' : 'outlined'}
                                color="success"
                                onClick={() => handleSetAttendanceStatus(item.studentId, 'PRESENT')}
                                sx={{ minWidth: 68, fontSize: '0.72rem', py: 0.4, fontWeight: 700 }}
                              >
                                Present
                              </Button>
                              <Button
                                size="small"
                                variant={item.status === 'ABSENT' ? 'contained' : 'outlined'}
                                color="error"
                                onClick={() => handleSetAttendanceStatus(item.studentId, 'ABSENT')}
                                sx={{ minWidth: 64, fontSize: '0.72rem', py: 0.4, fontWeight: 700 }}
                              >
                                Absent
                              </Button>
                              <Button
                                size="small"
                                variant={item.status === 'LATE' ? 'contained' : 'outlined'}
                                color="warning"
                                onClick={() => handleSetAttendanceStatus(item.studentId, 'LATE')}
                                sx={{ minWidth: 54, fontSize: '0.72rem', py: 0.4, fontWeight: 700 }}
                              >
                                Late
                              </Button>
                              <Button
                                size="small"
                                variant={item.status === 'HALF_DAY' ? 'contained' : 'outlined'}
                                color="info"
                                onClick={() => handleSetAttendanceStatus(item.studentId, 'HALF_DAY')}
                                sx={{ minWidth: 64, fontSize: '0.72rem', py: 0.4, fontWeight: 700 }}
                              >
                                Half
                              </Button>
                            </Box>
                          </TableCell>

                          {/* Arrival Time */}
                          <TableCell>
                            <TextField
                              size="small"
                              value={item.arrivalTime}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateAttendance(prev => prev.map(a => a.studentId === item.studentId ? { ...a, arrivalTime: val } : a));
                              }}
                              sx={{ width: 105, '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.6 } }}
                            />
                          </TableCell>

                          {/* Drop-off Mode */}
                          <TableCell>
                            <TextField
                              select
                              size="small"
                              value={item.dropOffMethod}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                updateAttendance(prev => prev.map(a => a.studentId === item.studentId ? { ...a, dropOffMethod: val } : a));
                              }}
                              sx={{ minWidth: 140, '& .MuiSelect-select': { fontSize: '0.8rem', py: 0.6 } }}
                            >
                              <MenuItem value="Parent Drop-off">Parent Drop-off</MenuItem>
                              <MenuItem value="School Bus">School Bus</MenuItem>
                              <MenuItem value="School Van">School Van</MenuItem>
                              <MenuItem value="Ayah Escort">Ayah Escort</MenuItem>
                            </TextField>
                          </TableCell>

                          {/* Remarks */}
                          <TableCell>
                            <TextField
                              size="small"
                              placeholder="Notes / Pediatric observation"
                              value={item.remarks}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateAttendance(prev => prev.map(a => a.studentId === item.studentId ? { ...a, remarks: val } : a));
                              }}
                              sx={{ minWidth: 190, '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.6 } }}
                            />
                          </TableCell>

                          {/* Parent Alert Status */}
                          <TableCell align="center">
                            <Tooltip title={`Guardian: ${item.guardianName} (${item.guardianPhone})`}>
                              <Chip
                                size="small"
                                icon={<CheckIcon sx={{ fontSize: '14px !important' }} />}
                                label="Alert Sent"
                                color="success"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.72rem' }}
                              />
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB 2: PARENT-TEACHER REAL-TIME CHAT
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 2 && (
            <Box>
              <Grid container spacing={3}>
                {/* Left Side: Parent Contacts List */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: 640, display: 'flex', flexDirection: 'column' }}>
                    <CardHeader
                      title="Toddler Parents"
                      subheader="Direct 2-way communication"
                      sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                    />
                    <Box sx={{ overflowY: 'auto', flex: 1, p: 1.5 }}>
                      <Stack spacing={1}>
                        {DEMO_PARENT_CONTACTS.map((contact) => {
                          const isSelected = contact.id === selectedChatContactId;
                          const msgs = chatMessages[contact.teacherId] || [];
                          const lastMsg = msgs[msgs.length - 1];

                          return (
                            <Paper
                              key={contact.id}
                              onClick={() => setSelectedChatContactId(contact.id)}
                              elevation={0}
                              sx={{
                                p: 1.8,
                                borderRadius: 2.5,
                                border: '1px solid',
                                borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                                bgcolor: isSelected ? 'primary.50' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                '&:hover': { bgcolor: isSelected ? 'primary.50' : '#f8fafc' }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  variant="dot"
                                  color={contact.online ? 'success' : 'default'}
                                >
                                  <Avatar src={contact.avatar} sx={{ width: 46, height: 46 }} />
                                </Badge>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', noWrap: true }}>
                                      {contact.parentName}
                                    </Typography>
                                    <Chip size="small" label={contact.relation} sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                                  </Box>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}>
                                    Child: {contact.childName} ({contact.section})
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ noWrap: true, display: 'block', mt: 0.3 }}>
                                    {lastMsg ? lastMsg.text : 'Tap to open conversation...'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Card>
                </Grid>

                {/* Right Side: Active Chat Thread */}
                <Grid size={{ xs: 12, md: 8 }}>
                  <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', height: 640, display: 'flex', flexDirection: 'column' }}>
                    {/* Chat Header */}
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={activeChatContact.avatar} sx={{ width: 44, height: 44 }} />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {activeChatContact.parentName} ({activeChatContact.relation} of {activeChatContact.childName})
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Section: <b>{activeChatContact.section}</b> • Email: <b>{activeChatContact.email}</b> • Phone: <b>{activeChatContact.phone}</b>
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        size="small"
                        color={activeChatContact.online ? 'success' : 'default'}
                        label={activeChatContact.online ? 'Online in Parent Portal' : 'Offline'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    {/* Chat Messages Body */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5, bgcolor: '#f1f5f9' }}>
                      <Stack spacing={2}>
                        {activeChatThread.map((msg) => {
                          const isStaff = msg.sender === 'teacher';
                          return (
                            <Box
                              key={msg.id}
                              sx={{
                                display: 'flex',
                                justifyContent: isStaff ? 'flex-end' : 'flex-start'
                              }}
                            >
                              <Box
                                sx={{
                                  maxWidth: '75%',
                                  p: 2,
                                  borderRadius: 2.5,
                                  bgcolor: isStaff ? '#3b82f6' : '#ffffff',
                                  color: isStaff ? '#ffffff' : '#1e293b',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                                  border: isStaff ? 'none' : '1px solid #e2e8f0'
                                }}
                              >
                                <Typography variant="caption" sx={{ fontWeight: 700, color: isStaff ? '#dbeafe' : 'text.secondary', display: 'block', mb: 0.5 }}>
                                  {msg.senderName} • {msg.timestamp}
                                </Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                                  {msg.text}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                        <div ref={chatMessagesEndRef} />
                      </Stack>
                    </Box>

                    {/* Canned Quick Replies Strip */}
                    <Box sx={{ p: 1.2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1, overflowX: 'auto' }}>
                      {CANNED_REPLIES.map((reply, i) => (
                        <Chip
                          key={i}
                          label={reply}
                          size="small"
                          onClick={() => handleSendChatMessage(reply)}
                          sx={{
                            cursor: 'pointer',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            bgcolor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            '&:hover': { bgcolor: '#eff6ff', borderColor: '#bfdbfe' }
                          }}
                        />
                      ))}
                    </Box>

                    {/* Chat Input Bar */}
                    <Box sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={`Message ${activeChatContact.parentName} regarding ${activeChatContact.childName}...`}
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendChatMessage();
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleSendChatMessage()}
                        disabled={!chatInputText.trim()}
                        endIcon={<SendIcon />}
                        sx={{ px: 2.5, fontWeight: 700, borderRadius: 2, textTransform: 'none', height: 40 }}
                      >
                        Send
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB 3: KINDERGARTEN ANNOUNCEMENTS & CIRCULARS
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 3 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {['ALL', 'EVENT', 'HOLIDAY', 'HEALTH_SAFETY', 'GENERAL'].map(cat => (
                    <Button
                      key={cat}
                      size="small"
                      variant={announcementCategoryFilter === cat ? 'contained' : 'outlined'}
                      onClick={() => setAnnouncementCategoryFilter(cat)}
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                      {cat.replace('_', ' ')}
                    </Button>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setIsAddAnnouncementOpen(true)}
                  sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  Create Circular
                </Button>
              </Box>

              <Grid container spacing={2.5}>
                {announcements
                  .filter(a => announcementCategoryFilter === 'ALL' || a.category === announcementCategoryFilter)
                  .map((notice) => (
                    <Grid size={{ xs: 12, md: 6 }} key={notice.id}>
                      <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                        <CardHeader
                          title={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                {notice.title}
                              </Typography>
                              {notice.priority === 'URGENT' && (
                                <Chip size="small" color="error" label="URGENT" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
                              )}
                            </Box>
                          }
                          subheader={`Published by: ${notice.author} • ${new Date(notice.createdAt).toLocaleDateString()}`}
                          action={
                            <IconButton size="small" color="error" onClick={() => handleDeleteAnnouncement(notice.id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          }
                          sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}
                        />
                        <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                            {notice.content}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip size="small" label={`Target: ${notice.targetGrade}`} sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }} />
                              <Chip size="small" label={notice.category} color={notice.category === 'EVENT' ? 'info' : notice.category === 'HEALTH_SAFETY' ? 'error' : 'secondary'} sx={{ fontWeight: 700 }} />
                            </Box>
                            <Chip size="small" icon={<CheckIcon sx={{ fontSize: '14px !important' }} />} label="Live on Parent Portal" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB 4: MEALS, NAPS & DAILY ROUTINE
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Daily Meals, Nap Rest & Daycare Routine</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monitors toddler food intake, dietary allergy restrictions, afternoon rest quality, and toilet training.
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setIsAddToddlerOpen(true)}
                  sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  Log Toddler Routine
                </Button>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Toddler</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Morning Fruit Snack</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Warm Balanced Lunch</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Cot Nap Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Nap Minutes</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Toilet Independence</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Allergy Alerts</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {toddlers.map((t) => (
                      <TableRow key={t.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={t.photoUrl} sx={{ width: 42, height: 42 }} />
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{t.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{t.section}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={t.morningSnack} color={t.morningSnack === 'Ate All' ? 'success' : 'warning'} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={t.lunch} color={t.lunch === 'Ate All' ? 'success' : 'warning'} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={t.napStatus} color={t.napStatus === 'Sound Asleep' ? 'primary' : 'default'} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>⏱️ {t.napMinutes} mins</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={t.toiletIndependence} color="secondary" sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          {t.allergyAlert ? (
                            <Chip size="small" color="error" label={t.allergyAlert} sx={{ fontWeight: 800 }} />
                          ) : (
                            <Typography variant="caption" color="text.secondary">None reported</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB 5: SENSORY & DEVELOPMENTAL MILESTONES
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 5 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Early Childhood Milestones & Sensory Engagement</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Holistic observation of fine motor skills, emotional mood patterns, and sensory table participation.
              </Typography>

              <Grid container spacing={2.5}>
                {toddlers.map((t) => (
                  <Grid size={{ xs: 12, md: 6 }} key={t.id}>
                    <Card sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={t.photoUrl} sx={{ width: 48, height: 48 }} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{t.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{t.section}</Typography>
                          </Box>
                        </Box>
                        <Chip
                          size="small"
                          icon={<MoodIcon />}
                          label={`Mood: ${t.mood}`}
                          color="secondary"
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Stack spacing={1.2}>
                        <Box sx={{ p: 1.2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                            TODAY'S SENSORY & MOTOR ACTIVITY:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.3 }}>
                            🎨 {t.sensoryActivity}
                          </Typography>
                        </Box>

                        <Box sx={{ p: 1.2, bgcolor: '#fdf2f8', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                            EDUCATOR'S DAILY ANECDOTAL NOTE:
                          </Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#831843', mt: 0.3 }}>
                            "{t.teacherNote}"
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB 6: SAFE DISMISSAL & RFID GUARDIAN PICK-UP
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 6 && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Guardian Pick-up & Safe Dismissal Gate Log</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Dual-verification: RFID match, authorized guardian identity verification, and Ayah escort sign-off.
              </Typography>

              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Toddler</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Authorized Pick-up Person</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Relationship</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Guardian RFID / PIN</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Dismissal Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }} align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {toddlers.map((t) => (
                      <TableRow key={t.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={t.photoUrl} sx={{ width: 42, height: 42 }} />
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{t.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{t.section}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{t.pickupGuardian}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={t.pickupRelation} sx={{ fontWeight: 600, bgcolor: '#f1f5f9' }} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" color="primary" variant="outlined" label={t.pickupRfid} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={t.pickupStatus === 'Verified & Departed' ? 'success' : t.pickupStatus === 'Authorized Guardian Arrived' ? 'warning' : 'default'}
                            label={t.pickupStatus}
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PrintIcon />}
                            onClick={() => handleOpenSlip(t)}
                            sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                          >
                            Parent Slip
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB 7: CLASS SECTIONS & ROSTER
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 7 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Pre-Primary Class Sections</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Configured with designated lead educators, assistant teachers, and caregiver ayahs for optimal ratios.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {['ALL', 'Pre-KG', 'LKG', 'UKG'].map((lvl) => (
                    <Button
                      key={lvl}
                      size="small"
                      variant={selectedSectionFilter === lvl ? 'contained' : 'outlined'}
                      onClick={() => setSelectedSectionFilter(lvl)}
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    >
                      {lvl}
                    </Button>
                  ))}
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={() => setIsAddSectionOpen(true)}
                    sx={{ fontWeight: 700, borderRadius: 2, ml: 1, textTransform: 'none' }}
                  >
                    Add Section
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                {sections
                  .filter((s) => selectedSectionFilter === 'ALL' || s.grade === selectedSectionFilter)
                  .map((sec) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={sec.id}>
                      <Card sx={{ height: '100%', border: '1px solid #e2e8f0', borderRadius: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                        <CardHeader
                          avatar={
                            <Avatar sx={{ bgcolor: sec.grade === 'Pre-KG' ? '#f43f5e' : sec.grade === 'LKG' ? '#eab308' : '#06b6d4', fontWeight: 800 }}>
                              {sec.grade.charAt(0)}
                            </Avatar>
                          }
                          title={<Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{sec.name}</Typography>}
                          subheader={`${sec.room} • Ages: ${sec.ageGroup}`}
                        />
                        <CardContent sx={{ p: 2.5, pt: 0 }}>
                          <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0', mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">Enrolled Toddlers</Typography>
                              <Typography variant="caption" sx={{ fontWeight: 800 }}>{sec.enrolled} / {sec.capacity}</Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">Lead Educator: <b>{sec.leadTeacher}</b></Typography>
                            <Typography variant="caption" color="text.secondary">Assistant Teacher: <b>{sec.assistantTeacher}</b></Typography>
                            <Typography variant="caption" color="text.secondary">Caregiver / Ayah: <b>{sec.caregiverAyah}</b></Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </Box>
          )}

          {/* ═══════════════════════════════════════════════════════════════════════
              TAB 8: STAFF & AYAH ALLOCATION
          ═══════════════════════════════════════════════════════════════════════ */}
          {activeTab === 8 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Early Childhood Faculty & Caregiver Allocation</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Staff-to-child ratios, shift assignments, and classroom ayah distribution.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AssignmentIndIcon />}
                  onClick={() => setIsAllocationOpen(true)}
                  sx={{ fontWeight: 700, borderRadius: 2, textTransform: 'none' }}
                >
                  Allocate Staff
                </Button>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Section</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Grade Level</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Lead Educator</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Assistant Educator</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Caregiver Ayah</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Room</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sections.map((s) => (
                      <TableRow key={s.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{s.name}</TableCell>
                        <TableCell>
                          <Chip size="small" label={s.grade} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>{s.leadTeacher}</TableCell>
                        <TableCell>{s.assistantTeacher}</TableCell>
                        <TableCell>
                          <Chip size="small" color="secondary" label={s.caregiverAyah} sx={{ fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>{s.room}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </>
      )}

      {/* ─── Create Announcement Dialog ─── */}
      <Dialog open={isAddAnnouncementOpen} onClose={() => setIsAddAnnouncementOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          Publish Kindergarten Circular
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 1 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Circular Title"
              placeholder="e.g. Annual Splash Day / Fruit Salad Nutrition Activity"
              value={newAnnouncementForm.title}
              onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, title: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={newAnnouncementForm.category}
                  onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, category: e.target.value as any })}
                >
                  <MenuItem value="EVENT">School Event</MenuItem>
                  <MenuItem value="HOLIDAY">Holiday Notice</MenuItem>
                  <MenuItem value="HEALTH_SAFETY">Health & Safety Alert</MenuItem>
                  <MenuItem value="GENERAL">General Circular</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Target Audience"
                  value={newAnnouncementForm.targetGrade}
                  onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, targetGrade: e.target.value as any })}
                >
                  <MenuItem value="All Kindergarten">All Kindergarten</MenuItem>
                  <MenuItem value="Pre-KG">Pre-KG Only</MenuItem>
                  <MenuItem value="LKG">LKG Only</MenuItem>
                  <MenuItem value="UKG">UKG Only</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Priority Level"
                  value={newAnnouncementForm.priority}
                  onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, priority: e.target.value as any })}
                >
                  <MenuItem value="NORMAL">Normal Priority</MenuItem>
                  <MenuItem value="HIGH">High Priority</MenuItem>
                  <MenuItem value="URGENT">Urgent Broadcast</MenuItem>
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Event Date (Optional)"
                  placeholder="e.g. Nov 15, 2026"
                  value={newAnnouncementForm.eventDate}
                  onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, eventDate: e.target.value })}
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Circular Details / Instructions for Parents"
              placeholder="Provide complete instructions, dress code, snacks to pack, and dismissal timings..."
              value={newAnnouncementForm.content}
              onChange={(e) => setNewAnnouncementForm({ ...newAnnouncementForm, content: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setIsAddAnnouncementOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateAnnouncement}
            disabled={!newAnnouncementForm.title || !newAnnouncementForm.content}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Publish & Broadcast
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Add Pre-Primary Section Dialog ─── */}
      <Dialog open={isAddSectionOpen} onClose={() => setIsAddSectionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Pre-Primary Section</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              label="Grade Level"
              value={newSectionForm.grade}
              onChange={(e) => setNewSectionForm({ ...newSectionForm, grade: e.target.value as any })}
            >
              <MenuItem value="Pre-KG">Pre-KG (2.5 - 3.5 yrs)</MenuItem>
              <MenuItem value="LKG">LKG (3.5 - 4.5 yrs)</MenuItem>
              <MenuItem value="UKG">UKG (4.5 - 5.5 yrs)</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Section Display Name"
              placeholder="e.g. Rainbow Sparkles (Pre-KG C)"
              value={newSectionForm.name}
              onChange={(e) => setNewSectionForm({ ...newSectionForm, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Classroom / Activity Hall"
              value={newSectionForm.room}
              onChange={(e) => setNewSectionForm({ ...newSectionForm, room: e.target.value })}
            />
            <TextField
              fullWidth
              label="Lead Educator"
              value={newSectionForm.leadTeacher}
              onChange={(e) => setNewSectionForm({ ...newSectionForm, leadTeacher: e.target.value })}
            />
            <TextField
              fullWidth
              label="Assistant Educator"
              value={newSectionForm.assistantTeacher}
              onChange={(e) => setNewSectionForm({ ...newSectionForm, assistantTeacher: e.target.value })}
            />
            <TextField
              fullWidth
              label="Caregiver Ayah"
              value={newSectionForm.caregiverAyah}
              onChange={(e) => setNewSectionForm({ ...newSectionForm, caregiverAyah: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAddSectionOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSection} disabled={!newSectionForm.name} sx={{ fontWeight: 700 }}>
            Create Section
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Add Toddler Routine Care Log Dialog ─── */}
      <Dialog open={isAddToddlerOpen} onClose={() => setIsAddToddlerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Log Toddler Daily Routine</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Toddler Full Name"
              placeholder="e.g. Aarav Sharma"
              value={newToddlerForm.name}
              onChange={(e) => setNewToddlerForm({ ...newToddlerForm, name: e.target.value })}
            />
            <TextField
              select
              fullWidth
              label="Section"
              value={newToddlerForm.section}
              onChange={(e) => setNewToddlerForm({ ...newToddlerForm, section: e.target.value })}
            >
              {sections.map(s => (
                <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>
              ))}
            </TextField>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Morning Snack"
                  value={newToddlerForm.morningSnack}
                  onChange={(e) => setNewToddlerForm({ ...newToddlerForm, morningSnack: e.target.value as any })}
                >
                  <MenuItem value="Ate All">Ate All</MenuItem>
                  <MenuItem value="Ate Half">Ate Half</MenuItem>
                  <MenuItem value="Picky / Skipped">Picky / Skipped</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Warm Lunch"
                  value={newToddlerForm.lunch}
                  onChange={(e) => setNewToddlerForm({ ...newToddlerForm, lunch: e.target.value as any })}
                >
                  <MenuItem value="Ate All">Ate All</MenuItem>
                  <MenuItem value="Ate Half">Ate Half</MenuItem>
                  <MenuItem value="Picky / Skipped">Picky / Skipped</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Sensory Play Activity"
              value={newToddlerForm.sensoryActivity}
              onChange={(e) => setNewToddlerForm({ ...newToddlerForm, sensoryActivity: e.target.value })}
            />
            <TextField
              fullWidth
              label="Authorized Pick-up Person"
              value={newToddlerForm.pickupGuardian}
              onChange={(e) => setNewToddlerForm({ ...newToddlerForm, pickupGuardian: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Educator's Anecdotal Note"
              value={newToddlerForm.teacherNote}
              onChange={(e) => setNewToddlerForm({ ...newToddlerForm, teacherNote: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAddToddlerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateToddler} disabled={!newToddlerForm.name} sx={{ fontWeight: 700 }}>
            Save Care Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Parent Handover Slip Dialog ─── */}
      <Dialog open={isSlipOpen} onClose={() => setIsSlipOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', bgcolor: '#f8fafc' }}>
          🧸 Toddler Daily Handover Slip
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedToddlerForSlip && (
            <Box sx={{ border: '2px dashed #cbd5e1', p: 2.5, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#0f172a' }}>
                {selectedToddlerForSlip.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 2 }}>
                Section: {selectedToddlerForSlip.section} • Date: {new Date().toLocaleDateString()}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Stack spacing={1}>
                <Typography variant="body2">🥣 <b>Lunch:</b> {selectedToddlerForSlip.lunch}</Typography>
                <Typography variant="body2">🛏️ <b>Nap Rest:</b> {selectedToddlerForSlip.napStatus} ({selectedToddlerForSlip.napMinutes} mins)</Typography>
                <Typography variant="body2">🎨 <b>Activity:</b> {selectedToddlerForSlip.sensoryActivity}</Typography>
                <Typography variant="body2">🛡️ <b>Guardian:</b> {selectedToddlerForSlip.pickupGuardian} ({selectedToddlerForSlip.pickupRelation})</Typography>
                <Typography variant="body2">💳 <b>Verified RFID:</b> {selectedToddlerForSlip.pickupRfid}</Typography>
                <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#831843', display: 'block', mt: 1 }}>
                  Note: "{selectedToddlerForSlip.teacherNote}"
                </Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsSlipOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ fontWeight: 700 }}>
            Print Slip
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Staff Allocation Modal ─── */}
      <Dialog open={isAllocationOpen} onClose={() => setIsAllocationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Allocate Staff to Early Childhood Wing</DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              fullWidth
              label="Educational Wing"
              value={allocationForm.wing}
              onChange={(e) => setAllocationForm({ ...allocationForm, wing: e.target.value })}
            >
              {WINGS_CONFIG.map(w => (
                <MenuItem key={w.id} value={w.id}>{w.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Target Grade / Class"
              value={allocationForm.grade}
              onChange={(e) => setAllocationForm({ ...allocationForm, grade: e.target.value })}
            />
            <TextField
              fullWidth
              label="Lead Educator / Coordinator"
              value={allocationForm.leadTeacher}
              onChange={(e) => setAllocationForm({ ...allocationForm, leadTeacher: e.target.value })}
            />
            <TextField
              fullWidth
              label="Assistant Teacher"
              value={allocationForm.assistantTeacher}
              onChange={(e) => setAllocationForm({ ...allocationForm, assistantTeacher: e.target.value })}
            />
            <TextField
              fullWidth
              label="Caregiver Ayah"
              value={allocationForm.caregiverAyah}
              onChange={(e) => setAllocationForm({ ...allocationForm, caregiverAyah: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAllocationOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAllocation} sx={{ fontWeight: 700 }}>
            Save Allocation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KindergartenDashboard;
