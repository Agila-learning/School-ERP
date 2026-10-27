import { Router } from 'express';
import { HostelController } from '../controllers/hostel.controller';
import { protect as requireAuth, requirePermission as checkPermissions } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware as requireTenant } from '../../../core/middlewares/tenant.middleware';

const router = Router();

router.use(requireAuth, requireTenant);

// --- DASHBOARD ---
router.get('/dashboard', checkPermissions('hostel.view'), HostelController.getDashboardStats);

// --- STRUCTURE ---
router.get('/', checkPermissions('hostel.view'), HostelController.getHostels);
router.post('/', checkPermissions('hostel.manage'), HostelController.createHostel);
router.put('/:id', checkPermissions('hostel.manage'), HostelController.updateHostel);
router.delete('/:id', checkPermissions('hostel.manage'), HostelController.deleteHostel);

router.get('/buildings', checkPermissions('hostel.view'), HostelController.getBuildings);
router.post('/buildings', checkPermissions('hostel.manage'), HostelController.createBuilding);
router.put('/buildings/:id', checkPermissions('hostel.manage'), HostelController.updateBuilding);
router.delete('/buildings/:id', checkPermissions('hostel.manage'), HostelController.deleteBuilding);

router.get('/blocks', checkPermissions('hostel.view'), HostelController.getBlocks);
router.post('/blocks', checkPermissions('hostel.manage'), HostelController.createBlock);
router.put('/blocks/:id', checkPermissions('hostel.manage'), HostelController.updateBlock);
router.delete('/blocks/:id', checkPermissions('hostel.manage'), HostelController.deleteBlock);

router.get('/floors', checkPermissions('hostel.view'), HostelController.getFloors);
router.post('/floors', checkPermissions('hostel.manage'), HostelController.createFloor);
router.put('/floors/:id', checkPermissions('hostel.manage'), HostelController.updateFloor);
router.delete('/floors/:id', checkPermissions('hostel.manage'), HostelController.deleteFloor);

router.get('/rooms', checkPermissions('hostel.view'), HostelController.getRooms);
router.post('/rooms', checkPermissions('hostel.manage'), HostelController.createRoom);
router.put('/rooms/:id', checkPermissions('hostel.manage'), HostelController.updateRoom);
router.delete('/rooms/:id', checkPermissions('hostel.manage'), HostelController.deleteRoom);

router.get('/beds', checkPermissions('hostel.view'), HostelController.getBeds);
router.post('/beds', checkPermissions('hostel.manage'), HostelController.createBed);
router.put('/beds/:id', checkPermissions('hostel.manage'), HostelController.updateBed);
router.delete('/beds/:id', checkPermissions('hostel.manage'), HostelController.deleteBed);

// --- ALLOCATION ---
router.get('/applications', checkPermissions('hostel.view'), HostelController.getApplications);
router.post('/applications', checkPermissions('hostel.view'), HostelController.createApplication);
router.get('/allocations', checkPermissions('hostel.view'), HostelController.getAllocations);
router.post('/allocate', checkPermissions('hostel.allocate'), HostelController.allocateBed);
router.post('/checkin', checkPermissions('hostel.checkin'), HostelController.checkIn);
router.post('/checkout', checkPermissions('hostel.checkout'), HostelController.checkOut);
router.post('/transfer', checkPermissions('hostel.allocate'), HostelController.transferRoom);

// --- ATTENDANCE ---
router.get('/attendance', checkPermissions('hostel.attendance'), HostelController.getAttendance);
router.post('/attendance', checkPermissions('hostel.attendance'), HostelController.markAttendance);
router.get('/attendance/active-students', checkPermissions('hostel.attendance'), HostelController.getActiveStudentsForAttendance);

// --- COMPLAINTS & INCIDENTS ---
router.get('/complaints', checkPermissions('hostel.view'), HostelController.getComplaints);
router.get('/complaints/my', checkPermissions('hostel.view'), HostelController.getMyComplaints);
router.post('/complaints', checkPermissions('hostel.view'), HostelController.createComplaint);
router.put('/complaints/:id/status', checkPermissions('hostel.manage'), HostelController.updateComplaintStatus);
router.get('/incidents', checkPermissions('hostel.view'), HostelController.getIncidents);
router.post('/incidents', checkPermissions('hostel.manage'), HostelController.createIncident);

// --- VISITORS ---
router.get('/visitors', checkPermissions('hostel.view'), HostelController.getVisitors);
router.post('/visitors/checkin', checkPermissions('hostel.manage'), HostelController.checkInVisitor);
router.put('/visitors/:id/checkout', checkPermissions('hostel.manage'), HostelController.checkOutVisitor);

// --- OPERATIONS ---
router.get('/outpasses', checkPermissions('hostel.outpass'), HostelController.getOutpasses);
router.post('/outpasses', checkPermissions('hostel.outpass'), HostelController.createOutpass);
router.put('/outpasses/:id/status', checkPermissions('hostel.manage'), HostelController.updateOutpassStatus);

// --- MESS ---
router.get('/mess/meal-plans', checkPermissions('hostel.mess'), HostelController.getMealPlans);
router.post('/mess/meal-plans', checkPermissions('hostel.mess'), HostelController.createMealPlan);
router.put('/mess/meal-plans/:id', checkPermissions('hostel.mess'), HostelController.updateMealPlan);
router.delete('/mess/meal-plans/:id', checkPermissions('hostel.mess'), HostelController.deleteMealPlan);
router.get('/mess/feedback', checkPermissions('hostel.mess'), HostelController.getMessFeedback);
router.post('/mess/feedback', checkPermissions('hostel.view'), HostelController.submitMessFeedback);

export default router;
