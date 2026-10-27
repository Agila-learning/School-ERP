const fs = require('fs');

const missingRoutes = [
  { path: '/student-portal/timetable', comp: 'ClassTimetableView', file: './modules/timetable/pages/ClassTimetableView' },
  { path: '/student-portal/attendance', comp: 'StudentAttendanceProfile', file: './modules/attendance/pages/StudentAttendanceProfile' },
  { path: '/student-portal/marks', comp: 'StudentResultView', file: './modules/examination/pages/StudentResultView' },
  { path: '/student-portal/settings', comp: 'StudentProfileShell', file: './modules/students/pages/StudentProfileShell' },
  { path: '/teacher/notifications', comp: 'PrincipalNotifications', file: './modules/principal/pages/PrincipalNotifications' },
  { path: '/communication/teacher', comp: 'CommunicationDashboard', file: './modules/communication/pages/CommunicationDashboard' },
  { path: '/hr/self-service/documents', comp: 'EmployeeSelfService', file: './modules/hr/pages/EmployeeSelfService' },
  { path: '/teacher/settings', comp: 'TeacherProfile', file: './modules/hr/pages/TeacherProfile' },
  { path: '/office/admissions', comp: 'AdmissionReviewDashboard', file: './modules/admission/pages/AdmissionReviewDashboard' },
  { path: '/office/students', comp: 'StudentDirectory', file: './modules/students/pages/StudentDirectory' },
  { path: '/office/enquiries', comp: 'AdmissionApplicationWizard', file: './modules/admission/pages/AdmissionApplicationWizard' },
  { path: '/office/visitors', comp: 'VisitorRegistration', file: './modules/security/pages/VisitorRegistration' },
  { path: '/office/appointments', comp: 'MeetingManager', file: './modules/communication/pages/MeetingManager' },
  { path: '/office/fees', comp: 'PaymentCollectionDesk', file: './modules/finance/pages/PaymentCollectionDesk' },
  { path: '/communication/announcements', comp: 'AnnouncementManager', file: './modules/communication/pages/AnnouncementManager' },
  { path: '/admin/settings', comp: 'AdminSettingsShell', file: './modules/admin/pages/AdminSettingsShell' },
  { path: '/teacher/coordinator', comp: 'TeacherDashboard', file: './modules/hr/pages/TeacherDashboard' },
  { path: '/driver/vehicle', comp: 'FleetManagement', file: './modules/transport/pages/FleetManagement' },
  { path: '/driver/route', comp: 'RouteManagement', file: './modules/transport/pages/RouteManagement' },
  { path: '/driver/trip', comp: 'TripMonitor', file: './modules/transport/pages/TripMonitor' },
  { path: '/driver/notifications', comp: 'PrincipalNotifications', file: './modules/principal/pages/PrincipalNotifications' },
  { path: '/transport/vehicles', comp: 'FleetManagement', file: './modules/transport/pages/FleetManagement' },
  { path: '/transport/drivers', comp: 'TransportStaffManagement', file: './modules/transport/pages/TransportStaffManagement' },
  { path: '/transport/reports', comp: 'TransportDashboard', file: './modules/transport/pages/TransportDashboard' },
  { path: '/library/catalog', comp: 'BookCatalogueManager', file: './modules/library/pages/BookCatalogueManager' },
  { path: '/library/issue', comp: 'CirculationDesk', file: './modules/library/pages/CirculationDesk' },
  { path: '/sports/teams', comp: 'TeamManager', file: './modules/sports/pages/TeamManager' },
  { path: '/sports/students', comp: 'StudentDirectory', file: './modules/students/pages/StudentDirectory' },
  { path: '/sports/sessions', comp: 'EventCalendar', file: './modules/events/pages/EventCalendar' },
  { path: '/sports/events', comp: 'CompetitionManager', file: './modules/events/pages/CompetitionManager' },
  { path: '/sports/equipment', comp: 'ProductCatalog', file: './modules/inventory/pages/ProductCatalog' },
  { path: '/finance/fee-structures', comp: 'FeeSetupManager', file: './modules/finance/pages/FeeSetupManager' },
  { path: '/finance/collection', comp: 'PaymentCollectionDesk', file: './modules/finance/pages/PaymentCollectionDesk' },
  { path: '/finance/pending', comp: 'InvoiceDesk', file: './modules/finance/pages/InvoiceDesk' },
  { path: '/finance/reports', comp: 'FinancialReportsView', file: './modules/accounting/pages/FinancialReportsView' },
  { path: '/hr/onboarding', comp: 'StaffOnboardingWizard', file: './modules/staff/pages/StaffOnboardingWizard' },
  { path: '/hr/reports', comp: 'HRDashboard', file: './modules/hr/pages/HRDashboard' },
  { path: '/communication/dashboard', comp: 'CommunicationDashboard', file: './modules/communication/pages/CommunicationDashboard' },
  { path: '/communication/complaints', comp: 'ComplaintDesk', file: './modules/communication/pages/ComplaintDesk' },
  { path: '/communication/chat', comp: 'ChatWindow', file: './modules/communication/pages/ChatWindow' },
  { path: '/procurement', comp: 'ProcurementDashboard', file: './modules/procurement/pages/ProcurementDashboard' },
  { path: '/inventory/purchases', comp: 'PurchaseOrderManager', file: './modules/procurement/pages/PurchaseOrderManager' },
  { path: '/procurement/goods-receiving', comp: 'GoodsReceiving', file: './modules/procurement/pages/GoodsReceiving' },
  { path: '/inventory/items', comp: 'ProductCatalog', file: './modules/inventory/pages/ProductCatalog' },
  { path: '/leave/approve', comp: 'LeaveApprovalBoard', file: './modules/leave/pages/LeaveApprovalBoard' }
];

let appText = fs.readFileSync('C:/Users/agila/OneDrive/Documents/School-ERP_FIC/frontend/src/App.tsx', 'utf8');

let imports = '';
let routes = '\n      {/* --- INJECTED MISSING ROUTES --- */}\n';

missingRoutes.forEach(r => {
  if (!appText.includes(r.comp)) {
    imports += `import ${r.comp} from '${r.file}';\n`;
  }
  routes += `      <Route path="${r.path}" element={<ProtectedRoute><${r.comp} /></ProtectedRoute>} />\n`;
});

// Insert imports at the top
appText = appText.replace('const App: React.FC = () => {', imports + '\nconst App: React.FC = () => {');

// Insert routes before the Global 404 Fallback
appText = appText.replace('{/* Global 404 Fallback */}', routes + '\n      {/* Global 404 Fallback */}');

fs.writeFileSync('C:/Users/agila/OneDrive/Documents/School-ERP_FIC/frontend/src/App.tsx', appText);
console.log('App.tsx updated successfully');
