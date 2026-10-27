import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './core/layout/AppLayout';
import LoginPage from './modules/auth/pages/LoginPage';
import AcceptInvitation from './modules/auth/pages/AcceptInvitation';
import RegisterSchool from './modules/landing/pages/RegisterSchool';
import VerifySchool from './modules/landing/pages/VerifySchool';
import OrganizationDashboard from './modules/organization/pages/OrganizationDashboard';
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import AdminProfile from './modules/admin/pages/AdminProfile';
import AdminSettingsShell from './modules/admin/pages/AdminSettingsShell';
import UserManagement from './modules/admin/pages/UserManagement';
import StudentList from './modules/students/pages/StudentList';
import StudentAdmissionWizard from './modules/students/pages/StudentAdmissionWizard';
import StudentProfileShell from './modules/students/pages/StudentProfileShell';
import AcademicYearList from './modules/academic/pages/AcademicYearList';
import ClassList from './modules/academic/pages/ClassList';
import ClassDetail from './modules/academic/pages/ClassDetail';
import SubjectList from './modules/academic/pages/SubjectList';
import TeacherAssignments from './modules/academic/pages/TeacherAssignments';
import TermManager from './modules/academic/pages/TermManager';
import SubjectGroupManager from './modules/academic/pages/SubjectGroupManager';
import SyllabusManager from './modules/academic/pages/SyllabusManager';
import ClassroomAllocationManager from './modules/academic/pages/ClassroomAllocationManager';
import AcademicEventManager from './modules/academic/pages/AcademicEventManager';
import StaffList from './modules/staff/pages/StaffList';
import DepartmentDesignationManager from './modules/staff/pages/DepartmentDesignationManager';
import StaffOnboardingWizard from './modules/staff/pages/StaffOnboardingWizard';
import StaffProfileShell from './modules/staff/pages/StaffProfileShell';
import DesignSystemShowcase from './core/pages/DesignSystemShowcase';
import SchoolOnboardingWizard from './modules/organization/pages/SchoolOnboardingWizard';
import AcademicDashboard from './modules/academic/pages/AcademicDashboard';
import BulkPromotionWizard from './modules/academic/pages/BulkPromotionWizard';
import AdmissionApplicationWizard from './modules/admission/pages/AdmissionApplicationWizard';
import AdmissionReviewDashboard from './modules/admission/pages/AdmissionReviewDashboard';
import StudentProfileDashboard from './modules/students/pages/StudentProfileDashboard';
import OfficeStaffDashboard from './modules/hr/pages/OfficeStaffDashboard';
import StaffDocumentVault from './modules/hr/pages/StaffDocumentVault';
import OfficeDocumentVault from './modules/hr/pages/OfficeDocumentVault';
import AdminDocumentVault from './modules/admin/pages/AdminDocumentVault';
import StaffResignationPortal from './modules/hr/pages/StaffResignationPortal';
import OfficeCircularsDesk from './modules/operations/pages/OfficeCircularsDesk';
import StudentNoDueDesk from './modules/operations/pages/StudentNoDueDesk';
import PublicExamDesk from './modules/examination/pages/PublicExamDesk';
import StudentDashboard from './modules/students/pages/StudentDashboard';
import StudentFeeDashboard from './modules/finance/pages/StudentFeeDashboard';
import SuperAdminDashboard from './modules/super-admin/pages/SuperAdminDashboard';
import TenantManagement from './modules/super-admin/pages/TenantManagement';
import PlanManagement from './modules/super-admin/pages/PlanManagement';
import SubscriptionManagement from './modules/super-admin/pages/SubscriptionManagement';
import PlanFeatureManager from './modules/super-admin/pages/PlanFeatureManager';
import InvoiceManagement from './modules/super-admin/pages/InvoiceManagement';
import PaymentManagement from './modules/super-admin/pages/PaymentManagement';
import CouponManagement from './modules/super-admin/pages/CouponManagement';
import SupportTicketDesk from './modules/super-admin/pages/SupportTicketDesk';
import PlatformAnnouncements from './modules/super-admin/pages/PlatformAnnouncements';
import RevenueAnalytics from './modules/super-admin/pages/RevenueAnalytics';
import FeatureFlags from './modules/super-admin/pages/FeatureFlags';
import PlatformSettings from './modules/super-admin/pages/PlatformSettings';
import AuditLogViewer from './modules/super-admin/pages/AuditLogViewer';
import SystemHealth from './modules/super-admin/pages/SystemHealth';
import SchoolDetail360 from './modules/super-admin/pages/SchoolDetail360';
import StudentDirectory from './modules/students/pages/StudentDirectory';
import StudentLifecycleView from './modules/students/pages/StudentLifecycleView';
import ParentManagement from './modules/students/pages/ParentManagement';
import ParentProfile from './modules/students/pages/ParentProfile';
import ParentPortalDashboard from './modules/parent-portal/pages/ParentPortalDashboard';
import ParentMeetings from './modules/parent-portal/pages/ParentMeetings';
import ParentHomeworkView from './modules/parent-portal/pages/ParentHomeworkView';
import ParentMessages from './modules/parent-portal/pages/ParentMessages';
import TeacherMessages from './modules/academic/pages/teacher/TeacherMessages';
import StaffPortalDashboard from './modules/staff-portal/pages/StaffPortalDashboard';
import StaffFinancePortal from './modules/staff-portal/pages/StaffFinancePortal';
import StudentPortalDashboard from './modules/students/pages/StudentPortalDashboard';
import StudentSettingsView from './modules/students/pages/StudentSettingsView';
import StudentHomeworkView from './modules/students/pages/StudentHomeworkView';
import HomeworkGrading from './modules/academic/pages/HomeworkGrading';

// Phase 117 LMS
import TeacherLMSDashboard from './modules/lms/pages/TeacherLMSDashboard';
import AssignmentManager from './modules/lms/pages/AssignmentManager';
import AssignmentForm from './modules/lms/pages/AssignmentForm';
import StudentLMSDashboard from './modules/lms/pages/StudentLMSDashboard';
import SubmissionDesk from './modules/lms/pages/SubmissionDesk';
import StudentAssignmentView from './modules/lms/pages/StudentAssignmentView';
import LearningMaterialManager from './modules/lms/pages/LearningMaterialManager';

// Phase 108: Academic
import OnlineClassesManager from './modules/academic/pages/OnlineClassesManager';

// Phase 108: Examination (Imports removed since they exist below)


import TeacherMeetingDashboard from './modules/hr/pages/TeacherMeetingDashboard';
import InventoryDashboard from './modules/inventory/pages/InventoryDashboard';
import ProductCatalog from './modules/inventory/pages/ProductCatalog';
import StockLedger from './modules/inventory/pages/StockLedger';
import StockOperations from './modules/inventory/pages/StockOperations';
import ProcurementDashboard from './modules/procurement/pages/ProcurementDashboard';
import QuotationManager from './modules/procurement/pages/QuotationManager';
import PurchaseOrderManager from './modules/procurement/pages/PurchaseOrderManager';
import GoodsReceiving from './modules/procurement/pages/GoodsReceiving';
import RFQManager from './modules/procurement/pages/RFQManager';
import QuotationComparison from './modules/procurement/pages/QuotationComparison';
import InvoiceMatchingDesk from './modules/procurement/pages/InvoiceMatchingDesk';
import AssetRegister from './modules/assets/pages/AssetRegister';
import AssetOperations from './modules/assets/pages/AssetOperations';
import AssetMaintenance from './modules/assets/pages/AssetMaintenance';

// Health & Medical
import HealthDashboard from './modules/health/pages/HealthDashboard';
import StudentHealthProfiles from './modules/health/pages/StudentHealthProfiles';
import ClinicDesk from './modules/health/pages/ClinicDesk';
import MedicationManager from './modules/health/pages/MedicationManager';
import HealthScreeningDesk from './modules/health/pages/HealthScreeningDesk';
import EmergencyManager from './modules/health/pages/EmergencyManager';

// Safety & Security
import SafetyDashboard from './modules/safety/pages/SafetyDashboard';
import SecurityDashboard from './modules/safety/pages/SecurityDashboard';
import EmergencyCommandCenter from './modules/safety/pages/EmergencyCommandCenter';
import RiskAndInspectionManager from './modules/safety/pages/RiskAndInspectionManager';
import IncidentManager from './modules/safety/pages/IncidentManager';

// Events
import EventDashboard from './modules/events/pages/EventDashboard';
import EventCalendar from './modules/events/pages/EventCalendar';
import EventRegistrationHub from './modules/events/pages/EventRegistrationHub';
import CulturalFestivals from './modules/events/pages/CulturalFestivals';
import CompetitionManager from './modules/events/pages/CompetitionManager';
import TripManager from './modules/events/pages/TripManager';
import ClubManager from './modules/events/pages/ClubManager';

// Engagement
import HouseManager from './modules/engagement/pages/HouseManager';
import ElectionDashboard from './modules/engagement/pages/ElectionDashboard';
import AchievementManager from './modules/engagement/pages/AchievementManager';
import StudentPortfolioView from './modules/engagement/pages/StudentPortfolioView';

// Career & Placement
import CareerDashboard from './modules/career/pages/CareerDashboard';
import CounselingPortal from './modules/career/pages/CounselingPortal';
import HigherEdTracker from './modules/career/pages/HigherEdTracker';
import PlacementDriveManager from './modules/career/pages/PlacementDriveManager';
import StudentCareerHub from './modules/career/pages/StudentCareerHub';

// Operations & Control Center
import ControlCenterDashboard from './modules/operations/pages/ControlCenterDashboard';
import TaskBoard from './modules/operations/pages/TaskBoard';
import ApprovalInbox from './modules/operations/pages/ApprovalInbox';
import RequestPortal from './modules/operations/pages/RequestPortal';
// Asset & Facilities
import AssetDashboard from './modules/assets/pages/AssetDashboard';
import AssetRegistry from './modules/assets/pages/AssetRegistry';
import MaintenanceDashboard from './modules/assets/pages/MaintenanceDashboard';
import WorkOrderKanban from './modules/assets/pages/WorkOrderKanban';
import FacilityDashboard from './modules/organization/pages/FacilityDashboard';
import FacilityBookingCalendar from './modules/organization/pages/FacilityBookingCalendar';
import SchoolDirectory from './modules/organization/pages/SchoolDirectory';
import SchoolProfile from './modules/organization/pages/SchoolProfile';


// Health & Wellness
import MedicalVisits from './modules/health/pages/MedicalVisits';
import FirstAidLog from './modules/health/pages/FirstAidLog';
import ImmunizationTracker from './modules/health/pages/ImmunizationTracker';
import MedicalAlerts from './modules/health/pages/MedicalAlerts';
import EmergencyContacts from './modules/health/pages/EmergencyContacts';
import HealthIncidents from './modules/health/pages/HealthIncidents';
import WellnessPrograms from './modules/health/pages/WellnessPrograms';

// Campus Security
import WatchmanDashboard from './modules/security/pages/WatchmanDashboard';
import CampusSecurityDashboard from './modules/security/pages/CampusSecurityDashboard';
import VisitorRegistration from './modules/security/pages/VisitorRegistration';
import VisitorPreRegistration from './modules/security/pages/VisitorPreRegistration';
import StudentPickupManager from './modules/security/pages/StudentPickupManager';
import VehicleManager from './modules/security/pages/VehicleManager';
import GatePassManager from './modules/security/pages/GatePassManager';
import DeliveryManager from './modules/security/pages/DeliveryManager';
import SecurityIncidents from './modules/security/pages/SecurityIncidents';
import LockdownManager from './modules/security/pages/LockdownManager';
import GuardShiftManager from './modules/security/pages/GuardShiftManager';
import LostFoundManager from './modules/security/pages/LostFoundManager';
import AccessAudit from './modules/security/pages/AccessAudit';


// Vendor components
import VendorDirectory from './modules/vendors/pages/VendorDirectory';
import VendorPerformance from './modules/vendors/pages/VendorPerformance';
import HRDashboard from './modules/hr/pages/HRDashboard';
import OfficeRecordMaintenance from './modules/hr/pages/OfficeRecordMaintenance';
import TeacherDashboard from './modules/hr/pages/TeacherDashboard';
import CoordinatorStudents from './modules/academic/pages/coordinator/CoordinatorStudents';
import CoordinatorPerformance from './modules/academic/pages/coordinator/CoordinatorPerformance';
import CoordinatorAnnouncements from './modules/academic/pages/coordinator/CoordinatorAnnouncements';
import ClassDiary from './modules/academic/pages/coordinator/ClassDiary';
import TeacherDirectory from './modules/hr/pages/TeacherDirectory';
import TeacherProfile from './modules/hr/pages/TeacherProfile';
import EmployeeDirectory from './modules/hr/pages/EmployeeDirectory';
import EmployeeProfile from './modules/hr/pages/EmployeeProfile';
import AdvancedPayrollDesk from './modules/hr/pages/AdvancedPayrollDesk';
import EmployeeSelfService from './modules/hr/pages/EmployeeSelfService';
import PerformanceAppraisalBoard from './modules/hr/pages/PerformanceAppraisalBoard';
import LeaveAndLoanManager from './modules/hr/pages/LeaveAndLoanManager';
import RecruitmentBoard from './modules/hr/pages/RecruitmentBoard';
import OffboardingDesk from './modules/hr/pages/OffboardingDesk';
import TransportDashboard from './modules/transport/pages/TransportDashboard';
import FleetManagement from './modules/transport/pages/FleetManagement';
import RouteManagement from './modules/transport/pages/RouteManagement';
import StudentTransportAssignment from './modules/transport/pages/StudentTransportAssignment';
import TripMonitor from './modules/transport/pages/TripMonitor';
import TransportStaffManagement from './modules/transport/pages/TransportStaffManagement';
import VehicleMaintenanceDesk from './modules/transport/pages/VehicleMaintenanceDesk';
import StudentBusScheduling from './modules/transport/pages/StudentBusScheduling';
import LibraryDashboard from './modules/library/pages/LibraryDashboard';
import BookCatalogueManager from './modules/library/pages/BookCatalogueManager';
import CirculationDesk from './modules/library/pages/CirculationDesk';
import LibraryMemberPortal from './modules/library/pages/LibraryMemberPortal';
import FineManagementDesk from './modules/library/pages/FineManagementDesk';
import CategoryManager from './modules/library/pages/CategoryManager';
import ShelfManager from './modules/library/pages/ShelfManager';
import LibraryCardManager from './modules/library/pages/LibraryCardManager';
import ReadingPrograms from './modules/library/pages/ReadingPrograms';
import ReadingLog from './modules/library/pages/ReadingLog';
import StocktakeManager from './modules/library/pages/StocktakeManager';
import DonationManager from './modules/library/pages/DonationManager';
import BarcodeManager from './modules/library/pages/BarcodeManager';
import LibraryAttendance from './modules/library/pages/LibraryAttendance';
import LibraryAnalytics from './modules/library/pages/LibraryAnalytics';
import BranchManagement from './modules/organization/pages/BranchManagement';
import OnlineClassManager from './modules/academic/pages/OnlineClassManager';
import SpecialClassManager from './modules/academic/pages/SpecialClassManager';
import ProjectManager from './modules/academic/pages/ProjectManager';
import AssessmentDashboard from './modules/academic/pages/AssessmentDashboard';
import PracticalManager from './modules/academic/pages/PracticalManager';

// Attendance components
import AttendanceMarkingSheet from './modules/attendance/pages/AttendanceMarkingSheet';
import StudentAttendanceDashboard from './modules/attendance/pages/StudentAttendanceDashboard';
import AttendancePolicyManager from './modules/attendance/pages/AttendancePolicyManager';
import TeacherAttendanceDesk from './modules/attendance/pages/TeacherAttendanceDesk';
import AttendanceEntrySheet from './modules/attendance/pages/AttendanceEntrySheet';
import AttendanceCorrectionBoard from './modules/attendance/pages/AttendanceCorrectionBoard';
import StudentAttendanceProfile from './modules/attendance/pages/StudentAttendanceProfile';
import ClassAttendanceReport from './modules/attendance/pages/ClassAttendanceReport';
import EmployeeAttendanceDashboard from './modules/attendance/pages/EmployeeAttendanceDashboard';
import SubjectAttendanceDesk from './modules/attendance/pages/SubjectAttendanceDesk';

// Leave components
import LeaveTypeManager from './modules/leave/pages/LeaveTypeManager';
import LeaveBalanceManager from './modules/leave/pages/LeaveBalanceManager';
import MyLeaveDashboard from './modules/leave/pages/MyLeaveDashboard';
import LeaveApplicationForm from './modules/leave/pages/LeaveApplicationForm';
import LeaveApprovalBoard from './modules/leave/pages/LeaveApprovalBoard';
import LeaveCalendarView from './modules/leave/pages/LeaveCalendarView';

// Document Portal
import DocumentDashboard from './modules/documents/pages/DocumentDashboard';
import DocumentManager from './modules/documents/pages/DocumentManager';
import DocumentUploadWizard from './modules/documents/pages/DocumentUploadWizard';
import DocumentApprovalBoard from './modules/documents/pages/DocumentApprovalBoard';

// Examination components
import ExamDashboard from './modules/examination/pages/ExamDashboard';
import ExamManager from './modules/examination/pages/ExamManager';
import GradeSystemManager from './modules/examination/pages/GradeSystemManager';
import SubjectAssessmentConfig from './modules/examination/pages/SubjectAssessmentConfig';
import MarksEntryDesk from './modules/examination/pages/MarksEntryDesk';
import MarksEntryGrid from './modules/examination/pages/MarksEntryGrid';
import ResultVerificationBoard from './modules/examination/pages/ResultVerificationBoard';
import ReportCardGenerator from './modules/examination/pages/ReportCardGenerator';
import StudentResultView from './modules/examination/pages/StudentResultView';
import ReportCardView from './modules/examination/pages/ReportCardView';

// New Exam Pages
import ExamTypeManager from './modules/examination/pages/ExamTypeManager';
import ExamTermManager from './modules/examination/pages/ExamTermManager';
import ExamSettings from './modules/examination/pages/ExamSettings';
import ExamCalendar from './modules/examination/pages/ExamCalendar';
import ExamLogisticsManager from './modules/examination/pages/ExamLogisticsManager';
import ExamAttendanceManager from './modules/examination/pages/ExamAttendanceManager';
import QuestionPaperBuilder from './modules/examination/pages/QuestionPaperBuilder';
import QuestionPaperApproval from './modules/examination/pages/QuestionPaperApproval';
import MarksImport from './modules/examination/pages/MarksImport';
import MarksModeration from './modules/examination/pages/MarksModeration';
import ResultProcessor from './modules/examination/pages/ResultProcessor';
import ResultApproval from './modules/examination/pages/ResultApproval';
import ResultPublisher from './modules/examination/pages/ResultPublisher';
import RankingBoard from './modules/examination/pages/RankingBoard';
import ExamToppersBoard from './modules/examination/pages/ExamToppersBoard';
import PerformanceAnalytics from './modules/examination/pages/PerformanceAnalytics';
import ExamReports from './modules/examination/pages/ExamReports';

// Promotion components (Phase 62)
import PromotionDashboard from './modules/promotion/pages/PromotionDashboard';
import PromotionPolicyManager from './modules/promotion/pages/PromotionPolicyManager';
import EligibilityEngineView from './modules/promotion/pages/EligibilityEngineView';
import AcademicYearRollover from './modules/promotion/pages/AcademicYearRollover';
import PromotionApproval from './modules/promotion/pages/PromotionApproval';
import SubjectAllocationBoard from './modules/promotion/pages/SubjectAllocationBoard';

// Alumni components (Phase 63)
import AlumniDashboard from './modules/alumni/pages/AlumniDashboard';
import AlumniProfileManager from './modules/alumni/pages/AlumniProfileManager';
import AlumniDirectory from './modules/alumni/pages/AlumniDirectory';
import MentorshipHub from './modules/alumni/pages/MentorshipHub';
import AlumniEventsBoard from './modules/alumni/pages/AlumniEventsBoard';
import AlumniJobBoard from './modules/alumni/pages/AlumniJobBoard';
import FundraisingCampaigns from './modules/alumni/pages/FundraisingCampaigns';

// Timetable components
import TimetableDashboard from './modules/timetable/pages/TimetableDashboard';
import TimetableVersionManager from './modules/timetable/pages/TimetableVersionManager';
import TimetableEditor from './modules/timetable/pages/TimetableEditor';
import ClassTimetableView from './modules/timetable/pages/ClassTimetableView';
import TeacherTimetableView from './modules/timetable/pages/TeacherTimetableView';
import SubstitutionView from './modules/timetable/pages/SubstitutionView';
import RoomManager from './modules/timetable/pages/RoomManager';
import PeriodDefinitionManager from './modules/timetable/pages/PeriodDefinitionManager';
import ConflictDashboard from './modules/timetable/pages/ConflictDashboard';

// Finance components (Phase 41)
import FinanceDashboard from './modules/finance/pages/FinanceDashboard';
import FeeSetupManager from './modules/finance/pages/FeeSetupManager';
import FeeMaintenanceDashboard from './modules/finance/pages/FeeMaintenanceDashboard';
import InvoiceDesk from './modules/finance/pages/InvoiceDesk';
import PaymentCollectionDesk from './modules/finance/pages/PaymentCollectionDesk';
import ReconciliationBoard from './modules/finance/pages/ReconciliationBoard';
import StudentLedgerView from './modules/finance/pages/StudentLedgerView';
import ParentFeePortal from './modules/parent-portal/pages/ParentFeePortal';
import ParentLayout from './modules/parent-portal/layout/ParentLayout';
import ParentAttendanceView from './modules/parent-portal/pages/ParentAttendanceView';
import ParentMeetingBooking from './modules/parent-portal/pages/ParentMeetingBooking';
import ParentSettings from './modules/parent-portal/pages/ParentSettings';
import ParentNoticeBoard from './modules/parent-portal/pages/ParentNoticeBoard';
import ParentTimetableView from './modules/parent-portal/pages/ParentTimetableView';
import ParentLibraryView from './modules/parent-portal/pages/ParentLibraryView';

// Accounting components (Phase 42)
import AccountingDashboard from './modules/accounting/pages/AccountingDashboard';
import ChartOfAccounts from './modules/accounting/pages/ChartOfAccounts';
import JournalEntryDesk from './modules/accounting/pages/JournalEntryDesk';
import GeneralLedgerView from './modules/accounting/pages/GeneralLedgerView';
import TrialBalanceView from './modules/accounting/pages/TrialBalanceView';
import ExpenseManager from './modules/accounting/pages/ExpenseManager';
import BudgetManager from './modules/accounting/pages/BudgetManager';
import FinancialReportsView from './modules/accounting/pages/FinancialReportsView';

// Examination components
import ExamSetup from './modules/examination/pages/ExamSetup';
import ExamScheduleView from './modules/examination/pages/ExamScheduleView';
import ExaminationDashboard from './modules/examination/pages/ExaminationDashboard';
import MarksEntry from './modules/examination/pages/MarksEntry';
import ResultsDashboard from './modules/examination/pages/ResultsDashboard';
import QuestionBankManager from './modules/examination/pages/QuestionBankManager';
import RevaluationDesk from './modules/examination/pages/RevaluationDesk';
import SupplementaryExamDesk from './modules/examination/pages/SupplementaryExamDesk';

// Transport components
import DriverView from './modules/transport/pages/DriverView';
import ParentTrackingView from './modules/transport/pages/ParentTrackingView';

// Hostel components
import HostelWardenDashboard from './modules/hostel/pages/HostelWardenDashboard';
import HostelDashboard from './modules/hostel/pages/HostelDashboard';
import KindergartenDashboard from './modules/kindergarten/pages/KindergartenDashboard';
import HostelStructure from './modules/hostel/pages/HostelStructure';
import AllocationManagement from './modules/hostel/pages/AllocationManagement';
import HostelOperations from './modules/hostel/pages/HostelOperations';
import HostelMessManagement from './modules/hostel/pages/HostelMessManagement';
import HostelComplaintsView from './modules/hostel/pages/HostelComplaintsView';
import HostelOutpassManagement from './modules/hostel/pages/HostelOutpassManagement';
import HostelAttendance from './modules/hostel/pages/HostelAttendance';

// Library components
import ReservationQueue from './modules/library/pages/ReservationQueue';
import DigitalLibrary from './modules/library/pages/DigitalLibrary';
import LibraryMemberManagement from './modules/library/pages/LibraryMemberManagement';
import LibraryVendorManagement from './modules/library/pages/LibraryVendorManagement';
import PurchaseRequestManager from './modules/library/pages/PurchaseRequestManager';
import OverdueManagement from './modules/library/pages/OverdueManagement';
import LostDamagedManagement from './modules/library/pages/LostDamagedManagement';
import LibraryReports from './modules/library/pages/LibraryReports';
import CommunicationRoutes from './modules/communication/routes/CommunicationRoutes';

import LateComersRegister from './modules/attendance/pages/LateComersRegister';
import StaffPromotionManager from './modules/hr/pages/StaffPromotionManager';
import BirthdayAnniversaryDashboard from './modules/events/pages/BirthdayAnniversaryDashboard';
import PrayerAssemblyManager from './modules/events/pages/PrayerAssemblyManager';
import OfficeDashboard from './modules/operations/pages/OfficeDashboard';
import BonafideCertificateDesk from './modules/operations/pages/BonafideCertificateDesk';
import ComplaintsManager from './modules/operations/pages/ComplaintsManager';
import NonTeachingStaffDashboard from './modules/hr/pages/NonTeachingStaffDashboard';

import ComplaintsList from './modules/complaints/pages/ComplaintsList';

import ProtectedRoute from './core/components/ProtectedRoute';
import UnauthorizedPage from './core/pages/UnauthorizedPage';
import NotFoundPage from './core/pages/NotFoundPage';
import ForgotPassword from './modules/auth/pages/ForgotPassword';
import ResetPassword from './modules/auth/pages/ResetPassword';
import LandingPage from './modules/landing/LandingPage';
import AuditLogDashboard from './modules/audit/pages/AuditLogDashboard';

// Communication Module Pages
import AnnouncementManager from './modules/communication/pages/AnnouncementManager';
import CommunicationDashboard from './modules/communication/pages/CommunicationDashboard';
import MessageComposer from './modules/communication/pages/MessageComposer';
import PrincipalAnnouncer from './modules/communication/pages/PrincipalAnnouncer';
import ComplaintDesk from './modules/communication/pages/ComplaintDesk';
import ChatWindow from './modules/communication/pages/ChatWindow';

// Phase 112: Role-Specific Dashboards
import PrincipalDashboard from './modules/principal/pages/PrincipalDashboard';
import ApprovalCenter from './modules/principal/pages/ApprovalCenter';
import LearningOverview from './modules/principal/pages/LearningOverview';
import PrincipalNotifications from './modules/principal/pages/PrincipalNotifications';
import DriverDashboard from './modules/transport/pages/DriverDashboard';
import PeriodExchangeDesk from './modules/timetable/pages/PeriodExchangeDesk';
import ReferralHub from './modules/career/pages/ReferralHub';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';
import { fetchUserProfile } from './modules/auth/store/authSlice';

import MeetingManager from './modules/communication/pages/MeetingManager';

import LabDashboard from './modules/lab/pages/LabDashboard';
import LabSchedule from './modules/lab/pages/LabSchedule';
import LabEquipment from './modules/lab/pages/LabEquipment';
import LabInventory from './modules/lab/pages/LabInventory';
import LabMaintenance from './modules/lab/pages/LabMaintenance';
import LabBookings from './modules/lab/pages/LabBookings';
import SportsDashboard from './modules/sports/pages/SportsDashboard';
import LessonPlanManager from './modules/academic/pages/LessonPlanManager';
import { useAuth } from './modules/auth/hooks/useAuth';

const SmartTransportRedirect: React.FC = () => {
  const { isParent, isStudent } = useAuth();
  if (isParent) return <Navigate to="/parent-portal/transport" replace />;
  if (isStudent) return <Navigate to="/student-portal/transport" replace />;
  return <Navigate to="/transport/dashboard" replace />;
};

const SmartLibraryRedirect: React.FC = () => {
  const { isParent, isStudent } = useAuth();
  if (isParent) return <Navigate to="/parent-portal/library" replace />;
  if (isStudent) return <Navigate to="/student-portal/library" replace />;
  return <Navigate to="/library/dashboard" replace />;
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  // Auto-refresh permissions from backend on every app load
  // This ensures stale cached permissions (e.g. after seed updates) are refreshed
  useEffect(() => {
    if (user) {
      dispatch(fetchUserProfile());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register-school" element={<RegisterSchool />} />
      <Route path="/verify-email/:token" element={<VerifySchool />} />
      <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/403" element={<UnauthorizedPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<AppLayout />}>

      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/design-system" element={
        <ProtectedRoute allowedRoles={['SuperAdmin', 'Admin']}>
          <DesignSystemShowcase />
        </ProtectedRoute>
      } />

      {/* ─── Phase 112: Role-Specific Dashboards ─── */}
      <Route path="/principal/dashboard" element={
        <ProtectedRoute>
          <PrincipalDashboard />
        </ProtectedRoute>
      } />
      <Route path="/principal/approvals" element={
        <ProtectedRoute>
          <ApprovalCenter />
        </ProtectedRoute>
      } />
      <Route path="/principal/learning" element={
        <ProtectedRoute>
          <LearningOverview />
        </ProtectedRoute>
      } />
      <Route path="/principal/notifications" element={
        <ProtectedRoute>
          <PrincipalNotifications />
        </ProtectedRoute>
      } />


      {/* HR role-specific dashboard (uses existing HRDashboard) */}
      <Route path="/hr/dashboard" element={
        <ProtectedRoute>
          <HRDashboard />
        </ProtectedRoute>
      } />
      {/* Transport Manager dashboard (uses existing TransportDashboard) */}

      {/* Hostel Warden Dashboard Suite */}
      <Route path="/hostel/dashboard" element={
        <ProtectedRoute>
          <HostelWardenDashboard />
        </ProtectedRoute>
      } />
      <Route path="/hostel/warden" element={
        <ProtectedRoute>
          <HostelWardenDashboard />
        </ProtectedRoute>
      } />
      <Route path="/hostel/fees" element={
        <ProtectedRoute>
          <HostelWardenDashboard defaultTab="fees" />
        </ProtectedRoute>
      } />
      <Route path="/hostel/events" element={
        <ProtectedRoute>
          <HostelWardenDashboard defaultTab="events" />
        </ProtectedRoute>
      } />
      <Route path="/hostel/rooms" element={
        <ProtectedRoute>
          <HostelStructure />
        </ProtectedRoute>
      } />
      {/* Health dashboard for nurses */}
      <Route path="/health/dashboard" element={
        <ProtectedRoute>
          <HealthDashboard />
        </ProtectedRoute>
      } />
      {/* Sports dashboard */}
      <Route path="/sports/dashboard" element={
        <ProtectedRoute>
          <SportsDashboard />
        </ProtectedRoute>
      } />
      <Route path="/sports/teams" element={
        <ProtectedRoute>
          <SportsDashboard />
        </ProtectedRoute>
      } />
      {/* Lab dashboard */}
      <Route path="/lab/dashboard" element={
        <ProtectedRoute>
          <LabDashboard />
        </ProtectedRoute>
      } />

      {/* Admin Shell Routes */}
      <Route path="/admin/profile" element={
        <ProtectedRoute>
          <AdminProfile />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedPermissions={['users.view']}>
          <UserManagement />
        </ProtectedRoute>
      } />
      {/* User profile route removed pending component implementation */}
      
      <Route path="/admin/settings/*" element={
        <ProtectedRoute allowedPermissions={['tenant.manage']}>
          <AdminSettingsShell />
        </ProtectedRoute>
      } />
      <Route path="/admin/audit-logs" element={
        <ProtectedRoute allowedPermissions={['system.audit']}>
          <AuditLogDashboard />
        </ProtectedRoute>
      } />

      {/* Student Management Routes */}
      <Route path="/admin/students" element={
        <ProtectedRoute allowedPermissions={['students.view', 'students.view.assigned', 'students.view.class']}>
          <StudentList />
        </ProtectedRoute>
      } />
      <Route path="/admin/students/new" element={
        <ProtectedRoute allowedPermissions={['students.manage', 'students.create', 'admission.manage', 'students.view.assigned', 'students.view.class']}>
          <StudentAdmissionWizard />
        </ProtectedRoute>
      } />
      <Route path="/admin/students/:id/*" element={
        <ProtectedRoute allowedPermissions={['students.view', 'students.view.assigned', 'students.view.class']}>
          <StudentProfileShell />
        </ProtectedRoute>
      } />

      {/* Admin / Organization Portal */}
      <Route path="/organization" element={
        <ProtectedRoute allowedPermissions={['tenant.view']}>
          <OrganizationDashboard />
        </ProtectedRoute>
      } />
      <Route path="/organization/onboarding" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <SchoolOnboardingWizard />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/schools" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <SchoolDirectory />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/schools/:id" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <SchoolProfile />
        </ProtectedRoute>
      } />
      <Route path="/academic/dashboard" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <AcademicDashboard />
        </ProtectedRoute>
      } />
      <Route path="/academic/online-classes" element={<ProtectedRoute allowedPermissions={['academic.view']}><OnlineClassManager /></ProtectedRoute>} />
      <Route path="/academic/special-classes" element={<ProtectedRoute allowedPermissions={['academic.view']}><SpecialClassManager /></ProtectedRoute>} />
      <Route path="/academic/projects" element={<ProtectedRoute allowedPermissions={['academic.view']}><ProjectManager /></ProtectedRoute>} />
      <Route path="/academic/assessments" element={<ProtectedRoute allowedPermissions={['academic.view']}><AssessmentDashboard /></ProtectedRoute>} />
      <Route path="/academic/practicals" element={<ProtectedRoute allowedPermissions={['academic.view']}><PracticalManager /></ProtectedRoute>} />
      <Route path="/attendance/late-comers" element={<ProtectedRoute allowedPermissions={['attendance.view']}><LateComersRegister /></ProtectedRoute>} />
      <Route path="/safety/gate-pass" element={<ProtectedRoute allowedPermissions={['attendance.view']}><GatePassManager /></ProtectedRoute>} />
      <Route path="/admin/staff" element={
        <ProtectedRoute allowedPermissions={['staff.view', 'hr.employee.view']}>
          <StaffList />
        </ProtectedRoute>
      } />
      <Route path="/admin/staff/new" element={
        <ProtectedRoute allowedPermissions={['staff.create', 'hr.employee.create']}>
          <StaffOnboardingWizard />
        </ProtectedRoute>
      } />
      <Route path="/admin/staff/departments" element={
        <ProtectedRoute allowedPermissions={['staff.employment.manage', 'hr.department.manage']}>
          <DepartmentDesignationManager />
        </ProtectedRoute>
      } />
      <Route path="/admin/staff/:id/*" element={
        <ProtectedRoute allowedPermissions={['staff.view', 'hr.employee.view']}>
          <StaffProfileShell />
        </ProtectedRoute>
      } />
      <Route path="/admin/academics/academic-years" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <AcademicYearList />
        </ProtectedRoute>
      } />
      <Route path="/admin/academics/classes" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <ClassList />
        </ProtectedRoute>
      } />
      <Route path="/admin/academics/classes/:id" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <ClassDetail />
        </ProtectedRoute>
      } />
      <Route path="/admin/academics/subjects" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <SubjectList />
        </ProtectedRoute>
      } />
      <Route path="/admin/academics/assignments" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <TeacherAssignments />
        </ProtectedRoute>
      } />
      <Route path="/admin/academics/homework/:id/grade" element={
        <ProtectedRoute allowedPermissions={['academic.manage']}>
          <HomeworkGrading />
        </ProtectedRoute>
      } />
      <Route path="/admin/academics/terms" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <TermManager />
        </ProtectedRoute>
      } />
      <Route path="/admin/academics/subject-groups" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <SubjectGroupManager />
        </ProtectedRoute>
      } />
      <Route path="/academic/curriculum" element={
        <ProtectedRoute allowedPermissions={['academic.manage']}>
          <SyllabusManager />
        </ProtectedRoute>
      } />
      
      {/* Phase 108 Academic Extensions */}
      <Route path="/academic/online-classes" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <OnlineClassesManager />
        </ProtectedRoute>
      } />
      <Route path="/academic/projects" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <ProjectManager />
        </ProtectedRoute>
      } />


      <Route path="/admin/academics/syllabuses" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <SyllabusManager />
        </ProtectedRoute>
      } />
      <Route path="/admin/academics/classroom-allocations" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <ClassroomAllocationManager />
        </ProtectedRoute>
      } />
      <Route path="/admin/academics/events" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <AcademicEventManager />
        </ProtectedRoute>
      } />
      <Route path="/academic/promotion" element={
        <ProtectedRoute allowedPermissions={['academic.manage']}>
          <BulkPromotionWizard />
        </ProtectedRoute>
      } />

      {/* Phase 117 LMS */}
      <Route path="/lms/teacher/dashboard" element={
        <ProtectedRoute allowedPermissions={['academic.view', 'academic.homework.manage', 'assignment.create', 'assignment.view']} allowedRoles={['Teacher', 'Class Coordinator', 'Coordinator', 'Admin', 'School Admin', 'Principal']}>
          <TeacherLMSDashboard />
        </ProtectedRoute>
      } />
      <Route path="/lms/materials" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <LearningMaterialManager />
        </ProtectedRoute>
      } />
      <Route path="/lms/assignments" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <AssignmentManager />
        </ProtectedRoute>
      } />
      <Route path="/lms/assignments/new" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <AssignmentForm />
        </ProtectedRoute>
      } />
      <Route path="/lms/assignments/:id/edit" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <AssignmentForm />
        </ProtectedRoute>
      } />
      <Route path="/lms/assignments/:assignmentId/submissions" element={
        <ProtectedRoute allowedPermissions={['academic.view']}>
          <SubmissionDesk />
        </ProtectedRoute>
      } />
      <Route path="/lms/student/dashboard" element={
        <ProtectedRoute allowedPermissions={['academic.view', 'academic.homework.view', 'assignment.view', 'profile.view']} allowedRoles={['Student', 'STUDENT']}>
          <StudentLMSDashboard />
        </ProtectedRoute>
      } />
      <Route path="/lms/student/assignments/:id" element={
        <ProtectedRoute allowedPermissions={['academic.view', 'academic.homework.view', 'assignment.view']} allowedRoles={['Student', 'STUDENT']}>
          <StudentAssignmentView />
        </ProtectedRoute>
      } />
      {/* Lesson Plans */}
      <Route path="/academic/lesson-plans" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'COORDINATOR', 'TEACHER']}><LessonPlanManager /></ProtectedRoute>} />
      <Route path="/coordinator/lesson-plans" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'COORDINATOR', 'TEACHER']}><LessonPlanManager /></ProtectedRoute>} />
      <Route path="/teacher/lesson-plans" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'COORDINATOR', 'TEACHER']}><LessonPlanManager /></ProtectedRoute>} />
      
      {/* Role-Customized Document Vaults */}
      <Route path="/hr/documents" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'HR_ADMIN', 'HR', 'PRINCIPAL']}><StaffDocumentVault /></ProtectedRoute>} />
      <Route path="/office/documents" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN', 'OFFICE_ADMIN', 'OFFICE_STAFF', 'OFFICE', 'STAFF', 'ADMISSION_STAFF', 'PRINCIPAL']}><OfficeDocumentVault /></ProtectedRoute>} />
      <Route path="/admin/documents" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN', 'PRINCIPAL']}><AdminDocumentVault /></ProtectedRoute>} />
      
      {/* Admissions Portal */}
      <Route path="/admission/apply" element={
        <ProtectedRoute>
          <AdmissionApplicationWizard />
        </ProtectedRoute>
      } />
      <Route path="/admission/review" element={
        <ProtectedRoute allowedPermissions={['admission.view']}>
          <AdmissionReviewDashboard />
        </ProtectedRoute>
      } />


      {/* Attendance Module */}
      <Route path="/attendance/students" element={<ProtectedRoute allowedPermissions={['attendance.view']}><StudentAttendanceDashboard /></ProtectedRoute>} />
      <Route path="/attendance/teacher" element={<ProtectedRoute allowedPermissions={['attendance.view']}><TeacherAttendanceDesk /></ProtectedRoute>} />
      <Route path="/attendance/corrections" element={<ProtectedRoute allowedPermissions={['attendance.view']}><AttendanceCorrectionBoard /></ProtectedRoute>} />
      <Route path="/attendance/class-report" element={<ProtectedRoute allowedPermissions={['attendance.view']}><ClassAttendanceReport /></ProtectedRoute>} />
      <Route path="/attendance/profile" element={<ProtectedRoute allowedPermissions={['attendance.view']}><StudentAttendanceProfile /></ProtectedRoute>} />
      <Route path="/attendance/policy" element={<ProtectedRoute allowedPermissions={['attendance.view']}><AttendancePolicyManager /></ProtectedRoute>} />
      <Route path="/attendance/late-comers" element={<ProtectedRoute allowedPermissions={['attendance.view']}><LateComersRegister /></ProtectedRoute>} />

      {/* Students Portal & Aliases */}
      <Route path="/student-portal" element={<Navigate to="/student-portal/dashboard" replace />} />
      <Route path="/student/dashboard" element={<Navigate to="/student-portal/dashboard" replace />} />
      <Route path="/students/dashboard" element={<Navigate to="/student-portal/dashboard" replace />} />
      <Route path="/student" element={<Navigate to="/student-portal/dashboard" replace />} />
      <Route path="/parent" element={<Navigate to="/parent-portal" replace />} />
      <Route path="/parent/dashboard" element={<Navigate to="/parent-portal" replace />} />

      {/* Smart Hub Fallbacks for Transport & Library */}
      <Route path="/transport" element={<ProtectedRoute><SmartTransportRedirect /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute><SmartLibraryRedirect /></ProtectedRoute>} />
      <Route path="/parent/transport" element={<Navigate to="/parent-portal/transport" replace />} />
      <Route path="/parent/library" element={<Navigate to="/parent-portal/library" replace />} />
      <Route path="/students/transport" element={<Navigate to="/student-portal/transport" replace />} />
      <Route path="/students/library" element={<Navigate to="/student-portal/library" replace />} />

      <Route path="/student-portal/dashboard" element={
        <ProtectedRoute allowedRoles={['Student', 'STUDENT']}>
          <StudentPortalDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student-portal/messages" element={
        <ProtectedRoute allowedRoles={['Student', 'STUDENT']}>
          <ChatWindow />
        </ProtectedRoute>
      } />
      <Route path="/student-portal/fees" element={
        <ProtectedRoute allowedRoles={['Student', 'STUDENT']}>
          <StudentFeeDashboard />
        </ProtectedRoute>
      } />
      <Route path="/student-portal/homework" element={
        <ProtectedRoute allowedRoles={['Student', 'STUDENT']}>
          <StudentHomeworkView />
        </ProtectedRoute>
      } />
      <Route path="/students/directory" element={
        <ProtectedRoute allowedPermissions={['students.view']}>
          <StudentDirectory />
        </ProtectedRoute>
      } />
      <Route path="/students/profile/:id" element={
        <ProtectedRoute allowedPermissions={['students.view']}>
          <StudentProfileDashboard />
        </ProtectedRoute>
      } />
      <Route path="/students/lifecycle/:id" element={
        <ProtectedRoute allowedPermissions={['students.manage']}>
          <StudentLifecycleView />
        </ProtectedRoute>
      } />
      <Route path="/students/parents" element={
        <ProtectedRoute allowedPermissions={['parents.view']}>
          <ParentManagement />
        </ProtectedRoute>
      } />
      <Route path="/admin/parents/:id" element={
        <ProtectedRoute allowedPermissions={['parents.view']}>
          <ParentProfile />
        </ProtectedRoute>
      } />
      <Route element={<ParentLayout />}>
        <Route path="/parent-portal" element={
          <ProtectedRoute allowedRoles={['Parent', 'PARENT']}>
            <ParentPortalDashboard />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/messages" element={
          <ProtectedRoute allowedRoles={['Parent', 'PARENT']}>
            <ParentMessages />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/homework" element={
          <ProtectedRoute>
            <ParentHomeworkView />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/meetings" element={
          <ProtectedRoute>
            <ParentMeetings />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/fees" element={
          <ProtectedRoute>
            <ParentFeePortal />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/results" element={
          <ProtectedRoute>
            <StudentResultView />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/notices" element={
          <ProtectedRoute>
            <ParentNoticeBoard />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/timetable" element={
          <ProtectedRoute>
            <ParentTimetableView />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/settings" element={
          <ProtectedRoute>
            <ParentSettings />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/attendance" element={
          <ProtectedRoute>
            <ParentAttendanceView />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/meetings/book" element={
          <ProtectedRoute>
            <ParentMeetingBooking />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/marks" element={
          <ProtectedRoute>
            <StudentResultView />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/complaints" element={
          <ProtectedRoute>
            <ComplaintsList />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/library" element={
          <ProtectedRoute>
            <ParentLibraryView />
          </ProtectedRoute>
        } />
        <Route path="/parent-portal/transport" element={
          <ProtectedRoute>
            <ParentTrackingView />
          </ProtectedRoute>
        } />
      </Route>      
      {/* Staff & HR Portal */}
      <Route path="/staff-portal" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Class Teacher', 'Class Coordinator', 'Staff', 'HR', 'Admin', 'School Admin', 'Principal']}>
          <StaffPortalDashboard />
        </ProtectedRoute>
      } />
      <Route path="/staff-portal/finance" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Staff', 'HR', 'Admin', 'School Admin', 'Principal']}>
          <StaffFinancePortal />
        </ProtectedRoute>
      } />
      <Route path="/staff-portal/meetings" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'SuperAdmin']}>
          <TeacherMeetingDashboard />
        </ProtectedRoute>
      } />
      
      {/* Inventory */}
      <Route path="/inventory" element={<ProtectedRoute allowedPermissions={['inventory.view']}><InventoryDashboard /></ProtectedRoute>} />
      <Route path="/inventory/catalog" element={<ProtectedRoute allowedPermissions={['inventory.view']}><ProductCatalog /></ProtectedRoute>} />
      <Route path="/inventory/ledger" element={<ProtectedRoute allowedPermissions={['inventory.view']}><StockLedger /></ProtectedRoute>} />
      <Route path="/inventory/operations" element={<ProtectedRoute allowedPermissions={['inventory.manage']}><StockOperations /></ProtectedRoute>} />
      
      {/* Procurement */}
      <Route path="/procurement/dashboard" element={<ProtectedRoute allowedPermissions={['procurement.view']}><ProcurementDashboard /></ProtectedRoute>} />
      <Route path="/procurement/rfq" element={<ProtectedRoute allowedPermissions={['procurement.manage']}><RFQManager /></ProtectedRoute>} />
      <Route path="/procurement/quotations" element={<ProtectedRoute allowedPermissions={['procurement.manage']}><QuotationManager /></ProtectedRoute>} />
      <Route path="/procurement/quotation-comparison" element={<ProtectedRoute allowedPermissions={['procurement.manage']}><QuotationComparison /></ProtectedRoute>} />
      <Route path="/procurement/orders" element={<ProtectedRoute allowedPermissions={['procurement.manage']}><PurchaseOrderManager /></ProtectedRoute>} />
      <Route path="/procurement/receiving" element={<ProtectedRoute allowedPermissions={['procurement.manage']}><GoodsReceiving /></ProtectedRoute>} />
      <Route path="/procurement/invoice-matching" element={<ProtectedRoute allowedPermissions={['procurement.manage']}><InvoiceMatchingDesk /></ProtectedRoute>} />
      
      {/* Assets */}
      <Route path="/assets" element={<ProtectedRoute allowedPermissions={['assets.view']}><AssetRegister /></ProtectedRoute>} />
      <Route path="/assets/operations" element={<ProtectedRoute allowedPermissions={['assets.manage']}><AssetOperations /></ProtectedRoute>} />
      <Route path="/assets/maintenance" element={<ProtectedRoute allowedPermissions={['assets.manage']}><AssetMaintenance /></ProtectedRoute>} />
      
      <Route path="/vendors/directory" element={
        <ProtectedRoute allowedPermissions={['vendor.view']}>
          <VendorDirectory />
        </ProtectedRoute>
      } />
      <Route path="/vendors/performance" element={
        <ProtectedRoute allowedPermissions={['vendor.view']}>
          <VendorPerformance />
        </ProtectedRoute>
      } />
      <Route path="/hr/dashboard" element={
        <ProtectedRoute allowedPermissions={['hr.view']}>
          <HRDashboard />
        </ProtectedRoute>
      } />
      <Route path="/hr/records" element={
        <ProtectedRoute allowedPermissions={['hr.manage']}>
          <OfficeRecordMaintenance />
        </ProtectedRoute>
      } />
      <Route path="/office/dashboard" element={
        <ProtectedRoute allowedRoles={['Office Admin', 'Office Staff', 'Admission Staff', 'Staff', 'Admin', 'School Admin', 'Principal']}>
          <OfficeStaffDashboard />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/dashboard" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/tenants" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <TenantManagement />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/tenants/:id" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <SchoolDetail360 />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/tenants/:id/edit" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <SchoolDetail360 />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/plans" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <PlanManagement />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/plan-features" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <PlanFeatureManager />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/subscriptions" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <SubscriptionManagement />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/coupons" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <CouponManagement />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/invoices" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <InvoiceManagement />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/payments" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <PaymentManagement />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/billing" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <InvoiceManagement />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/revenue" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <RevenueAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/usage" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <RevenueAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/support" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <SupportTicketDesk />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/support-tickets" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <SupportTicketDesk />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/announcements" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <PlatformAnnouncements />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/settings" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <PlatformSettings />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/feature-flags" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <FeatureFlags />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/health" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <SystemHealth />
        </ProtectedRoute>
      } />
      <Route path="/super-admin/audit-logs" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'Super Admin', 'SuperAdmin']}>
          <AuditLogViewer />
        </ProtectedRoute>
      } />
      <Route path="/teacher/dashboard" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'School Admin', 'Principal']}>
          <TeacherDashboard />
        </ProtectedRoute>
      } />
      <Route path="/academic/messages" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'School Admin', 'Principal', 'Class Coordinator', 'Coordinator']}>
          <TeacherMessages />
        </ProtectedRoute>
      } />
      {/* Coordinator Routes */}
      <Route path="/teacher/coordinator/students" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'School Admin', 'Principal']}>
          <CoordinatorStudents />
        </ProtectedRoute>
      } />
      <Route path="/teacher/coordinator/performance" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'School Admin', 'Principal']}>
          <CoordinatorPerformance />
        </ProtectedRoute>
      } />
      <Route path="/teacher/coordinator/diary" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'School Admin', 'Principal']}>
          <ClassDiary />
        </ProtectedRoute>
      } />
      <Route path="/teacher/coordinator/announcements" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'School Admin', 'Principal']}>
          <CoordinatorAnnouncements />
        </ProtectedRoute>
      } />
      <Route path="/admin/teachers" element={
        <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin', 'SchoolAdmin', 'Principal', 'HRManager']}>
          <TeacherDirectory />
        </ProtectedRoute>
      } />
      <Route path="/admin/teachers/:id" element={
        <ProtectedRoute allowedRoles={['SuperAdmin', 'TenantAdmin', 'SchoolAdmin', 'Principal', 'HRManager']}>
          <TeacherProfile />
        </ProtectedRoute>
      } />
      <Route path="/hr/directory" element={
        <ProtectedRoute allowedPermissions={['hr.view']}>
          <EmployeeDirectory />
        </ProtectedRoute>
      } />
      <Route path="/hr/employee/:id" element={
        <ProtectedRoute allowedPermissions={['hr.view']}>
          <EmployeeProfile />
        </ProtectedRoute>
      } />
      <Route path="/hr/payroll" element={
        <ProtectedRoute allowedPermissions={['payroll.manage']}>
          <AdvancedPayrollDesk />
        </ProtectedRoute>
      } />
      <Route path="/hr/self-service" element={
        <ProtectedRoute>
          <EmployeeSelfService />
        </ProtectedRoute>
      } />
      <Route path="/hr/performance" element={
        <ProtectedRoute allowedPermissions={['hr.manage']}>
          <PerformanceAppraisalBoard />
        </ProtectedRoute>
      } />
      <Route path="/hr/approvals" element={
        <ProtectedRoute allowedPermissions={['hr.manage']}>
          <LeaveAndLoanManager />
        </ProtectedRoute>
      } />
      <Route path="/hr/recruitment" element={
        <ProtectedRoute allowedPermissions={['hr.manage']}>
          <RecruitmentBoard />
        </ProtectedRoute>
      } />
      <Route path="/hr/offboarding" element={
        <ProtectedRoute allowedPermissions={['hr.manage']}>
          <OffboardingDesk />
        </ProtectedRoute>
      } />
      <Route path="/hr/exit" element={
        <ProtectedRoute allowedPermissions={['hr.manage']}>
          <OffboardingDesk />
        </ProtectedRoute>
      } />
      <Route path="/hr/users" element={
        <ProtectedRoute allowedPermissions={['users.view']}>
          <UserManagement />
        </ProtectedRoute>
      } />
      <Route path="/hr/promotions" element={
        <ProtectedRoute allowedPermissions={['hr.manage']}>
          <StaffPromotionManager />
        </ProtectedRoute>
      } />
      <Route path="/hr/documents" element={
        <ProtectedRoute>
          <StaffDocumentVault />
        </ProtectedRoute>
      } />
      <Route path="/office/documents" element={
        <ProtectedRoute>
          <OfficeDocumentVault />
        </ProtectedRoute>
      } />
      <Route path="/admin/documents" element={
        <ProtectedRoute>
          <AdminDocumentVault />
        </ProtectedRoute>
      } />
      <Route path="/hr/employees" element={
        <ProtectedRoute allowedPermissions={['hr.view']}>
          <EmployeeDirectory />
        </ProtectedRoute>
      } />
      <Route path="/hr/leaves" element={
        <ProtectedRoute allowedPermissions={['hr.manage']}>
          <LeaveAndLoanManager />
        </ProtectedRoute>
      } />

      {/* Organization & Branch Management */}
      <Route path="/organization/branches" element={<ProtectedRoute allowedPermissions={['organization.manage', 'tenant.manage']}><BranchManagement /></ProtectedRoute>} />
      <Route path="/admin/branches" element={<ProtectedRoute allowedPermissions={['organization.manage', 'tenant.manage']}><BranchManagement /></ProtectedRoute>} />

      {/* Transport Portal */}
       <Route path="/transport/dashboard" element={<ProtectedRoute allowedPermissions={['transport.view']}><TransportDashboard /></ProtectedRoute>} />
      <Route path="/transport/fleet" element={<ProtectedRoute allowedPermissions={['transport.manage']}><FleetManagement /></ProtectedRoute>} />
      <Route path="/transport/vehicles" element={<ProtectedRoute allowedPermissions={['transport.manage']}><FleetManagement /></ProtectedRoute>} />
      <Route path="/transport/maintenance" element={<ProtectedRoute allowedPermissions={['transport.manage']}><VehicleMaintenanceDesk /></ProtectedRoute>} />
      <Route path="/transport/routes" element={<ProtectedRoute allowedPermissions={['transport.manage']}><RouteManagement /></ProtectedRoute>} />
      <Route path="/transport/staff" element={<ProtectedRoute allowedPermissions={['transport.manage']}><TransportStaffManagement /></ProtectedRoute>} />
      <Route path="/transport/drivers" element={<ProtectedRoute allowedPermissions={['transport.manage']}><TransportStaffManagement /></ProtectedRoute>} />
      <Route path="/transport/assignments" element={<ProtectedRoute allowedPermissions={['transport.manage']}><StudentTransportAssignment /></ProtectedRoute>} />
      <Route path="/transport/scheduling" element={<ProtectedRoute allowedPermissions={['transport.manage']}><StudentBusScheduling /></ProtectedRoute>} />
      <Route path="/transport/trips" element={<ProtectedRoute allowedPermissions={['transport.manage']}><TripMonitor /></ProtectedRoute>} />
      <Route path="/transport/reports" element={<ProtectedRoute allowedPermissions={['transport.view']}><TransportDashboard /></ProtectedRoute>} />

      {/* Driver Routes */}
      <Route path="/driver/dashboard" element={<ProtectedRoute><DriverDashboard /></ProtectedRoute>} />
      <Route path="/driver/vehicle" element={<ProtectedRoute><FleetManagement /></ProtectedRoute>} />
      <Route path="/driver/route" element={<ProtectedRoute><RouteManagement /></ProtectedRoute>} />
      <Route path="/driver/trip" element={<ProtectedRoute><TripMonitor /></ProtectedRoute>} />
      <Route path="/driver/notifications" element={<ProtectedRoute><PrincipalNotifications /></ProtectedRoute>} />

      {/* Library Portal */}
      <Route path="/library/dashboard" element={
        <ProtectedRoute allowedPermissions={['library.view']}>
          <LibraryDashboard />
        </ProtectedRoute>
      } />
      <Route path="/library/catalogue" element={
        <ProtectedRoute allowedPermissions={['library.view']}>
          <BookCatalogueManager />
        </ProtectedRoute>
      } />
      <Route path="/library/circulation" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <CirculationDesk />
        </ProtectedRoute>
      } />
      <Route path="/library/portal" element={
        <ProtectedRoute>
          <LibraryMemberPortal />
        </ProtectedRoute>
      } />
      <Route path="/library/fines" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <FineManagementDesk />
        </ProtectedRoute>
      } />
      <Route path="/library/analytics" element={
        <ProtectedRoute allowedPermissions={['library.view']}>
          <LibraryAnalytics />
        </ProtectedRoute>
      } />
      <Route path="/library/categories" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <CategoryManager />
        </ProtectedRoute>
      } />
      <Route path="/library/shelves" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <ShelfManager />
        </ProtectedRoute>
      } />
      <Route path="/library/cards" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <LibraryCardManager />
        </ProtectedRoute>
      } />
      <Route path="/library/reading-programs" element={
        <ProtectedRoute allowedPermissions={['library.view']}>
          <ReadingPrograms />
        </ProtectedRoute>
      } />
      <Route path="/library/reading-log" element={
        <ProtectedRoute allowedPermissions={['library.view']}>
          <ReadingLog />
        </ProtectedRoute>
      } />
      <Route path="/library/stocktake" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <StocktakeManager />
        </ProtectedRoute>
      } />
      <Route path="/library/donations" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <DonationManager />
        </ProtectedRoute>
      } />
      <Route path="/library/barcodes" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <BarcodeManager />
        </ProtectedRoute>
      } />
      <Route path="/library/attendance" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <LibraryAttendance />
        </ProtectedRoute>
      } />

      {/* Attendance Portal */}
      <Route path="/attendance/mark" element={
        <ProtectedRoute allowedPermissions={['attendance.manage', 'attendance.mark', 'attendance.view', 'attendance.view.assigned', 'attendance.view.class']}>
          <AttendanceMarkingSheet />
        </ProtectedRoute>
      } />
      <Route path="/attendance/students" element={
        <ProtectedRoute allowedPermissions={['attendance.view']}>
          <StudentAttendanceDashboard />
        </ProtectedRoute>
      } />
      <Route path="/attendance/policy" element={
        <ProtectedRoute allowedPermissions={['attendance.manage']}>
          <AttendancePolicyManager />
        </ProtectedRoute>
      } />
      <Route path="/attendance/teacher" element={
        <ProtectedRoute allowedPermissions={['attendance.view']}>
          <TeacherAttendanceDesk />
        </ProtectedRoute>
      } />
      <Route path="/attendance/mark/:id" element={
        <ProtectedRoute allowedPermissions={['attendance.manage']}>
          <AttendanceEntrySheet />
        </ProtectedRoute>
      } />
      <Route path="/attendance/corrections" element={
        <ProtectedRoute allowedPermissions={['attendance.manage']}>
          <AttendanceCorrectionBoard />
        </ProtectedRoute>
      } />
      <Route path="/attendance/profile" element={
        <ProtectedRoute allowedPermissions={['attendance.view']}>
          <StudentAttendanceProfile />
        </ProtectedRoute>
      } />
      <Route path="/attendance/class-report" element={
        <ProtectedRoute allowedPermissions={['attendance.view']}>
          <ClassAttendanceReport />
        </ProtectedRoute>
      } />
      <Route path="/attendance/subject" element={
        <ProtectedRoute allowedPermissions={['attendance.manage']}>
          <SubjectAttendanceDesk />
        </ProtectedRoute>
      } />
      <Route path="/attendance/employee" element={
        <ProtectedRoute allowedPermissions={['hr.view']}>
          <EmployeeAttendanceDashboard />
        </ProtectedRoute>
      } />
      <Route path="/attendance/late-comers" element={
        <ProtectedRoute allowedPermissions={['attendance.manage']}>
          <LateComersRegister />
        </ProtectedRoute>
      } />

      {/* Leave Portal */}
      <Route path="/leave/types" element={
        <ProtectedRoute allowedPermissions={['leave.view', 'leave.approve', 'attendance.manage']}>
          <LeaveTypeManager />
        </ProtectedRoute>
      } />
      <Route path="/leave/balances" element={
        <ProtectedRoute allowedPermissions={['leave.view', 'leave.approve', 'attendance.manage']}>
          <LeaveBalanceManager />
        </ProtectedRoute>
      } />
      <Route path="/leave/my-leave" element={
        <ProtectedRoute>
          <MyLeaveDashboard />
        </ProtectedRoute>
      } />
      <Route path="/leave/apply" element={
        <ProtectedRoute>
          <LeaveApplicationForm />
        </ProtectedRoute>
      } />
      <Route path="/leave/approvals" element={
        <ProtectedRoute allowedPermissions={['leave.approve']}>
          <LeaveApprovalBoard />
        </ProtectedRoute>
      } />
      <Route path="/leave/calendar" element={
        <ProtectedRoute allowedPermissions={['leave.view']}>
          <LeaveCalendarView />
        </ProtectedRoute>
      } />

      {/* Document Portal */}
      <Route path="/documents/dashboard" element={<ProtectedRoute><DocumentDashboard /></ProtectedRoute>} />
      <Route path="/documents/all" element={<ProtectedRoute><DocumentManager /></ProtectedRoute>} />
      <Route path="/documents/upload" element={<ProtectedRoute><DocumentUploadWizard /></ProtectedRoute>} />
      <Route path="/documents/approvals" element={<ProtectedRoute allowedPermissions={['document.approve']}><DocumentApprovalBoard /></ProtectedRoute>} />


      {/* Examination Portal */}
      <Route path="/examination/dashboard" element={<ProtectedRoute allowedPermissions={['examination.view', 'exam.analytics.view']}><ExamDashboard /></ProtectedRoute>} />
      <Route path="/examination/manage" element={<ProtectedRoute allowedPermissions={['examination.manage', 'exam.create']}><ExamManager /></ProtectedRoute>} />
      <Route path="/examination/types" element={<ProtectedRoute allowedPermissions={['examination.manage', 'exam.config.manage']}><ExamTypeManager /></ProtectedRoute>} />
      <Route path="/examination/terms" element={<ProtectedRoute allowedPermissions={['examination.manage', 'exam.config.manage']}><ExamTermManager /></ProtectedRoute>} />
      <Route path="/examination/settings" element={<ProtectedRoute allowedPermissions={['examination.manage', 'exam.config.manage', 'exam.settings.manage']}><ExamSettings /></ProtectedRoute>} />
      <Route path="/examination/calendar" element={<ProtectedRoute allowedPermissions={['examination.view', 'exam.view', 'exam.calendar.view']}><ExamCalendar /></ProtectedRoute>} />
      <Route path="/examination/logistics" element={<ProtectedRoute allowedPermissions={['examination.manage', 'exam.seating.manage', 'exam.logistics.manage']}><ExamLogisticsManager /></ProtectedRoute>} />
      <Route path="/examination/attendance" element={<ProtectedRoute allowedPermissions={['examination.manage', 'exam.attendance.manage']}><ExamAttendanceManager /></ProtectedRoute>} />
      
      <Route path="/examination/grade-systems" element={<ProtectedRoute allowedPermissions={['exam.config.manage']}><GradeSystemManager /></ProtectedRoute>} />
      <Route path="/examination/subject-config" element={<ProtectedRoute allowedPermissions={['exam.config.manage']}><SubjectAssessmentConfig /></ProtectedRoute>} />
      <Route path="/examination/question-bank" element={<ProtectedRoute allowedPermissions={['exam.question.manage']}><QuestionBankManager /></ProtectedRoute>} />
      <Route path="/examination/question-papers" element={<ProtectedRoute allowedPermissions={['exam.paper.create']}><QuestionPaperBuilder /></ProtectedRoute>} />
      <Route path="/examination/question-paper-approval" element={<ProtectedRoute allowedPermissions={['exam.paper.approve']}><QuestionPaperApproval /></ProtectedRoute>} />
            
      <Route path="/examination/marks-entry" element={<ProtectedRoute allowedPermissions={['exam.marks.enter']}><MarksEntryDesk /></ProtectedRoute>} />
      <Route path="/examination/marks-import" element={<ProtectedRoute allowedPermissions={['exam.marks.enter']}><MarksImport /></ProtectedRoute>} />
      <Route path="/examination/verification" element={<ProtectedRoute allowedPermissions={['exam.marks.verify']}><ResultVerificationBoard /></ProtectedRoute>} />
      <Route path="/examination/moderation" element={<ProtectedRoute allowedPermissions={['exam.marks.moderate']}><MarksModeration /></ProtectedRoute>} />
            
      <Route path="/examination/process-results" element={<ProtectedRoute allowedPermissions={['exam.result.calculate']}><ResultProcessor /></ProtectedRoute>} />
      <Route path="/examination/result-approval" element={<ProtectedRoute allowedPermissions={['exam.result.approve']}><ResultApproval /></ProtectedRoute>} />
      <Route path="/examination/result-publisher" element={<ProtectedRoute allowedPermissions={['exam.result.publish']}><ResultPublisher /></ProtectedRoute>} />
            
      <Route path="/examination/report-cards" element={<ProtectedRoute allowedPermissions={['exam.report.generate']}><ReportCardGenerator /></ProtectedRoute>} />
      <Route path="/examination/report-cards/view/:id" element={<ProtectedRoute allowedPermissions={['exam.report.view']}><ReportCardView /></ProtectedRoute>} />
            
      <Route path="/examination/ranking" element={<ProtectedRoute allowedPermissions={['exam.ranking.view']}><RankingBoard /></ProtectedRoute>} />
      <Route path="/examination/toppers" element={<ProtectedRoute allowedPermissions={['exam.ranking.view']}><ExamToppersBoard /></ProtectedRoute>} />
      <Route path="/examination/analytics" element={<ProtectedRoute allowedPermissions={['exam.analytics.view']}><PerformanceAnalytics /></ProtectedRoute>} />
      <Route path="/examination/reports" element={<ProtectedRoute allowedPermissions={['examination.view', 'exam.report.generate']}><ExamReports /></ProtectedRoute>} />
            
      <Route path="/examination/my-results" element={<StudentResultView />} />
      <Route path="/examination/marks-entry/grid" element={
        <ProtectedRoute allowedPermissions={['examination.enter_marks']}>
          <MarksEntryGrid />
        </ProtectedRoute>
      } />
      <Route path="/examination/student-view" element={
        <StudentResultView />
      } />

      {/* Promotion Portal (Phase 62) */}
      <Route path="/promotion/dashboard" element={<ProtectedRoute allowedPermissions={['promotion.view']}><PromotionDashboard /></ProtectedRoute>} />
      <Route path="/promotion/policies" element={<ProtectedRoute allowedPermissions={['promotion.config']}><PromotionPolicyManager /></ProtectedRoute>} />
      <Route path="/promotion/eligibility" element={<ProtectedRoute allowedPermissions={['promotion.evaluate']}><EligibilityEngineView /></ProtectedRoute>} />
      <Route path="/promotion/rollover" element={<ProtectedRoute allowedPermissions={['promotion.rollover']}><AcademicYearRollover /></ProtectedRoute>} />
      <Route path="/promotion/approval" element={<ProtectedRoute allowedPermissions={['promotion.approve']}><PromotionApproval /></ProtectedRoute>} />
      <Route path="/promotion/subject-allocation" element={<ProtectedRoute allowedPermissions={['promotion.allocate']}><SubjectAllocationBoard /></ProtectedRoute>} />

      {/* Alumni Portal (Phase 63) */}
      <Route path="/alumni/dashboard" element={<ProtectedRoute allowedPermissions={['alumni.view']}><AlumniDashboard /></ProtectedRoute>} />
      <Route path="/alumni/profile" element={<ProtectedRoute allowedPermissions={['alumni.profile.edit']}><AlumniProfileManager /></ProtectedRoute>} />
      <Route path="/alumni/directory" element={<ProtectedRoute allowedPermissions={['alumni.directory.view']}><AlumniDirectory /></ProtectedRoute>} />
      <Route path="/alumni/mentorship" element={<ProtectedRoute allowedPermissions={['alumni.mentorship.view']}><MentorshipHub /></ProtectedRoute>} />
      <Route path="/alumni/events" element={<ProtectedRoute allowedPermissions={['alumni.events.view']}><AlumniEventsBoard /></ProtectedRoute>} />
      <Route path="/alumni/jobs" element={<ProtectedRoute allowedPermissions={['alumni.jobs.view']}><AlumniJobBoard /></ProtectedRoute>} />
      <Route path="/alumni/donations" element={<ProtectedRoute allowedPermissions={['alumni.donations.create']}><FundraisingCampaigns /></ProtectedRoute>} />

      {/* Timetable Portal */}
      <Route path="/timetable/dashboard" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'School Admin', 'Principal']}>
          <TimetableDashboard />
        </ProtectedRoute>
      } />
      <Route path="/timetable/versions" element={
        <ProtectedRoute 
          allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN', 'PRINCIPAL', 'ACADEMIC_COORDINATOR', 'CLASS_COORDINATOR', 'COORDINATOR']}
          allowedPermissions={['timetable.create', 'timetable.manage']}
        >
          <TimetableVersionManager />
        </ProtectedRoute>
      } />
      <Route path="/timetable/editor" element={
        <ProtectedRoute 
          allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN', 'PRINCIPAL', 'ACADEMIC_COORDINATOR', 'CLASS_COORDINATOR', 'COORDINATOR']}
          allowedPermissions={['timetable.create', 'timetable.manage']}
        >
          <TimetableEditor />
        </ProtectedRoute>
      } />
      <Route path="/timetable/class" element={
        <ProtectedRoute allowedRoles={['Teacher', 'Admin', 'School Admin', 'Principal', 'Academic Coordinator', 'Class Coordinator']}>
          <ClassTimetableView />
        </ProtectedRoute>
      } />
      <Route path="/timetable/teacher" element={
        <ProtectedRoute>
          <TeacherTimetableView />
        </ProtectedRoute>
      } />
      <Route path="/timetable/substitution" element={
        <ProtectedRoute>
          <SubstitutionView />
        </ProtectedRoute>
      } />
      <Route path="/timetable/exchange" element={
        <ProtectedRoute>
          <PeriodExchangeDesk />
        </ProtectedRoute>
      } />
      <Route path="/timetable/rooms" element={
        <ProtectedRoute 
          allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN', 'PRINCIPAL', 'ACADEMIC_COORDINATOR', 'COORDINATOR']}
          allowedPermissions={['timetable.create', 'timetable.manage']}
        >
          <RoomManager />
        </ProtectedRoute>
      } />
      <Route path="/timetable/periods" element={
        <ProtectedRoute 
          allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN', 'PRINCIPAL', 'ACADEMIC_COORDINATOR', 'COORDINATOR']}
          allowedPermissions={['timetable.create', 'timetable.manage']}
        >
          <PeriodDefinitionManager />
        </ProtectedRoute>
      } />
      <Route path="/timetable/conflicts" element={
        <ProtectedRoute 
          allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'ADMIN', 'PRINCIPAL', 'ACADEMIC_COORDINATOR', 'COORDINATOR']}
          allowedPermissions={['timetable.create', 'timetable.manage']}
        >
          <ConflictDashboard />
        </ProtectedRoute>
      } />
      {/* Finance & Fees Module */}
      <Route path="/finance/dashboard" element={<ProtectedRoute allowedPermissions={['finance.view']}><FinanceDashboard /></ProtectedRoute>} />
      <Route path="/finance/maintenance" element={<ProtectedRoute allowedPermissions={['finance.manage']}><FeeMaintenanceDashboard /></ProtectedRoute>} />
      <Route path="/finance/setup" element={<ProtectedRoute allowedPermissions={['finance.manage']}><FeeSetupManager /></ProtectedRoute>} />
      <Route path="/finance/invoices" element={<ProtectedRoute allowedPermissions={['finance.manage']}><InvoiceDesk /></ProtectedRoute>} />
      <Route path="/finance/ledger" element={<ProtectedRoute allowedPermissions={['finance.manage']}><StudentLedgerView /></ProtectedRoute>} />
      <Route path="/finance/payments" element={<ProtectedRoute allowedPermissions={['finance.manage']}><PaymentCollectionDesk /></ProtectedRoute>} />
      <Route path="/finance/reconciliation" element={<ProtectedRoute allowedPermissions={['finance.manage']}><ReconciliationBoard /></ProtectedRoute>} />
      <Route path="/finance/reports" element={<ProtectedRoute allowedPermissions={['finance.report.view']}><FinancialReportsView /></ProtectedRoute>} />
      {/* Accounting Module Ã¢â‚¬â€ Phase 42 */}
      <Route path="/accounting/dashboard" element={
        <ProtectedRoute allowedPermissions={['accounting.view']}>
          <AccountingDashboard />
        </ProtectedRoute>
      } />
      <Route path="/accounting/chart-of-accounts" element={
        <ProtectedRoute allowedPermissions={['accounting.accounts.manage']}>
          <ChartOfAccounts />
        </ProtectedRoute>
      } />
      <Route path="/accounting/journals" element={
        <ProtectedRoute allowedPermissions={['accounting.journal.post']}>
          <JournalEntryDesk />
        </ProtectedRoute>
      } />
      <Route path="/accounting/ledger" element={
        <ProtectedRoute allowedPermissions={['accounting.ledger.view']}>
          <GeneralLedgerView />
        </ProtectedRoute>
      } />
      <Route path="/accounting/trial-balance" element={
        <ProtectedRoute allowedPermissions={['accounting.trial_balance.view']}>
          <TrialBalanceView />
        </ProtectedRoute>
      } />
      <Route path="/accounting/expenses" element={
        <ProtectedRoute allowedPermissions={['accounting.expense.manage']}>
          <ExpenseManager />
        </ProtectedRoute>
      } />
      <Route path="/accounting/budgets" element={
        <ProtectedRoute allowedPermissions={['accounting.view']}>
          <BudgetManager />
        </ProtectedRoute>
      } />
      <Route path="/accounting/reports" element={
        <ProtectedRoute allowedPermissions={['accounting.view']}>
          <FinancialReportsView />
        </ProtectedRoute>
      } />

      {/* Parent Portal */}
      <Route path="/parent/fees" element={
        <ProtectedRoute allowedRoles={['Parent', 'Student']}>
          <ParentFeePortal />
        </ProtectedRoute>
      } />
      {/* Examination Routes */}
      <Route path="/examination" element={<Navigate to="/examination/dashboard" replace />} />
      <Route path="/examination/dashboard" element={<ProtectedRoute allowedPermissions={['examination.view', 'exams.view']}><ExaminationDashboard /></ProtectedRoute>} />
      <Route path="/examination/manage" element={<ProtectedRoute allowedPermissions={['examination.manage', 'exams.manage']}><ExamManager /></ProtectedRoute>} />
      <Route path="/examination/calendar" element={<ProtectedRoute allowedPermissions={['examination.view', 'exams.view']}><ExamCalendar /></ProtectedRoute>} />
      <Route path="/examination/types" element={<ProtectedRoute allowedPermissions={['examination.manage', 'exams.manage']}><ExamTypeManager /></ProtectedRoute>} />
      <Route path="/examination/logistics" element={<ProtectedRoute allowedPermissions={['exam.seating.manage', 'examination.manage']}><ExamLogisticsManager /></ProtectedRoute>} />
      <Route path="/examination/attendance" element={<ProtectedRoute allowedPermissions={['examination.manage', 'exams.manage']}><ExamAttendanceManager /></ProtectedRoute>} />
      <Route path="/examination/question-bank" element={<ProtectedRoute allowedPermissions={['exam.question.view', 'examination.view']}><QuestionBankManager /></ProtectedRoute>} />
      <Route path="/examination/question-papers" element={<ProtectedRoute allowedPermissions={['exam.question.view', 'examination.manage']}><QuestionPaperBuilder /></ProtectedRoute>} />
      <Route path="/examination/marks-entry" element={<ProtectedRoute allowedPermissions={['exams.manage', 'examination.manage']}><MarksEntryDesk /></ProtectedRoute>} />
      <Route path="/examination/marks-import" element={<ProtectedRoute allowedPermissions={['exams.manage', 'examination.manage']}><MarksImport /></ProtectedRoute>} />
      <Route path="/examination/verification" element={<ProtectedRoute allowedPermissions={['exams.manage', 'examination.manage']}><ResultVerificationBoard /></ProtectedRoute>} />
      <Route path="/examination/moderation" element={<ProtectedRoute allowedPermissions={['exams.manage', 'examination.manage']}><MarksModeration /></ProtectedRoute>} />
      <Route path="/examination/process-results" element={<ProtectedRoute allowedPermissions={['exams.manage', 'examination.manage']}><ResultProcessor /></ProtectedRoute>} />
      <Route path="/examination/result-publisher" element={<ProtectedRoute allowedPermissions={['exams.manage', 'examination.manage']}><ResultPublisher /></ProtectedRoute>} />
      <Route path="/examination/report-cards" element={<ProtectedRoute allowedPermissions={['exams.view', 'examination.view']}><ReportCardGenerator /></ProtectedRoute>} />
      <Route path="/examination/ranking" element={<ProtectedRoute allowedPermissions={['exams.view', 'examination.view']}><RankingBoard /></ProtectedRoute>} />
      <Route path="/examination/analytics" element={<ProtectedRoute allowedPermissions={['exams.view', 'examination.view']}><PerformanceAnalytics /></ProtectedRoute>} />
      <Route path="/examination/reports" element={<ProtectedRoute allowedPermissions={['exams.view', 'examination.view']}><ExamReports /></ProtectedRoute>} />
      <Route path="/examination/settings" element={<ProtectedRoute allowedPermissions={['exams.manage', 'examination.manage']}><ExamSettings /></ProtectedRoute>} />

      {/* Legacy /exam/ Aliases */}
      <Route path="/exam/dashboard" element={<Navigate to="/examination/dashboard" replace />} />
      <Route path="/exam/setup" element={<ProtectedRoute allowedPermissions={['exams.manage']}><ExamSetup /></ProtectedRoute>} />
      <Route path="/exam/schedule" element={<ProtectedRoute allowedPermissions={['exams.view']}><ExamScheduleView /></ProtectedRoute>} />
      <Route path="/exam/marks" element={<ProtectedRoute allowedPermissions={['exams.manage']}><MarksEntry /></ProtectedRoute>} />
      <Route path="/exam/results" element={<ProtectedRoute allowedPermissions={['exams.view']}><ResultsDashboard /></ProtectedRoute>} />
      <Route path="/exam/report-card" element={<ProtectedRoute allowedPermissions={['exams.view']}><ReportCardView /></ProtectedRoute>} />
      <Route path="/exam/question-bank" element={<ProtectedRoute allowedPermissions={['exam.question.view']}><QuestionBankManager /></ProtectedRoute>} />
      <Route path="/exam/logistics" element={<ProtectedRoute allowedPermissions={['exam.seating.manage']}><ExamLogisticsManager /></ProtectedRoute>} />
      <Route path="/exam/revaluation" element={<ProtectedRoute allowedPermissions={['exam.revaluation.manage']}><RevaluationDesk /></ProtectedRoute>} />
      <Route path="/exam/supplementary" element={<ProtectedRoute allowedPermissions={['exam.supplementary.manage']}><SupplementaryExamDesk /></ProtectedRoute>} />

      {/* Academic Progression Routes */}
      <Route path="/promotion" element={<Navigate to="/promotion/dashboard" replace />} />
      <Route path="/promotion/dashboard" element={<ProtectedRoute allowedPermissions={['promotion.view']}><PromotionDashboard /></ProtectedRoute>} />
      <Route path="/promotion/policies" element={<ProtectedRoute allowedPermissions={['promotion.view', 'promotion.config']}><PromotionPolicyManager /></ProtectedRoute>} />
      <Route path="/promotion/eligibility" element={<ProtectedRoute allowedPermissions={['promotion.view', 'promotion.evaluate']}><EligibilityEngineView /></ProtectedRoute>} />
      <Route path="/promotion/approval" element={<ProtectedRoute allowedPermissions={['promotion.view', 'promotion.approve']}><PromotionApproval /></ProtectedRoute>} />
      <Route path="/promotion/subject-allocation" element={<ProtectedRoute allowedPermissions={['promotion.view', 'promotion.allocate']}><SubjectAllocationBoard /></ProtectedRoute>} />
      <Route path="/promotion/rollover" element={<ProtectedRoute allowedPermissions={['promotion.view', 'promotion.rollover']}><AcademicYearRollover /></ProtectedRoute>} />
      
      {/* Additional Transport Views */}
      <Route path="/transport/driver" element={<ProtectedRoute><DriverView /></ProtectedRoute>} />
      <Route path="/transport/tracking" element={<ProtectedRoute allowedRoles={['Parent', 'Student']}><ParentTrackingView /></ProtectedRoute>} />
      
      {/* Hostel Module - Redirect to Warden Dashboard Suite */}
      <Route path="/hostel" element={<Navigate to="/hostel/dashboard" replace />} />

      
      {/* Additional Library Views */}
      <Route path="/library/reservations" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <ReservationQueue />
        </ProtectedRoute>
      } />
      <Route path="/library/digital-library" element={
        <ProtectedRoute>
          <DigitalLibrary />
        </ProtectedRoute>
      } />
      <Route path="/library/members" element={
        <ProtectedRoute allowedPermissions={['library.view']}>
          <LibraryMemberManagement />
        </ProtectedRoute>
      } />
      <Route path="/library/vendors" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <LibraryVendorManagement />
        </ProtectedRoute>
      } />
      <Route path="/library/purchase-requests" element={
        <ProtectedRoute allowedPermissions={['library.view']}>
          <PurchaseRequestManager />
        </ProtectedRoute>
      } />
      <Route path="/library/overdue" element={
        <ProtectedRoute allowedPermissions={['library.view']}>
          <OverdueManagement />
        </ProtectedRoute>
      } />
      <Route path="/library/lost-damaged" element={
        <ProtectedRoute allowedPermissions={['library.manage']}>
          <LostDamagedManagement />
        </ProtectedRoute>
      } />
      <Route path="/library/reports" element={
        <ProtectedRoute allowedPermissions={['library.view']}>
          <LibraryReports />
        </ProtectedRoute>
      } />

      {/* Helpdesk & Complaints */}
      <Route path="/complaints" element={
        <ProtectedRoute allowedPermissions={['*']}>
          <ComplaintsList />
        </ProtectedRoute>
      } />
      
      {/* Communication Module */}
      <Route path="/communication/*" element={
        <ProtectedRoute>
          <CommunicationRoutes />
        </ProtectedRoute>
      } />
      
      {/* Health Module */}
      <Route path="/health/dashboard" element={<ProtectedRoute allowedPermissions={['health.view']}><HealthDashboard /></ProtectedRoute>} />
      <Route path="/health/profiles" element={<ProtectedRoute allowedPermissions={['health.view']}><StudentHealthProfiles /></ProtectedRoute>} />
      <Route path="/health/clinic" element={<ProtectedRoute allowedPermissions={['health.manage']}><ClinicDesk /></ProtectedRoute>} />
      <Route path="/health/medication" element={<ProtectedRoute allowedPermissions={['health.manage']}><MedicationManager /></ProtectedRoute>} />
      <Route path="/health/screening" element={<ProtectedRoute allowedPermissions={['health.manage']}><HealthScreeningDesk /></ProtectedRoute>} />
      <Route path="/health/emergency" element={<ProtectedRoute allowedPermissions={['health.manage']}><EmergencyManager /></ProtectedRoute>} />

      {/* Safety & Security */}
      <Route path="/safety/dashboard" element={<ProtectedRoute allowedPermissions={['safety.view']}><SafetyDashboard /></ProtectedRoute>} />
      <Route path="/safety/security" element={<ProtectedRoute allowedPermissions={['safety.view']}><SecurityDashboard /></ProtectedRoute>} />
      <Route path="/safety/command-center" element={<ProtectedRoute allowedPermissions={['safety.manage']}><EmergencyCommandCenter /></ProtectedRoute>} />
      <Route path="/safety/risks" element={<ProtectedRoute allowedPermissions={['safety.manage']}><RiskAndInspectionManager /></ProtectedRoute>} />
      <Route path="/safety/incidents" element={<ProtectedRoute allowedPermissions={['safety.manage']}><IncidentManager /></ProtectedRoute>} />

      {/* Alumni */}
      <Route path="/alumni/dashboard" element={<ProtectedRoute allowedPermissions={['alumni.view']}><AlumniDashboard /></ProtectedRoute>} />
      <Route path="/alumni/directory" element={<ProtectedRoute allowedPermissions={['alumni.directory.view']}><AlumniDirectory /></ProtectedRoute>} />
      <Route path="/alumni/mentorship" element={<ProtectedRoute allowedPermissions={['alumni.mentorship.view']}><MentorshipHub /></ProtectedRoute>} />
      <Route path="/alumni/jobs" element={<ProtectedRoute allowedPermissions={['alumni.jobs.view']}><AlumniJobBoard /></ProtectedRoute>} />
      <Route path="/alumni/fundraising" element={<ProtectedRoute allowedPermissions={['alumni.contributions.view']}><FundraisingCampaigns /></ProtectedRoute>} />

      {/* Events */}
      <Route path="/events/dashboard" element={<ProtectedRoute allowedPermissions={['events.view']}><EventDashboard /></ProtectedRoute>} />
      <Route path="/events/calendar" element={<ProtectedRoute allowedPermissions={['events.view']}><EventCalendar /></ProtectedRoute>} />
      <Route path="/events/cultural" element={<ProtectedRoute allowedPermissions={['events.view']}><CulturalFestivals /></ProtectedRoute>} />
      <Route path="/events/registration" element={<ProtectedRoute allowedPermissions={['events.view']}><EventRegistrationHub /></ProtectedRoute>} />
      <Route path="/events/competitions" element={<ProtectedRoute allowedPermissions={['events.view']}><CompetitionManager /></ProtectedRoute>} />
      <Route path="/events/trips" element={<ProtectedRoute allowedPermissions={['events.view']}><TripManager /></ProtectedRoute>} />
      <Route path="/events/clubs" element={<ProtectedRoute allowedPermissions={['events.manage_clubs']}><ClubManager /></ProtectedRoute>} />
      <Route path="/events/birthdays" element={<ProtectedRoute allowedPermissions={['events.view']}><BirthdayAnniversaryDashboard /></ProtectedRoute>} />
      <Route path="/events/prayers" element={<ProtectedRoute allowedPermissions={['events.view']}><PrayerAssemblyManager /></ProtectedRoute>} />
      
      {/* Engagement */}
      <Route path="/engagement/houses" element={<ProtectedRoute allowedPermissions={['houses.view']}><HouseManager /></ProtectedRoute>} />
      <Route path="/engagement/elections" element={<ProtectedRoute allowedPermissions={['leadership.view']}><ElectionDashboard /></ProtectedRoute>} />
      <Route path="/engagement/achievements" element={<ProtectedRoute allowedPermissions={['activities.view']}><AchievementManager /></ProtectedRoute>} />
      <Route path="/engagement/portfolio" element={<ProtectedRoute allowedPermissions={['activities.view']}><StudentPortfolioView /></ProtectedRoute>} />

      {/* Career & Placements */}
      <Route path="/career/dashboard" element={<ProtectedRoute allowedPermissions={['placements.view']}><CareerDashboard /></ProtectedRoute>} />
      <Route path="/career/counseling" element={<ProtectedRoute allowedPermissions={['career.counseling.manage']}><CounselingPortal /></ProtectedRoute>} />
      <Route path="/career/higher-ed" element={<ProtectedRoute allowedPermissions={['higher_education.view']}><HigherEdTracker /></ProtectedRoute>} />
      <Route path="/career/placements" element={<ProtectedRoute allowedPermissions={['placements.drives.manage']}><PlacementDriveManager /></ProtectedRoute>} />
      <Route path="/career/student-hub" element={<ProtectedRoute allowedPermissions={['career.view']}><StudentCareerHub /></ProtectedRoute>} />
      <Route path="/career/referrals" element={<ProtectedRoute><ReferralHub /></ProtectedRoute>} />

      {/* Operations & Control Center */}
      <Route path="/operations/dashboard" element={<ProtectedRoute allowedPermissions={['control_center.view']}><ControlCenterDashboard /></ProtectedRoute>} />
      <Route path="/operations/tasks" element={<ProtectedRoute allowedPermissions={['tasks.view']}><TaskBoard /></ProtectedRoute>} />
      <Route path="/operations/approvals" element={<ProtectedRoute allowedPermissions={['approvals.view']}><ApprovalInbox /></ProtectedRoute>} />
      <Route path="/operations/requests" element={<ProtectedRoute allowedPermissions={['requests.view']}><RequestPortal /></ProtectedRoute>} />
      <Route path="/operations/complaints" element={<ProtectedRoute allowedPermissions={['control_center.view']} allowedRoles={['Admin', 'School Admin', 'Principal', 'Staff', 'Teacher']}><ComplaintsManager /></ProtectedRoute>} />

      {/* Asset Management */}
      <Route path="/assets/dashboard" element={<ProtectedRoute allowedPermissions={['assets.view']}><AssetDashboard /></ProtectedRoute>} />
      <Route path="/assets/registry" element={<ProtectedRoute allowedPermissions={['assets.view']}><AssetRegistry /></ProtectedRoute>} />
      <Route path="/assets/maintenance" element={<ProtectedRoute allowedPermissions={['assets.view']}><MaintenanceDashboard /></ProtectedRoute>} />
      <Route path="/assets/work-orders" element={<ProtectedRoute allowedPermissions={['assets.view']}><WorkOrderKanban /></ProtectedRoute>} />

      {/* Facilities Management */}
      <Route path="/facilities/dashboard" element={<ProtectedRoute allowedPermissions={['facilities.view']}><FacilityDashboard /></ProtectedRoute>} />
      <Route path="/facilities/bookings" element={<ProtectedRoute allowedPermissions={['facilities.view']}><FacilityBookingCalendar /></ProtectedRoute>} />

      {/* Procurement & Inventory */}
      <Route path="/procurement/dashboard" element={<ProtectedRoute allowedPermissions={['inventory.view']}><ProcurementDashboard /></ProtectedRoute>} />
      <Route path="/inventory/ledger" element={<ProtectedRoute allowedPermissions={['inventory.view']}><StockLedger /></ProtectedRoute>} />

      {/* Health & Wellness */}
      <Route path="/admin/health/dashboard" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage']}><HealthDashboard /></ProtectedRoute>} />
      <Route path="/admin/health/profiles" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage', 'health.profile.view']}><StudentHealthProfiles /></ProtectedRoute>} />
      <Route path="/admin/health/visits" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage', 'health.visit.view']}><MedicalVisits /></ProtectedRoute>} />
      <Route path="/admin/health/first-aid" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage', 'health.firstaid.manage']}><FirstAidLog /></ProtectedRoute>} />
      <Route path="/admin/health/emergency" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage']}><EmergencyManager /></ProtectedRoute>} />
      <Route path="/admin/health/emergencies" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage']}><EmergencyManager /></ProtectedRoute>} />
      <Route path="/admin/health/immunization" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage', 'health.immunization.manage']}><ImmunizationTracker /></ProtectedRoute>} />
      <Route path="/admin/health/alerts" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage', 'health.profile.view']}><MedicalAlerts /></ProtectedRoute>} />
      <Route path="/admin/health/emergency-contacts" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage', 'health.profile.view']}><EmergencyContacts /></ProtectedRoute>} />
      <Route path="/admin/health/incidents" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage', 'health.incident.manage']}><HealthIncidents /></ProtectedRoute>} />
      <Route path="/admin/health/wellness" element={<ProtectedRoute allowedPermissions={['health.view', 'health.manage']}><WellnessPrograms /></ProtectedRoute>} />

      {/* Campus Security */}
      <Route path="/security/watchman" element={<ProtectedRoute><WatchmanDashboard /></ProtectedRoute>} />
      <Route path="/watchman/dashboard" element={<ProtectedRoute><WatchmanDashboard /></ProtectedRoute>} />
      <Route path="/watchman" element={<Navigate to="/security/watchman" replace />} />
      <Route path="/admin/security/watchman" element={<ProtectedRoute><WatchmanDashboard /></ProtectedRoute>} />
      <Route path="/admin/security/dashboard" element={<ProtectedRoute allowedPermissions={['security.view']}><CampusSecurityDashboard /></ProtectedRoute>} />
      <Route path="/admin/security/visitors" element={<ProtectedRoute allowedPermissions={['security.visitor.view']}><VisitorRegistration /></ProtectedRoute>} />
      <Route path="/admin/security/pre-registration" element={<ProtectedRoute allowedPermissions={['security.visitor.manage']}><VisitorPreRegistration /></ProtectedRoute>} />
      <Route path="/admin/security/pickup" element={<ProtectedRoute allowedPermissions={['security.pickup.view']}><StudentPickupManager /></ProtectedRoute>} />
      <Route path="/admin/security/vehicles" element={<ProtectedRoute allowedPermissions={['security.vehicle.view']}><VehicleManager /></ProtectedRoute>} />
      <Route path="/admin/security/gate-passes" element={<ProtectedRoute allowedPermissions={['security.pass.view']}><GatePassManager /></ProtectedRoute>} />
      <Route path="/admin/security/deliveries" element={<ProtectedRoute allowedPermissions={['security.delivery.view']}><DeliveryManager /></ProtectedRoute>} />
      <Route path="/admin/security/incidents" element={<ProtectedRoute allowedPermissions={['security.incident.view']}><SecurityIncidents /></ProtectedRoute>} />
      <Route path="/admin/security/lockdown" element={<ProtectedRoute allowedPermissions={['security.lockdown.view']}><LockdownManager /></ProtectedRoute>} />
      <Route path="/admin/security/shifts" element={<ProtectedRoute allowedPermissions={['security.shift.view']}><GuardShiftManager /></ProtectedRoute>} />
      <Route path="/admin/security/lost-found" element={<ProtectedRoute allowedPermissions={['security.view']}><LostFoundManager /></ProtectedRoute>} />
      <Route path="/admin/security/audit" element={<ProtectedRoute allowedPermissions={['security.audit.view']}><AccessAudit /></ProtectedRoute>} />
      
      {/* Hostel Management Submodules */}
      <Route path="/hostel/structure" element={<ProtectedRoute><HostelStructure /></ProtectedRoute>} />
      <Route path="/hostel/attendance" element={<ProtectedRoute><HostelAttendance /></ProtectedRoute>} />
      <Route path="/hostel/allocation" element={<ProtectedRoute><AllocationManagement /></ProtectedRoute>} />
      <Route path="/hostel/operations" element={<ProtectedRoute><HostelOperations /></ProtectedRoute>} />
      <Route path="/hostel/mess" element={<ProtectedRoute><HostelMessManagement /></ProtectedRoute>} />
      <Route path="/hostel/complaints" element={<ProtectedRoute><HostelComplaintsView /></ProtectedRoute>} />
      <Route path="/hostel/outpass" element={<ProtectedRoute><HostelOutpassManagement /></ProtectedRoute>} />

      {/* RBAC Role-Specific Dashboards */}
      <Route path="/office/dashboard" element={<ProtectedRoute><OfficeDashboard /></ProtectedRoute>} />
      <Route path="/office/bonafide" element={<ProtectedRoute><BonafideCertificateDesk /></ProtectedRoute>} />
      <Route path="/office/certificates" element={<ProtectedRoute><BonafideCertificateDesk /></ProtectedRoute>} />
      <Route path="/office/circulars" element={<ProtectedRoute><OfficeCircularsDesk /></ProtectedRoute>} />
      <Route path="/office/no-due" element={<ProtectedRoute><StudentNoDueDesk /></ProtectedRoute>} />
      <Route path="/student-portal/no-due" element={<ProtectedRoute><StudentNoDueDesk /></ProtectedRoute>} />
      <Route path="/examination/public-exams" element={<ProtectedRoute><PublicExamDesk /></ProtectedRoute>} />
      <Route path="/student-portal/public-exams" element={<ProtectedRoute><PublicExamDesk /></ProtectedRoute>} />
      <Route path="/staff/dashboard" element={<ProtectedRoute><NonTeachingStaffDashboard /></ProtectedRoute>} />

      {/* Kindergarten Wing & Early Childhood Module */}
      <Route path="/kindergarten" element={<Navigate to="/kindergarten/dashboard" replace />} />
      <Route path="/kindergarten/dashboard" element={<ProtectedRoute><KindergartenDashboard /></ProtectedRoute>} />
      <Route path="/kindergarten/students" element={<ProtectedRoute><KindergartenDashboard /></ProtectedRoute>} />
      <Route path="/kindergarten/activities" element={<ProtectedRoute><KindergartenDashboard /></ProtectedRoute>} />
      <Route path="/kindergarten/health" element={<ProtectedRoute><KindergartenDashboard /></ProtectedRoute>} />

      {/* Staff Self-Service Resignation & Exit Desk (All Roles) */}
      <Route path="/staff/resignation" element={<ProtectedRoute><StaffResignationPortal /></ProtectedRoute>} />
      <Route path="/resignation/apply" element={<ProtectedRoute><StaffResignationPortal /></ProtectedRoute>} />
      <Route path="/resignation" element={<Navigate to="/staff/resignation" replace />} />

      
      {/* --- INJECTED MISSING ROUTES --- */}
      <Route path="/student-portal/timetable" element={<ProtectedRoute><ClassTimetableView /></ProtectedRoute>} />
      <Route path="/student-portal/attendance" element={<ProtectedRoute><StudentAttendanceProfile /></ProtectedRoute>} />
      <Route path="/student-portal/marks" element={<ProtectedRoute><StudentResultView /></ProtectedRoute>} />
      <Route path="/student-portal/library" element={<ProtectedRoute><LibraryMemberPortal /></ProtectedRoute>} />
      <Route path="/student-portal/transport" element={<ProtectedRoute><ParentTrackingView /></ProtectedRoute>} />
      <Route path="/student-portal/settings" element={<ProtectedRoute><StudentSettingsView /></ProtectedRoute>} />
      <Route path="/teacher/notifications" element={<ProtectedRoute><PrincipalNotifications /></ProtectedRoute>} />
      <Route path="/hr/self-service/documents" element={<ProtectedRoute><EmployeeSelfService /></ProtectedRoute>} />
      <Route path="/teacher/settings" element={<ProtectedRoute><TeacherProfile /></ProtectedRoute>} />
      <Route path="/office/admissions" element={<ProtectedRoute><AdmissionReviewDashboard /></ProtectedRoute>} />
      <Route path="/office/students" element={<ProtectedRoute><StudentDirectory /></ProtectedRoute>} />
      <Route path="/office/enquiries" element={<ProtectedRoute><AdmissionApplicationWizard /></ProtectedRoute>} />
      <Route path="/office/visitors" element={<ProtectedRoute><VisitorRegistration /></ProtectedRoute>} />
      <Route path="/office/appointments" element={<ProtectedRoute><MeetingManager /></ProtectedRoute>} />
      <Route path="/office/fees" element={<ProtectedRoute><PaymentCollectionDesk /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsShell /></ProtectedRoute>} />
      <Route path="/teacher/coordinator" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />

      <Route path="/library/catalog" element={<ProtectedRoute><BookCatalogueManager /></ProtectedRoute>} />
      <Route path="/library/issue" element={<ProtectedRoute><CirculationDesk /></ProtectedRoute>} />
      <Route path="/sports/students" element={<ProtectedRoute><StudentDirectory /></ProtectedRoute>} />
      <Route path="/sports/sessions" element={<ProtectedRoute><SportsDashboard /></ProtectedRoute>} />
      <Route path="/sports/events" element={<ProtectedRoute><SportsDashboard /></ProtectedRoute>} />
      <Route path="/sports/equipment" element={<ProtectedRoute><SportsDashboard /></ProtectedRoute>} />

      <Route path="/hr/onboarding" element={<ProtectedRoute><StaffOnboardingWizard /></ProtectedRoute>} />
      <Route path="/hr/reports" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
      <Route path="/procurement" element={<ProtectedRoute><ProcurementDashboard /></ProtectedRoute>} />
      <Route path="/inventory/purchases" element={<ProtectedRoute><PurchaseOrderManager /></ProtectedRoute>} />
      <Route path="/procurement/goods-receiving" element={<ProtectedRoute><GoodsReceiving /></ProtectedRoute>} />
      <Route path="/inventory/items" element={<ProtectedRoute><ProductCatalog /></ProtectedRoute>} />

      
      {/* --- INJECTED LAB ROUTES (Unified Real-Time Hub) --- */}
      <Route path="/lab/dashboard" element={<ProtectedRoute><LabDashboard /></ProtectedRoute>} />
      <Route path="/lab/schedule" element={<ProtectedRoute><LabDashboard /></ProtectedRoute>} />
      <Route path="/lab/equipment" element={<ProtectedRoute><LabDashboard /></ProtectedRoute>} />
      <Route path="/lab/inventory" element={<ProtectedRoute><LabDashboard /></ProtectedRoute>} />
      <Route path="/lab/maintenance" element={<ProtectedRoute><LabDashboard /></ProtectedRoute>} />
      <Route path="/lab/bookings" element={<ProtectedRoute><LabDashboard /></ProtectedRoute>} />
      <Route path="/lab/attendance" element={<ProtectedRoute><LabDashboard /></ProtectedRoute>} />
      <Route path="/lab/observations" element={<ProtectedRoute><LabDashboard /></ProtectedRoute>} />
      {/* Top-Level Parent Segment Safe Redirects */}
      <Route path="/lab" element={<Navigate to="/lab/dashboard" replace />} />
      <Route path="/hr" element={<Navigate to="/hr/dashboard" replace />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
      <Route path="/student" element={<Navigate to="/student-portal/dashboard" replace />} />
      <Route path="/student-portal" element={<Navigate to="/student-portal/dashboard" replace />} />
      <Route path="/parent" element={<Navigate to="/parent-portal" replace />} />
      <Route path="/attendance" element={<Navigate to="/attendance/teacher" replace />} />
      <Route path="/finance" element={<Navigate to="/finance/dashboard" replace />} />
      <Route path="/timetable" element={<Navigate to="/timetable/teacher" replace />} />
      <Route path="/transport" element={<Navigate to="/transport/dashboard" replace />} />
      <Route path="/library" element={<Navigate to="/library/portal" replace />} />
      <Route path="/sports" element={<Navigate to="/sports/dashboard" replace />} />
      <Route path="/office" element={<Navigate to="/office/dashboard" replace />} />
      <Route path="/hostel" element={<Navigate to="/hostel/dashboard" replace />} />
      <Route path="/health" element={<Navigate to="/health/dashboard" replace />} />
      <Route path="/safety" element={<Navigate to="/safety/dashboard" replace />} />
      <Route path="/events" element={<Navigate to="/events/dashboard" replace />} />
      <Route path="/inventory" element={<Navigate to="/inventory/dashboard" replace />} />
      <Route path="/procurement" element={<Navigate to="/procurement/dashboard" replace />} />
      <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
      <Route path="/lms" element={<Navigate to="/lms/teacher/dashboard" replace />} />
      <Route path="/academic" element={<Navigate to="/academic/dashboard" replace />} />

      {/* Communication Module Routes */}
      <Route path="/communication" element={<Navigate to="/communication/announcements" replace />} />
      <Route path="/communication/announcements" element={<ProtectedRoute><AnnouncementManager /></ProtectedRoute>} />
      <Route path="/communication/dashboard" element={<ProtectedRoute><CommunicationDashboard /></ProtectedRoute>} />
      <Route path="/communication/compose" element={<ProtectedRoute><MessageComposer /></ProtectedRoute>} />
      <Route path="/communication/principal-announcer" element={<ProtectedRoute><PrincipalAnnouncer /></ProtectedRoute>} />
      <Route path="/communication/complaints" element={<ProtectedRoute><ComplaintDesk /></ProtectedRoute>} />
      <Route path="/communication/chat" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />

      {/* Global 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  );
};

export default App;
