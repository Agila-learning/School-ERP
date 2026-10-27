import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button,
  Chip, Tabs, Tab, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Alert, Tooltip, Badge, MenuItem,
  Select, FormControl, InputLabel, Divider, Avatar, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress, Switch, FormControlLabel
} from '@mui/material';
import {
  Hotel as HotelIcon,
  Restaurant as MessIcon,
  ExitToApp as OutpassIcon,
  Forum as ChatIcon,
  Payment as FeeIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  MeetingRoom as RoomIcon,
  Domain as DomainIcon,
  Print as PrintIcon,
  QrCode2 as QrCodeIcon,
  Fastfood as DishIcon,
  Security as SecurityIcon,
  Send as SendIcon,
  ArrowForward as ArrowIcon,
  SwapHoriz as SwitchGenderIcon,
  Info as InfoIcon,
  Warning as AlertIcon,
  Female as FemaleIcon,
  Male as MaleIcon,
  LocalDining as DiningIcon,
  Verified as VerifiedIcon,
  Download as DownloadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { publishNotification } from '../../../core/services/realtimeNotificationBus';

interface HostelStudentSectionProps {
  student: any;
  parent?: any;
}

// 7-Day Weekly Mess Menu Data
const WEEKLY_MENU = {
  Monday: {
    breakfast: { menu: 'Idli, Medu Vada, Sambar, Coconut Chutney, Banana', time: '07:30 AM - 09:00 AM', calories: '480 kcal', special: 'Fresh Coconut Water' },
    lunch: { menu: 'Paneer Butter Masala, Phulka, Jeera Rice, Dal Tadka, Curd, Papad', time: '12:30 PM - 02:00 PM', calories: '720 kcal', special: 'Papad & Pickle' },
    snacks: { menu: 'Veg Samosa (2 pcs), Mint Chutney, Masala Chai / Badam Milk', time: '05:00 PM - 06:00 PM', calories: '310 kcal', special: 'Ginger Chai' },
    dinner: { menu: 'Phulka Roti, Mixed Vegetable Korma, Vegetable Pulao, Rasam, Gulab Jamun', time: '07:45 PM - 09:15 PM', calories: '690 kcal', special: 'Warm Gulab Jamun' }
  },
  Tuesday: {
    breakfast: { menu: 'Poori with Aloo Masala, Poha, Sprouts Salad, Hot Tea/Coffee', time: '07:30 AM - 09:00 AM', calories: '520 kcal', special: 'Crispy Pooris' },
    lunch: { menu: 'Rajma Masala, Steamed Basmati Rice, Tandoori Roti, Boondi Raita, Salad', time: '12:30 PM - 02:00 PM', calories: '680 kcal', special: 'Punjabi Rajma' },
    snacks: { menu: 'Sweet Corn Chaat, Fruit Bowl, Green Tea / Filter Coffee', time: '05:00 PM - 06:00 PM', calories: '240 kcal', special: 'Steamed Sweet Corn' },
    dinner: { menu: 'South Indian Thali: Sambar Rice, Curd Rice, Poriyal, Appalam, Semiya Payasam', time: '07:45 PM - 09:15 PM', calories: '650 kcal', special: 'Semiya Payasam' }
  },
  Wednesday: {
    breakfast: { menu: 'Masala Dosa, Sambar, Tomato & Coconut Chutney, Boiled Eggs / Sprouts', time: '07:30 AM - 09:00 AM', calories: '490 kcal', special: 'Ghee Roast Dosa' },
    lunch: { menu: 'Veg Dum Biryani / Egg Biryani, Mirchi Ka Salan, Onion Raita, Dal Makhani, Naan', time: '12:30 PM - 02:00 PM', calories: '790 kcal', special: 'Dum Biryani Special' },
    snacks: { menu: 'Bread Pakora with Sweet Tamarind Chutney, Lemon Tea / Hot Horlicks', time: '05:00 PM - 06:00 PM', calories: '330 kcal', special: 'Hot Horlicks' },
    dinner: { menu: 'Methi Paratha, Paneer Bhurji, Steamed Rice, Tomato Soup, Fruit Custard', time: '07:45 PM - 09:15 PM', calories: '670 kcal', special: 'Chilled Fruit Custard' }
  },
  Thursday: {
    breakfast: { menu: 'Uttapam with Onion & Tomato, Coconut Chutney, Sambar, Fresh Orange', time: '07:30 AM - 09:00 AM', calories: '450 kcal', special: 'Fresh Cut Orange' },
    lunch: { menu: 'Chole Bhature / Phulka with Chole, Jeera Rice, Cucumber Raita, Roasted Papad', time: '12:30 PM - 02:00 PM', calories: '750 kcal', special: 'Amritsari Chole' },
    snacks: { menu: 'Veg Cutlet, Tomato Ketchup, Cardamom Tea / Cold Coffee', time: '05:00 PM - 06:00 PM', calories: '290 kcal', special: 'Cold Coffee' },
    dinner: { menu: 'Aloo Gobi Masala, Chapati, Dal Fry, Steamed Rice, Butter Milk, Moong Dal Halwa', time: '07:45 PM - 09:15 PM', calories: '700 kcal', special: 'Moong Dal Halwa' }
  },
  Friday: {
    breakfast: { menu: 'Ven Pongal, Medu Vada, Coconut Chutney, Gothsu, Filter Coffee', time: '07:30 AM - 09:00 AM', calories: '510 kcal', special: 'South Indian Filter Coffee' },
    lunch: { menu: 'Kadai Paneer, Butter Roti, Peas Pulao, Yellow Dal Tadka, Dahi Vada', time: '12:30 PM - 02:00 PM', calories: '740 kcal', special: 'Soft Dahi Vada' },
    snacks: { menu: 'Bhel Puri / Sev Puri, Cut Fruits, Masala Milk', time: '05:00 PM - 06:00 PM', calories: '260 kcal', special: 'Kesar Badam Milk' },
    dinner: { menu: 'Veg Fried Rice, Gobi Manchurian Gravy, Hakka Noodles, Hot Sweet Corn Soup', time: '07:45 PM - 09:15 PM', calories: '710 kcal', special: 'Indo-Chinese Feast' }
  },
  Saturday: {
    breakfast: { menu: 'Aloo Paratha with Curd & Pickle, Boiled Eggs / Papaya Slices, Hot Tea', time: '07:30 AM - 09:00 AM', calories: '530 kcal', special: 'Amritsari Aloo Paratha' },
    lunch: { menu: 'Mushroom Peas Curry / Paneer, Steamed Rice, Phulka, Lemon Rasam, Curd', time: '12:30 PM - 02:00 PM', calories: '660 kcal', special: 'Mushroom Masala' },
    snacks: { menu: 'Pani Puri / Onion Pakoda, Mint Water, Filter Tea', time: '05:00 PM - 06:00 PM', calories: '280 kcal', special: 'Evening Street Chaat' },
    dinner: { menu: 'Malai Kofta, Butter Naan, Veg Pulao, Mixed Salad, Ice Cream Cup', time: '07:45 PM - 09:15 PM', calories: '780 kcal', special: 'Vanilla Ice Cream' }
  },
  Sunday: {
    breakfast: { menu: 'Puri Masala, Rava Kesari, Banana, Boiled Eggs, Tea / Coffee', time: '08:00 AM - 09:30 AM', calories: '550 kcal', special: 'Sunday Sweet Kesari' },
    lunch: { menu: 'Grand Sunday Feast: Hyderabadi Veg/Chicken Biryani, Raita, Shahi Paneer, Mirchi Ka Salan, Double Ka Meetha', time: '12:30 PM - 02:30 PM', calories: '880 kcal', special: 'Chef Special Biryani Feast' },
    snacks: { menu: 'Assorted Biscuits, Rusks, Fresh Lime Juice / Tea', time: '05:00 PM - 06:00 PM', calories: '220 kcal', special: 'Fresh Mint Lime' },
    dinner: { menu: 'Light Sunday Dinner: Khichdi with Ghee & Papad, Aloo Jeera, Tomato Soup, Fresh Curd', time: '07:45 PM - 09:15 PM', calories: '580 kcal', special: 'Light Comfort Meal' }
  }
};

export const HostelStudentSection: React.FC<HostelStudentSectionProps> = ({ student, parent }) => {
  // Residency State: default active hostel resident
  const [isHostelResident, setIsHostelResident] = useState(true);
  
  // Gender Customization State: defaults to student's gender or toggleable
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female'>(
    (student?.gender?.toLowerCase() === 'female') ? 'Female' : 'Male'
  );

  // Sub-tab: 0: Food/Mess, 1: In/Out Pass, 2: Fees & Receipt, 3: Warden Chat
  const [subTab, setSubTab] = useState(0);

  // Food / Mess State
  const [selectedDay, setSelectedDay] = useState<keyof typeof WEEKLY_MENU>('Monday');
  const [dietPreference, setDietPreference] = useState<'VEG' | 'NON_VEG' | 'JAIN'>('VEG');
  const [skippedMeals, setSkippedMeals] = useState<string[]>([]);
  const [mealFeedbackModal, setMealFeedbackModal] = useState(false);
  const [mealFeedbackText, setMealFeedbackText] = useState('');
  const [mealRating, setMealRating] = useState('5');

  // In / Out Pass State
  const [outpasses, setOutpasses] = useState([
    {
      id: 'OP-2026-0094',
      type: 'Weekend Home Visit',
      purpose: 'Family Festival & Cousin Wedding Celebration',
      destination: 'Chennai, Tamil Nadu (Home Address)',
      departureTime: '2026-10-24 04:30 PM',
      expectedReturnTime: '2026-10-26 07:00 PM',
      actualReturnTime: '-',
      escortName: parent?.firstName ? `${parent.firstName} ${parent.lastName || ''}` : 'Mr. K. Anand',
      escortRelation: parent?.relationship || 'Father',
      escortPhone: parent?.phone || '+91 94432 11002',
      escortIdVerified: true,
      approvedByName: selectedGender === 'Male' ? 'Dr. Arvind Swaminathan' : 'Dr. Revathi Sundaram',
      approverRole: selectedGender === 'Male' ? 'Chief Warden (Boys Wing)' : 'Chief Warden (Girls Wing)',
      approvedAt: '2026-10-23 11:20 AM',
      status: 'APPROVED',
      wardenRemarks: 'Parent telephonically confirmed. Curfew return strictly by 7:00 PM Sunday.',
      qrCode: 'FIC-PASS-OP-2026-0094-VERIFIED'
    },
    {
      id: 'OP-2026-0081',
      type: 'Day Outpass',
      purpose: 'Dental Consultation & Braces Checkup at Apollo Dental',
      destination: 'Apollo Specialty Clinic, Anna Nagar',
      departureTime: '2026-10-17 02:00 PM',
      expectedReturnTime: '2026-10-17 06:30 PM',
      actualReturnTime: '2026-10-17 06:15 PM',
      escortName: 'Self (Day Pass Clearance)',
      escortRelation: 'Self',
      escortPhone: '+91 98401 22334',
      escortIdVerified: true,
      approvedByName: selectedGender === 'Male' ? 'Dr. Arvind Swaminathan' : 'Dr. Revathi Sundaram',
      approverRole: selectedGender === 'Male' ? 'Chief Warden (Boys Wing)' : 'Chief Warden (Girls Wing)',
      approvedAt: '2026-10-17 09:30 AM',
      status: 'RETURNED_SAFE',
      wardenRemarks: 'Returned safely on time. Gate check-in verified by Security.',
      qrCode: 'FIC-PASS-OP-2026-0081-COMPLETED'
    }
  ]);

  // Pass Request Modal State
  const [requestPassModal, setRequestPassModal] = useState(false);
  const [newPassForm, setNewPassForm] = useState({
    type: 'Weekend Home Visit',
    purpose: '',
    destination: 'Home',
    departureTime: '',
    expectedReturnTime: '',
    escortName: parent?.firstName ? `${parent.firstName} ${parent.lastName || ''}` : 'Mr. K. Anand',
    escortRelation: parent?.relationship || 'Father',
    escortPhone: parent?.phone || '+91 94432 11002',
    parentConsentVerified: true
  });
  const [selectedPassForQR, setSelectedPassForQR] = useState<any>(null);

  // Fees & Official Receipt State
  const [hostelFeeLedger, setHostelFeeLedger] = useState({
    academicYear: '2026-2027',
    term: 'Term 2 (Autumn - Spring)',
    roomType: 'Twin Sharing Deluxe (Air-Cooled)',
    rentAmount: 24000,
    messAmount: 18500,
    amenitiesAmount: 4500,
    cautionDeposit: 5000,
    totalBilled: 52000,
    amountPaid: 52000,
    balanceDue: 0,
    paymentStatus: 'PAID_AND_APPROVED', // 'PAID_AND_APPROVED', 'PENDING_APPROVAL', 'DUE'
    transactionId: 'UPI-TXN-2026-9812401',
    paymentDate: '2026-10-15',
    paymentMode: 'UPI / NetBanking (HDFC Bank)',
    receiptNo: 'HST-REC-2026-00482',
    approvedBy: selectedGender === 'Male' ? 'Dr. Arvind Swaminathan (Warden) & Accounts Officer' : 'Dr. Revathi Sundaram (Warden) & Accounts Officer'
  });

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmountInput, setPayAmountInput] = useState('52000');
  const [paymentModeInput, setPaymentModeInput] = useState('UPI');
  const [txnRefInput, setTxnRefInput] = useState('UPI-' + Date.now().toString().slice(-6));
  const [instantApprovalToggle, setInstantApprovalToggle] = useState(true);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Chat with Warden State
  const [wardenChatInput, setWardenChatInput] = useState('');
  const chatScrollBottomRef = useRef<HTMLDivElement>(null);
  const [wardenMessages, setWardenMessages] = useState([
    {
      id: 'wm-1',
      sender: 'warden',
      text: selectedGender === 'Male'
        ? 'Welcome to Kaveri Boys Residency! Room inspection rounds are scheduled for 8:45 PM tonight. Please keep your study desks tidy.'
        : 'Welcome to Ganga Girls Residency! Room inspection rounds are scheduled for 8:15 PM tonight. Please keep your study desks tidy.',
      time: 'Today, 09:15 AM'
    },
    {
      id: 'wm-2',
      sender: 'student',
      text: 'Good morning Sir/Madam, my weekend outpass for Chennai visit has been submitted. My father will be picking me up at 4:30 PM.',
      time: 'Today, 10:45 AM'
    },
    {
      id: 'wm-3',
      sender: 'warden',
      text: 'Yes Advik, I have reviewed the request and telephonically verified with your parent. Your outpass OP-2026-0094 is APPROVED. Gate pass slip is ready in your portal.',
      time: 'Today, 11:20 AM'
    }
  ]);

  // Gender Customization Constants
  const wardenDetails = selectedGender === 'Male' ? {
    wingName: 'Kaveri Boys Residency • Block A',
    roomBed: 'Room 204 • Bed B (Upper Window Berth)',
    wardenName: 'Dr. Arvind Swaminathan',
    wardenTitle: 'Chief Warden — Boys Wing',
    wardenOffice: 'Resident Warden Flat #101 (Ground Floor, Block A)',
    wardenPhone: '+91 98412 88210',
    wardenEmail: 'arvind.warden@ficschool.edu',
    assistantName: 'Mr. K. Selvam (Block Supervisor, Ph: +91 98412 88215)',
    curfewTime: '08:30 PM (Night Roll Call)',
    securityGate: 'Main Campus Security Post — Gate 1',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    colorTheme: '#1e3a8a'
  } : {
    wingName: 'Ganga Girls Residency • Malabar Wing',
    roomBed: 'Room 108 • Bed A (Lower Garden Berth)',
    wardenName: 'Dr. Revathi Sundaram',
    wardenTitle: 'Chief Warden — Girls Wing',
    wardenOffice: 'Resident Warden Suite #002 (Ground Floor, Ganga Wing)',
    wardenPhone: '+91 98412 88211',
    wardenEmail: 'revathi.warden@ficschool.edu',
    assistantName: 'Mrs. Anitha Raman (Senior Matron, Ph: +91 98412 88216)',
    curfewTime: '07:45 PM (Night Roll Call)',
    securityGate: 'Girls Wing Dedicated Security Desk — Gate 2',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    colorTheme: '#831843'
  };

  // Scroll chat
  useEffect(() => {
    if (subTab === 3) {
      chatScrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [wardenMessages, subTab]);

  // Handle Outpass Request Submit
  const handleRequestOutpassSubmit = () => {
    if (!newPassForm.purpose.trim() || !newPassForm.departureTime || !newPassForm.expectedReturnTime) {
      alert('Please fill out the purpose of visit, departure timing, and expected return timing.');
      return;
    }

    const passId = `OP-2026-0${Math.floor(100 + Math.random() * 900)}`;
    const newPass = {
      id: passId,
      type: newPassForm.type,
      purpose: newPassForm.purpose,
      destination: newPassForm.destination,
      departureTime: newPassForm.departureTime,
      expectedReturnTime: newPassForm.expectedReturnTime,
      actualReturnTime: '-',
      escortName: newPassForm.escortName,
      escortRelation: newPassForm.escortRelation,
      escortPhone: newPassForm.escortPhone,
      escortIdVerified: true,
      approvedByName: wardenDetails.wardenName,
      approverRole: wardenDetails.wardenTitle,
      approvedAt: 'Pending Approval',
      status: 'PENDING_APPROVAL',
      wardenRemarks: 'Submitted by student. Awaiting Warden clearance.',
      qrCode: `FIC-PASS-${passId}-PENDING`
    };

    setOutpasses([newPass, ...outpasses]);
    setRequestPassModal(false);
    setNewPassForm({
      type: 'Weekend Home Visit',
      purpose: '',
      destination: 'Home',
      departureTime: '',
      expectedReturnTime: '',
      escortName: parent?.firstName ? `${parent.firstName} ${parent.lastName || ''}` : 'Mr. K. Anand',
      escortRelation: parent?.relationship || 'Father',
      escortPhone: parent?.phone || '+91 94432 11002',
      parentConsentVerified: true
    });

    // Realtime notification
    publishNotification({
      title: `Hostel Outpass Requested (${passId})`,
      message: `${student?.firstName || 'Student'} requested outpass for: ${newPassForm.purpose}. Sent to ${wardenDetails.wardenName}.`,
      category: 'HOSTEL',
      severity: 'info',
      link: '/hostel/dashboard'
    });
  };

  // Handle Approve Pass (Simulation for testing)
  const handleApprovePass = (passId: string) => {
    setOutpasses(prev => prev.map(p => {
      if (p.id === passId) {
        return {
          ...p,
          status: 'APPROVED',
          approvedAt: 'Just Now',
          wardenRemarks: 'Approved by Chief Warden. Gate pass active.',
          qrCode: `FIC-PASS-${passId}-VERIFIED`
        };
      }
      return p;
    }));

    publishNotification({
      title: `Outpass Approved: ${passId}`,
      message: `Your hostel outpass has been APPROVED by ${wardenDetails.wardenName}. Gate pass slip is now ready.`,
      category: 'HOSTEL',
      severity: 'success',
      link: '/student-portal/dashboard'
    });
  };

  // Handle Meal Skip Toggle
  const handleToggleSkipMeal = (mealKey: string) => {
    if (skippedMeals.includes(mealKey)) {
      setSkippedMeals(skippedMeals.filter(m => m !== mealKey));
      publishNotification({
        title: 'Mess Meal Restored',
        message: `Your dining slot for ${mealKey} has been restored in the mess headcount.`,
        category: 'HOSTEL',
        severity: 'info'
      });
    } else {
      setSkippedMeals([...skippedMeals, mealKey]);
      publishNotification({
        title: 'Mess Meal Opt-Out Recorded',
        message: `You have opted out of ${mealKey}. Headcount adjusted to prevent food wastage.`,
        category: 'HOSTEL',
        severity: 'warning'
      });
    }
  };

  // Handle Submit Meal Feedback
  const handleSubmitMealFeedback = () => {
    if (!mealFeedbackText.trim()) return;
    setMealFeedbackModal(false);
    setMealFeedbackText('');
    publishNotification({
      title: 'Mess Feedback Acknowledged',
      message: 'Your dining feedback has been forwarded to the Mess Committee & Head Chef.',
      category: 'HOSTEL',
      severity: 'success'
    });
  };

  // Handle Payment Submit
  const handlePayHostelFee = () => {
    const amt = parseFloat(payAmountInput) || 52000;
    const newStatus = instantApprovalToggle ? 'PAID_AND_APPROVED' : 'PENDING_APPROVAL';
    const recNo = `HST-REC-2026-00${Math.floor(100 + Math.random() * 900)}`;

    setHostelFeeLedger(prev => ({
      ...prev,
      amountPaid: amt,
      balanceDue: Math.max(0, prev.totalBilled - amt),
      paymentStatus: newStatus,
      transactionId: txnRefInput || 'UPI-TXN-' + Date.now(),
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: paymentModeInput,
      receiptNo: recNo
    }));

    setPaymentModalOpen(false);

    publishNotification({
      title: instantApprovalToggle ? 'Hostel Fee Payment Verified' : 'Hostel Fee Payment Submitted',
      message: instantApprovalToggle
        ? `Payment of ₹${amt.toLocaleString()} verified! Official receipt ${recNo} is now ready to download.`
        : `Payment of ₹${amt.toLocaleString()} submitted. Awaiting Warden & Accounts approval.`,
      category: 'FEES',
      severity: 'success',
      link: '/student-portal/dashboard'
    });
  };

  // Handle Send Warden Chat
  const handleSendWardenChat = () => {
    if (!wardenChatInput.trim()) return;
    const userText = wardenChatInput;
    setWardenChatInput('');

    const newStudentMsg = {
      id: `wm-${Date.now()}`,
      sender: 'student',
      text: userText,
      time: 'Just now'
    };

    setWardenMessages(prev => [...prev, newStudentMsg]);

    // Dispatch realtime notification
    publishNotification({
      title: `Message sent to ${wardenDetails.wardenName}`,
      message: `"${userText.slice(0, 50)}..."`,
      category: 'CHAT',
      severity: 'info'
    });

    // Realistic auto-reply from warden after 1.2s
    setTimeout(() => {
      let replyText = 'Noted Advik. I have logged your request in the hostel register.';
      const lower = userText.toLowerCase();
      if (lower.includes('curfew') || lower.includes('late')) {
        replyText = 'Late entry request recorded for study hours. Please present your student ID to the security guard at the gate upon return.';
      } else if (lower.includes('fan') || lower.includes('ac') || lower.includes('repair') || lower.includes('light')) {
        replyText = 'Maintenance ticket generated. The hostel electrician / technician will inspect your room during the 02:00 PM - 04:00 PM slot.';
      } else if (lower.includes('sick') || lower.includes('fever') || lower.includes('doctor') || lower.includes('medic')) {
        replyText = 'Please visit the campus health dispensary immediately. I will notify the campus nurse Sister Margaret.';
      } else if (lower.includes('food') || lower.includes('diet') || lower.includes('mess')) {
        replyText = 'Diet preference update noted and synced with the dining hall supervisor.';
      }

      setWardenMessages(curr => [
        ...curr,
        {
          id: `wm-${Date.now() + 1}`,
          sender: 'warden',
          text: replyText,
          time: 'Just now'
        }
      ]);

      publishNotification({
        title: `Reply from ${wardenDetails.wardenName}`,
        message: replyText,
        category: 'CHAT',
        severity: 'info'
      });
    }, 1200);
  };

  const dayMenu = WEEKLY_MENU[selectedDay];

  return (
    <Box sx={{ mt: 3, mb: 4 }}>
      {/* ================= HOSTEL RESIDENT TOP BANNER ================= */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3.5,
          border: '1px solid #e2e8f0',
          background: selectedGender === 'Male'
            ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
            : 'linear-gradient(135deg, #4a044e 0%, #831843 100%)',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(15,23,42,0.18)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
          {/* Left Wing & Resident Details */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: '#ffffff'
              }}
            >
              <HotelIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff' }}>
                  {wardenDetails.wingName}
                </Typography>
                <Chip
                  icon={selectedGender === 'Male' ? <MaleIcon sx={{ fill: '#ffffff !important' }} /> : <FemaleIcon sx={{ fill: '#ffffff !important' }} />}
                  label={`${selectedGender} Wing Scholar`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', fontWeight: 800, fontSize: '0.72rem' }}
                />
                <Chip
                  label="Hostel Resident"
                  size="small"
                  sx={{ bgcolor: '#10b981', color: '#ffffff', fontWeight: 800, fontSize: '0.72rem' }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5, fontWeight: 500 }}>
                Allotted: <strong>{wardenDetails.roomBed}</strong> • Curfew Check: <strong>{wardenDetails.curfewTime}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Right Controls: Quick Gender/Wing Switcher & Warden Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Tooltip title="Preview Male vs Female Hostel Customization">
              <Button
                size="small"
                variant="outlined"
                startIcon={<SwitchGenderIcon />}
                onClick={() => setSelectedGender(selectedGender === 'Male' ? 'Female' : 'Male')}
                sx={{
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.4)',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', borderColor: '#ffffff' }
                }}
              >
                Switch to {selectedGender === 'Male' ? 'Female (Girls Wing)' : 'Male (Boys Wing)'}
              </Button>
            </Tooltip>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, bgcolor: 'rgba(255,255,255,0.12)', p: 1, px: 1.5, borderRadius: 2.5, border: '1px solid rgba(255,255,255,0.15)' }}>
              <Avatar src={wardenDetails.avatar} sx={{ width: 34, height: 34, border: '1.5px solid white' }} />
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>
                  CHIEF WARDEN
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.1, fontSize: '0.82rem' }}>
                  {wardenDetails.wardenName}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* ================= HOSTEL SUB-NAV TABS ================= */}
      <Paper elevation={0} sx={{ mt: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', overflow: 'hidden' }}>
        <Tabs
          value={subTab}
          onChange={(_, val) => setSubTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: '1px solid #e2e8f0',
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.88rem',
              textTransform: 'none',
              py: 2,
              minHeight: 56
            }
          }}
        >
          <Tab icon={<MessIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="1. Today's Meals & Weekly Food Details" />
          <Tab
            icon={
              <Badge badgeContent={outpasses.filter(p => p.status === 'APPROVED').length} color="success">
                <OutpassIcon sx={{ fontSize: 20 }} />
              </Badge>
            }
            iconPosition="start"
            label="2. Check-In & Check-Out Passes"
          />
          <Tab icon={<FeeIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="3. Hostel Fees & Official Receipt" />
          <Tab icon={<ChatIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={`4. Chat with Warden (${selectedGender === 'Male' ? 'Boys Desk' : 'Girls Desk'})`} />
        </Tabs>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* ================= SUB-TAB 0: DAILY FOOD & WEEKLY MESS MENU ================= */}
          {subTab === 0 && (
            <Box>
              {/* Top Controls: Day selector & Diet Selector */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Hostel Dining & Mess Schedule
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    4-Meal nutritional dining menu prepared by FIC Central Kitchen.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  {/* Dietary Preference Selector */}
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="diet-pref-label">My Diet Type</InputLabel>
                    <Select
                      labelId="diet-pref-label"
                      value={dietPreference}
                      label="My Diet Type"
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setDietPreference(val);
                        publishNotification({
                          title: 'Dietary Preference Updated',
                          message: `Your meal preference set to: ${val}. Dining hall pass updated.`,
                          category: 'HOSTEL',
                          severity: 'success'
                        });
                      }}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      <MenuItem value="VEG">🥗 Pure Vegetarian</MenuItem>
                      <MenuItem value="NON_VEG">🍗 Non-Veg / Egg Opt</MenuItem>
                      <MenuItem value="JAIN">🪔 Jain Special (No Root)</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    startIcon={<DiningIcon />}
                    onClick={() => setMealFeedbackModal(true)}
                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                  >
                    Mess Feedback
                  </Button>
                </Box>
              </Box>

              {/* 7-Day Day Selector Buttons */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto', pb: 1 }}>
                {(Object.keys(WEEKLY_MENU) as Array<keyof typeof WEEKLY_MENU>).map((day) => {
                  const isSelected = selectedDay === day;
                  return (
                    <Button
                      key={day}
                      size="small"
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => setSelectedDay(day)}
                      sx={{
                        borderRadius: 2.5,
                        px: 2.2,
                        py: 0.8,
                        fontWeight: 800,
                        textTransform: 'none',
                        bgcolor: isSelected ? '#0f172a' : 'transparent',
                        borderColor: isSelected ? '#0f172a' : '#cbd5e1',
                        color: isSelected ? '#ffffff' : '#475569',
                        '&:hover': {
                          bgcolor: isSelected ? '#1e293b' : '#f1f5f9'
                        }
                      }}
                    >
                      {day} {day === 'Monday' && '• Today'}
                    </Button>
                  );
                })}
              </Box>

              {/* Today's 4-Meal Cards */}
              <Grid container spacing={2.5}>
                {[
                  { key: 'Breakfast', data: dayMenu.breakfast, icon: '🥣', color: '#f59e0b', bg: '#fef3c7' },
                  { key: 'Lunch', data: dayMenu.lunch, icon: '🍲', color: '#10b981', bg: '#d1fae5' },
                  { key: 'Evening Snacks', data: dayMenu.snacks, icon: '☕', color: '#6366f1', bg: '#e0e7ff' },
                  { key: 'Dinner', data: dayMenu.dinner, icon: '🍛', color: '#ec4899', bg: '#fce7f3' }
                ].map(({ key, data: meal, icon, color, bg }) => {
                  const isSkipped = skippedMeals.includes(`${selectedDay}-${key}`);
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={key}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: 3,
                          border: isSkipped ? '2px dashed #cbd5e1' : '1px solid #e2e8f0',
                          bgcolor: isSkipped ? '#f8fafc' : '#ffffff',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          opacity: isSkipped ? 0.7 : 1,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: '0 8px 20px -4px rgba(0,0,0,0.06)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontSize: '1.4rem' }}>{icon}</Typography>
                              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                {key}
                              </Typography>
                            </Box>
                            <Chip
                              label={meal.calories}
                              size="small"
                              sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: bg, color: color }}
                            />
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: 'text.secondary', mb: 1.5 }}>
                            <TimeIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {meal.time}
                            </Typography>
                          </Box>

                          <Typography variant="body2" sx={{ color: '#334155', fontWeight: 600, minHeight: 48, lineHeight: 1.5 }}>
                            {meal.menu}
                          </Typography>

                          <Box sx={{ mt: 2, p: 1, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #f1f5f9' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}>
                              Chef Special: <span style={{ color: '#0f172a' }}>{meal.special}</span>
                            </Typography>
                          </Box>
                        </CardContent>

                        <Box sx={{ p: 2, pt: 0 }}>
                          <Button
                            fullWidth
                            size="small"
                            variant={isSkipped ? 'contained' : 'outlined'}
                            color={isSkipped ? 'secondary' : 'inherit'}
                            onClick={() => handleToggleSkipMeal(`${selectedDay}-${key}`)}
                            sx={{
                              borderRadius: 2,
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              borderColor: '#e2e8f0'
                            }}
                          >
                            {isSkipped ? '✓ Opted Out (Click to Re-Join)' : 'Skip / Out on Pass'}
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>

              {/* Diet Hygiene & Meal Guidance Banner */}
              <Paper elevation={0} sx={{ p: 2.5, mt: 3, borderRadius: 3, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 2 }}>
                <VerifiedIcon sx={{ color: '#16a34a', fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
                    100% Quality & Hygiene Inspected Daily by Campus Medical Wing
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#15803d', display: 'block' }}>
                    All dairy, grains, and produce sourced fresh daily. RO water purification log: 85 ppm TDS verified this morning.
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}

          {/* ================= SUB-TAB 1: DETAILED IN & OUT PASSES ================= */}
          {subTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Campus Check-In & Check-Out Passes
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Gate passes are authorized by Chief Warden and scanned at Security Gate 1 & 2.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<OutpassIcon />}
                  onClick={() => setRequestPassModal(true)}
                  sx={{
                    borderRadius: 2.5,
                    bgcolor: '#0f172a',
                    fontWeight: 800,
                    textTransform: 'none',
                    py: 1.1,
                    px: 2.5,
                    boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
                    '&:hover': { bgcolor: '#1e293b' }
                  }}
                >
                  Request New In/Out Pass
                </Button>
              </Box>

              {/* Active & Historical Passes Table */}
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Table>
                  <TableHead sx={{ bgcolor: '#f8fafc' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>PASS ID & TYPE</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>PURPOSE OF VISIT</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>TIMING & DESTINATION</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>PICKED UP BY / ESCORT</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>APPROVAL & WARDEN</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>STATUS</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {outpasses.map((pass) => {
                      const isApproved = pass.status === 'APPROVED';
                      const isReturned = pass.status === 'RETURNED_SAFE';
                      const isPending = pass.status === 'PENDING_APPROVAL';

                      return (
                        <TableRow key={pass.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                              {pass.id}
                            </Typography>
                            <Chip
                              label={pass.type}
                              size="small"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, mt: 0.5, bgcolor: '#e0e7ff', color: '#4338ca' }}
                            />
                          </TableCell>

                          <TableCell sx={{ maxWidth: 220 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              {pass.purpose}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b' }}>
                              Destination: {pass.destination}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: '#334155' }}>
                              <strong>Out:</strong> {pass.departureTime}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, color: '#334155' }}>
                              <strong>In:</strong> {pass.expectedReturnTime}
                            </Typography>
                            {pass.actualReturnTime !== '-' && (
                              <Typography variant="caption" sx={{ display: 'block', color: '#16a34a', fontWeight: 700 }}>
                                <strong>Actual Return:</strong> {pass.actualReturnTime}
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                              <PersonIcon sx={{ fontSize: 16, color: '#64748b' }} />
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                {pass.escortName}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 2.8 }}>
                              Relation: {pass.escortRelation} • {pass.escortPhone}
                            </Typography>
                            {pass.escortIdVerified && (
                              <Chip label="Govt ID Verified" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#dcfce7', color: '#15803d', mt: 0.5, ml: 2.8 }} />
                            )}
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                              {pass.approvedByName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {pass.approverRole}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', display: 'block' }}>
                              Stamp: {pass.approvedAt}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {isApproved && (
                              <Chip
                                icon={<CheckIcon sx={{ fontSize: 14 }} />}
                                label="Approved (Clear to Exit)"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                              />
                            )}
                            {isReturned && (
                              <Chip
                                icon={<CheckIcon sx={{ fontSize: 14 }} />}
                                label="Returned Safe"
                                size="small"
                                sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#f1f5f9', color: '#475569' }}
                              />
                            )}
                            {isPending && (
                              <Chip
                                icon={<TimeIcon sx={{ fontSize: 14 }} />}
                                label="Pending Warden Review"
                                size="small"
                                color="warning"
                                sx={{ fontWeight: 800, fontSize: '0.7rem' }}
                              />
                            )}
                          </TableCell>

                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<QrCodeIcon />}
                                onClick={() => setSelectedPassForQR(pass)}
                                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '0.72rem' }}
                              >
                                Gate Slip QR
                              </Button>
                              {isPending && (
                                <Tooltip title="Fast-Approve Simulation">
                                  <Button
                                    size="small"
                                    variant="contained"
                                    color="success"
                                    onClick={() => handleApprovePass(pass.id)}
                                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '0.72rem' }}
                                  >
                                    Approve
                                  </Button>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* ================= SUB-TAB 2: HOSTEL FEES & OFFICIAL RECEIPT ================= */}
          {subTab === 2 && (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Hostel Residency Fee Ledger & Receipts
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review official fee demands, complete online payments, and download authenticated receipts.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {hostelFeeLedger.paymentStatus !== 'PAID_AND_APPROVED' ? (
                    <Button
                      variant="contained"
                      startIcon={<FeeIcon />}
                      onClick={() => setPaymentModalOpen(true)}
                      sx={{ borderRadius: 2.5, bgcolor: '#0f172a', fontWeight: 800, textTransform: 'none', px: 2.5 }}
                    >
                      Pay Hostel Fee
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ReceiptIcon />}
                      onClick={() => setReceiptModalOpen(true)}
                      sx={{
                        borderRadius: 2.5,
                        bgcolor: '#4338ca',
                        fontWeight: 800,
                        textTransform: 'none',
                        px: 2.5,
                        py: 1,
                        boxShadow: '0 4px 12px rgba(67,56,202,0.25)',
                        '&:hover': { bgcolor: '#3730a3' }
                      }}
                    >
                      Generate Official Hostel Receipt
                    </Button>
                  )}
                </Box>
              </Box>

              {/* Status Header Cards */}
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>TOTAL HOSTEL CHARGES (TERM 2)</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                      ₹{hostelFeeLedger.totalBilled.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, mt: 0.5, display: 'block' }}>
                      All-Inclusive: Room + 4-Meal Mess + Laundry + Power
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>AMOUNT PAID & VERIFIED</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#16a34a', mt: 0.5 }}>
                      ₹{hostelFeeLedger.amountPaid.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
                      Ref: {hostelFeeLedger.transactionId} • {hostelFeeLedger.paymentDate}
                    </Typography>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>CLEARANCE & RECEIPT STATUS</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                        label="Approved & Cleared"
                        color="success"
                        sx={{ fontWeight: 800, fontSize: '0.82rem' }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#475569', display: 'block', mt: 1 }}>
                      Receipt: <strong>{hostelFeeLedger.receiptNo}</strong> (Download Ready)
                    </Typography>
                  </Card>
                </Grid>
              </Grid>

              {/* Itemized Fee Structure Table */}
              <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <Box sx={{ p: 2, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                    Term 2 Hostel Fee Itemization & Payment Audit
                  </Typography>
                  <Chip label="Academic Year 2026-2027" size="small" sx={{ fontWeight: 700, bgcolor: '#ffffff', border: '1px solid #cbd5e1' }} />
                </Box>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#ffffff' }}>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>FEE COMPONENT</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#475569' }}>DESCRIPTION & COVERAGE</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#475569' }}>AMOUNT (INR)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#475569' }}>STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Hostel Room Rent</TableCell>
                      <TableCell color="text.secondary">Air-Cooled Twin Sharing Room with Attached Balcony & Study Desk</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>₹{hostelFeeLedger.rentAmount.toLocaleString()}</TableCell>
                      <TableCell align="right"><Chip label="Paid" size="small" color="success" sx={{ fontWeight: 700 }} /></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>4-Meal Central Dining & Mess</TableCell>
                      <TableCell color="text.secondary">Breakfast, Lunch, Evening Snacks & Dinner for 180 Term Days</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>₹{hostelFeeLedger.messAmount.toLocaleString()}</TableCell>
                      <TableCell align="right"><Chip label="Paid" size="small" color="success" sx={{ fontWeight: 700 }} /></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Amenities, Laundry & 24/7 Power</TableCell>
                      <TableCell color="text.secondary">High-speed Campus WiFi, Steam Laundry (60 clothes/mo), Backup Generator</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>₹{hostelFeeLedger.amenitiesAmount.toLocaleString()}</TableCell>
                      <TableCell align="right"><Chip label="Paid" size="small" color="success" sx={{ fontWeight: 700 }} /></TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>Refundable Caution Deposit</TableCell>
                      <TableCell color="text.secondary">One-time security deposit (Refundable upon course completion)</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>₹{hostelFeeLedger.cautionDeposit.toLocaleString()}</TableCell>
                      <TableCell align="right"><Chip label="Paid" size="small" color="success" sx={{ fontWeight: 700 }} /></TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      <TableCell colSpan={2} sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>TOTAL BILLED & SETTLED</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>₹{hostelFeeLedger.totalBilled.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<ReceiptIcon />}
                          onClick={() => setReceiptModalOpen(true)}
                          sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', bgcolor: '#4338ca' }}
                        >
                          Print Receipt
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>
            </Box>
          )}

          {/* ================= SUB-TAB 3: CHAT WITH WARDEN (GENDER-CUSTOMIZED) ================= */}
          {subTab === 3 && (
            <Box>
              <Grid container spacing={3}>
                {/* Left: Warden Profile & Emergency Contact Info */}
                <Grid item xs={12} md={4}>
                  <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                    <Box sx={{ textAlign: 'center', mb: 2.5 }}>
                      <Avatar
                        src={wardenDetails.avatar}
                        sx={{
                          width: 84,
                          height: 84,
                          mx: 'auto',
                          mb: 1.5,
                          border: '3px solid #e2e8f0',
                          boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
                        {wardenDetails.wardenName}
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                        {wardenDetails.wardenTitle}
                      </Typography>
                      <Chip
                        icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                        label="Active On-Duty Warden"
                        size="small"
                        color="success"
                        sx={{ mt: 1, fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <RoomIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>OFFICE LOCATION</Typography>
                          <Typography variant="body2" fontWeight={700} color="#1e293b">{wardenDetails.wardenOffice}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <PhoneIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>DIRECT EMERGENCY PHONE</Typography>
                          <Typography variant="body2" fontWeight={700} color="#1e293b">{wardenDetails.wardenPhone}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SecurityIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>GATE SECURITY DESK</Typography>
                          <Typography variant="body2" fontWeight={700} color="#1e293b">{wardenDetails.securityGate}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <TimeIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>NIGHT ROLL CALL CURFEW</Typography>
                          <Typography variant="body2" fontWeight={700} color="#b45309">{wardenDetails.curfewTime}</Typography>
                        </Box>
                      </Box>
                    </Stack>

                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600, display: 'block' }}>
                        Supervisor: <strong>{wardenDetails.assistantName}</strong>
                      </Typography>
                    </Box>
                  </Card>
                </Grid>

                {/* Right: Interactive Live Conversation Console */}
                <Grid item xs={12} md={8}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3.5,
                      border: '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                      height: 540,
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    {/* Chat Header */}
                    <Box sx={{ p: 2, px: 2.5, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8fafc' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar src={wardenDetails.avatar} sx={{ width: 40, height: 40 }} />
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            {wardenDetails.wardenName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} />
                            Online at Resident Warden Desk
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={selectedGender === 'Male' ? 'Boys Wing Desk' : 'Girls Wing Desk'}
                        size="small"
                        sx={{ fontWeight: 800, bgcolor: selectedGender === 'Male' ? '#dbeafe' : '#fce7f3', color: selectedGender === 'Male' ? '#1e40af' : '#9d174d' }}
                      />
                    </Box>

                    {/* Messages Body */}
                    <Box sx={{ flex: 1, p: 2.5, overflowY: 'auto', bgcolor: '#fcfcfd' }}>
                      <Stack spacing={2}>
                        {wardenMessages.map((msg) => {
                          const isStudent = msg.sender === 'student';
                          return (
                            <Box
                              key={msg.id}
                              sx={{
                                display: 'flex',
                                justifyContent: isStudent ? 'flex-end' : 'flex-start'
                              }}
                            >
                              <Box
                                sx={{
                                  maxWidth: '78%',
                                  p: 1.8,
                                  px: 2.2,
                                  borderRadius: 3,
                                  borderTopRightRadius: isStudent ? 0.5 : 3,
                                  borderTopLeftRadius: !isStudent ? 0.5 : 3,
                                  bgcolor: isStudent ? '#0f172a' : '#ffffff',
                                  color: isStudent ? '#ffffff' : '#1e293b',
                                  border: isStudent ? 'none' : '1px solid #e2e8f0',
                                  boxShadow: isStudent ? '0 4px 12px rgba(15,23,42,0.15)' : '0 2px 6px rgba(0,0,0,0.03)'
                                }}
                              >
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 800, mb: 0.5, color: isStudent ? '#94a3b8' : '#6366f1', fontSize: '0.7rem' }}>
                                  {isStudent ? 'You (Advik A - Room 204)' : wardenDetails.wardenName}
                                </Typography>
                                <Typography variant="body2" sx={{ lineHeight: 1.5, fontWeight: 500 }}>
                                  {msg.text}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.8, color: isStudent ? '#94a3b8' : '#94a3b8', fontSize: '0.65rem' }}>
                                  {msg.time}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                        <div ref={chatScrollBottomRef} />
                      </Stack>
                    </Box>

                    {/* Quick Assistance Chips */}
                    <Box sx={{ p: 1.5, px: 2, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 1, overflowX: 'auto', bgcolor: '#ffffff' }}>
                      {[
                        'Request Late Curfew Entry (Exam Study)',
                        'Report Room Fan / AC Electrical Issue',
                        'Dispensary Visit Clearance',
                        'Diet Preference Adjustment'
                      ].map((promptText) => (
                        <Chip
                          key={promptText}
                          label={promptText}
                          size="small"
                          onClick={() => setWardenChatInput(promptText)}
                          sx={{
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: '#f1f5f9',
                            color: '#334155',
                            '&:hover': { bgcolor: '#e2e8f0' }
                          }}
                        />
                      ))}
                    </Box>

                    {/* Input Bar */}
                    <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 1.5, bgcolor: '#ffffff' }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={`Message ${wardenDetails.wardenName}...`}
                        value={wardenChatInput}
                        onChange={(e) => setWardenChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSendWardenChat();
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2.5
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleSendWardenChat}
                        sx={{
                          borderRadius: 2.5,
                          px: 2.5,
                          bgcolor: '#0f172a',
                          minWidth: 50,
                          '&:hover': { bgcolor: '#1e293b' }
                        }}
                      >
                        <SendIcon fontSize="small" />
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* ================= MODAL: REQUEST IN/OUT PASS ================= */}
      <Dialog
        open={requestPassModal}
        onClose={() => setRequestPassModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          Request Hostel Check-In / Check-Out Gate Pass
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2.5} sx={{ mt: 0.2 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Pass Type</InputLabel>
                <Select
                  value={newPassForm.type}
                  label="Pass Type"
                  onChange={(e) => setNewPassForm({ ...newPassForm, type: e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Weekend Home Visit">Weekend Home Visit (Overnight Leave)</MenuItem>
                  <MenuItem value="Day Outpass">Day Outpass (Local City Visit)</MenuItem>
                  <MenuItem value="Medical Appointment">Medical Appointment / Clinic Visit</MenuItem>
                  <MenuItem value="Academic Project">Academic Library & Project Research</MenuItem>
                  <MenuItem value="Coaching / Tuition">Evening Coaching / Competitive Exam</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Destination Address / City"
                value={newPassForm.destination}
                onChange={(e) => setNewPassForm({ ...newPassForm, destination: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Specific Purpose of Visit (Detailed Reason)"
                placeholder="e.g. Attending cousin's wedding ceremony in Chennai with family."
                value={newPassForm.purpose}
                onChange={(e) => setNewPassForm({ ...newPassForm, purpose: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Departure Date & Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={newPassForm.departureTime}
                onChange={(e) => setNewPassForm({ ...newPassForm, departureTime: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Expected Return Date & Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={newPassForm.expectedReturnTime}
                onChange={(e) => setNewPassForm({ ...newPassForm, expectedReturnTime: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }}>
                <Chip label="Pick Up & Escort Details (Mandatory)" size="small" sx={{ fontWeight: 700 }} />
              </Divider>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Picked Up By (Escort Full Name)"
                value={newPassForm.escortName}
                onChange={(e) => setNewPassForm({ ...newPassForm, escortName: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Relationship</InputLabel>
                <Select
                  value={newPassForm.escortRelation}
                  label="Relationship"
                  onChange={(e) => setNewPassForm({ ...newPassForm, escortRelation: e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="Father">Father</MenuItem>
                  <MenuItem value="Mother">Mother</MenuItem>
                  <MenuItem value="Local Guardian">Local Guardian</MenuItem>
                  <MenuItem value="Authorized Relative">Authorized Relative (ID Proof)</MenuItem>
                  <MenuItem value="Self">Self (Day Pass Only)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Escort Contact Phone"
                value={newPassForm.escortPhone}
                onChange={(e) => setNewPassForm({ ...newPassForm, escortPhone: e.target.value })}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newPassForm.parentConsentVerified}
                      onChange={(e) => setNewPassForm({ ...newPassForm, parentConsentVerified: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      I confirm that parent verbal / SMS consent has been obtained. Chief Warden {wardenDetails.wardenName} will cross-verify prior to departure.
                    </Typography>
                  }
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setRequestPassModal(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRequestOutpassSubmit}
            sx={{
              borderRadius: 2.5,
              bgcolor: '#0f172a',
              fontWeight: 800,
              textTransform: 'none',
              px: 3,
              '&:hover': { bgcolor: '#1e293b' }
            }}
          >
            Submit to Warden Desk
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: DIGITAL GATE PASS SLIP / QR BADGE ================= */}
      <Dialog
        open={Boolean(selectedPassForQR)}
        onClose={() => setSelectedPassForQR(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Digital Gate Pass & Security Verification</span>
          <IconButton size="small" onClick={() => setSelectedPassForQR(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPassForQR && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '2px solid #0f172a',
                  bgcolor: '#ffffff',
                  textAlign: 'center',
                  boxShadow: '0 8px 24px -4px rgba(0,0,0,0.08)'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', letterSpacing: 1.2 }}>
                  FORGE INDIA CONNECT / CAMPUS SECURITY GATE PASS
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', my: 0.5 }}>
                  {selectedPassForQR.type.toUpperCase()}
                </Typography>
                <Chip
                  label={`Pass #${selectedPassForQR.id}`}
                  size="small"
                  sx={{ fontFamily: 'monospace', fontWeight: 800, bgcolor: '#f1f5f9', color: '#0f172a', mb: 2 }}
                />

                {/* Simulated Scannable QR Code */}
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    mx: 'auto',
                    mb: 2,
                    p: 1.5,
                    border: '2px dashed #94a3b8',
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <QrCodeIcon sx={{ fontSize: 100, color: '#0f172a' }} />
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.62rem', fontWeight: 800 }}>
                    {selectedPassForQR.qrCode}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={1.5} sx={{ textAlign: 'left' }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">STUDENT NAME</Typography>
                    <Typography variant="subtitle2" fontWeight={800}>{student?.firstName} {student?.lastName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">ALLOTTED ROOM</Typography>
                    <Typography variant="subtitle2" fontWeight={800}>{wardenDetails.roomBed}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">SCHEDULED OUT-TIME</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedPassForQR.departureTime}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">EXPECTED IN-TIME</Typography>
                    <Typography variant="body2" fontWeight={700} color="#b45309">{selectedPassForQR.expectedReturnTime}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">PICKED UP BY</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedPassForQR.escortName} ({selectedPassForQR.escortRelation})</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">ESCORT CONTACT</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedPassForQR.escortPhone}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">AUTHORIZED BY</Typography>
                    <Typography variant="body2" fontWeight={800} color="#166534">
                      ✓ {selectedPassForQR.approvedByName} ({selectedPassForQR.approverRole})
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ borderRadius: 2, bgcolor: '#0f172a', fontWeight: 700, textTransform: 'none' }}
          >
            Print Gate Slip
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: PAY HOSTEL FEE ONLINE ================= */}
      <Dialog
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          Pay Term 2 Hostel Residency Fees
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f0fdf4', borderRadius: 2.5, border: '1px solid #bbf7d0' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>AMOUNT PAYABLE (TERM 2 DUES)</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#166534', mt: 0.5 }}>
              ₹{hostelFeeLedger.totalBilled.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#15803d' }}>
              Includes Room Rent, 4-Meal Mess, Amenities & Caution Deposit
            </Typography>
          </Box>

          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Mode</InputLabel>
              <Select
                value={paymentModeInput}
                label="Payment Mode"
                onChange={(e) => setPaymentModeInput(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="UPI">Instant UPI (Google Pay, PhonePe, Paytm)</MenuItem>
                <MenuItem value="NetBanking">NetBanking (HDFC, SBI, ICICI, Axis)</MenuItem>
                <MenuItem value="Card">Debit / Credit Card</MenuItem>
                <MenuItem value="Bank Transfer">NEFT / RTGS Wire Transfer</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Transaction Reference / UTR Number"
              value={txnRefInput}
              onChange={(e) => setTxnRefInput(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={instantApprovalToggle}
                    onChange={(e) => setInstantApprovalToggle(e.target.checked)}
                    color="success"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Instant Warden & Accounts Verification (Enable Immediate Receipt Generation)
                  </Typography>
                }
              />
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setPaymentModalOpen(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handlePayHostelFee}
            sx={{ borderRadius: 2.5, fontWeight: 800, textTransform: 'none', px: 3 }}
          >
            Confirm & Record Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: OFFICIAL INSTITUTIONAL HOSTEL RECEIPT ================= */}
      <Dialog
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Official Hostel Residency Fee Receipt</span>
          <IconButton size="small" onClick={() => setReceiptModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4 },
              borderRadius: 3,
              border: '2px solid #0f172a',
              bgcolor: '#ffffff',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)'
            }}
          >
            {/* Receipt Header */}
            <Box sx={{ borderBottom: '2px solid #0f172a', pb: 2.5, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
                    FORGE INDIA CONNECT PUBLIC SCHOOL
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mt: 0.3 }}>
                    Affiliated to CBSE • Autonomous Residential Campus • Institution Code: FIC-2026-HQ
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    Main Campus Residency Road, Tamil Nadu, India • Ph: +91 44 2819 0000 • hostel@ficschool.edu
                  </Typography>
                </Box>
                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                  <Chip
                    label="OFFICIAL HOSTEL RECEIPT"
                    sx={{ fontWeight: 900, bgcolor: '#0f172a', color: '#ffffff', fontSize: '0.75rem', height: 26, mb: 0.5 }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    Receipt No: {hostelFeeLedger.receiptNo}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                    Date: {hostelFeeLedger.paymentDate}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Student & Residency Metadata */}
            <Grid container spacing={2} sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2.5, border: '1px solid #e2e8f0' }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">STUDENT NAME & ROLL NUMBER</Typography>
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                  {student?.firstName} {student?.lastName} ({student?.studentId || 'STU-2026-000006'})
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Class: {student?.class || '10'}-{student?.section || 'A'} • Academic Year: {hostelFeeLedger.academicYear}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">HOSTEL WING & ROOM ALLOCATION</Typography>
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                  {wardenDetails.wingName}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Allotted: <strong>{wardenDetails.roomBed}</strong>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">PARENT / GUARDIAN</Typography>
                <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                  {parent?.firstName ? `${parent.firstName} ${parent.lastName || ''}` : 'Mr. K. Anand'} ({parent?.relationship || 'Father'})
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">PAYMENT REFERENCE</Typography>
                <Typography variant="subtitle2" fontWeight={700} color="#1e293b">
                  {hostelFeeLedger.transactionId} ({hostelFeeLedger.paymentMode})
                </Typography>
              </Grid>
            </Grid>

            {/* Itemized Table */}
            <TableContainer sx={{ mb: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#0f172a' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800 }}>#</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800 }}>FEE PARTICULARS</TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 800 }}>DURATION / TERM</TableCell>
                    <TableCell align="right" sx={{ color: '#ffffff', fontWeight: 800 }}>AMOUNT (INR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Hostel Room Rent (Twin Sharing Air-Cooled)</TableCell>
                    <TableCell>Term 2 (6 Months)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>₹{hostelFeeLedger.rentAmount.toLocaleString()}.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Central Dining & Mess Charges (4 Daily Meals)</TableCell>
                    <TableCell>Term 2 (180 Days)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>₹{hostelFeeLedger.messAmount.toLocaleString()}.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Amenities, Power Backup & Steam Laundry</TableCell>
                    <TableCell>Term 2</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>₹{hostelFeeLedger.amenitiesAmount.toLocaleString()}.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>4</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Hostel Caution Deposit (Refundable)</TableCell>
                    <TableCell>One-Time</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>₹{hostelFeeLedger.cautionDeposit.toLocaleString()}.00</TableCell>
                  </TableRow>
                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 900, color: '#0f172a', fontSize: '0.95rem' }}>
                      TOTAL AMOUNT PAID & VERIFIED
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 900, color: '#0f172a', fontSize: '1.05rem' }}>
                      ₹{hostelFeeLedger.amountPaid.toLocaleString()}.00
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#475569', display: 'block', mb: 4 }}>
              Amount in Words: <strong>Rupees Fifty-Two Thousand Only.</strong>
            </Typography>

            {/* Signatures & Official Stamp */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pt: 2, borderTop: '1px solid #e2e8f0' }}>
              <Box sx={{ textAlign: 'center', width: 200 }}>
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: '50%',
                    border: '2px dashed #059669',
                    mx: 'auto',
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669'
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.62rem', textAlign: 'center' }}>
                    OFFICIAL<br />SEAL<br />VERIFIED
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>CAMPUS ACCOUNTS OFFICE</Typography>
              </Box>

              <Box sx={{ textAlign: 'center', width: 220 }}>
                <Typography variant="caption" sx={{ fontFamily: 'cursive', fontSize: '1.1rem', color: '#1e3a8a', display: 'block', mb: 0.5 }}>
                  {wardenDetails.wardenName}
                </Typography>
                <Divider sx={{ my: 0.5 }} />
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#0f172a', display: 'block' }}>
                  {wardenDetails.wardenName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {wardenDetails.wardenTitle}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => window.print()}
            sx={{ borderRadius: 2, bgcolor: '#0f172a', fontWeight: 700, textTransform: 'none' }}
          >
            Print Receipt
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => {
              publishNotification({
                title: 'Receipt PDF Downloaded',
                message: `Hostel Receipt ${hostelFeeLedger.receiptNo} saved to your device.`,
                category: 'FEES',
                severity: 'success'
              });
              setReceiptModalOpen(false);
            }}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= MODAL: SUBMIT MEAL FEEDBACK ================= */}
      <Dialog
        open={mealFeedbackModal}
        onClose={() => setMealFeedbackModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>
          Submit Mess & Dining Feedback
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Overall Food Quality Rating</InputLabel>
              <Select
                value={mealRating}
                label="Overall Food Quality Rating"
                onChange={(e) => setMealRating(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="5">⭐⭐⭐⭐⭐ Excellent Taste & Freshness</MenuItem>
                <MenuItem value="4">⭐⭐⭐⭐ Good Taste & Balanced Nutrition</MenuItem>
                <MenuItem value="3">⭐⭐⭐ Satisfactory</MenuItem>
                <MenuItem value="2">⭐⭐ Needs Improvement in Seasoning</MenuItem>
                <MenuItem value="1">⭐ Unsatisfactory / Report Hygiene</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Your Remarks or Special Dish Request"
              placeholder="e.g. Please add extra curd during afternoon lunch on hot days."
              value={mealFeedbackText}
              onChange={(e) => setMealFeedbackText(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setMealFeedbackModal(false)} sx={{ fontWeight: 700, textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitMealFeedback}
            sx={{ borderRadius: 2.5, bgcolor: '#0f172a', fontWeight: 800, textTransform: 'none', px: 3 }}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HostelStudentSection;
