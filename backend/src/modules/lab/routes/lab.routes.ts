import { Router } from 'express';
import { LabController } from '../controllers/lab.controller';
import { protect, restrictTo } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = Router();

// Apply auth and tenant middlewares to all routes
router.use(protect);
router.use(tenantMiddleware);

// --- Dashboard Stats ---
router.route('/dashboard-stats')
  .get(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER'), LabController.getDashboardStats);

// --- Laboratories ---
router.route('/laboratories')
  .get(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER'), LabController.getLaboratories)
  .post(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN'), LabController.createLaboratory);

router.route('/laboratories/:id')
  .patch(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN'), LabController.updateLaboratory)
  .delete(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL'), LabController.deleteLaboratory);

// --- Equipment ---
router.route('/equipment')
  .get(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER'), LabController.getEquipment)
  .post(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN'), LabController.createEquipment);

router.route('/equipment/:id')
  .patch(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN'), LabController.updateEquipment)
  .delete(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN'), LabController.deleteEquipment);

// --- Inventory ---
router.route('/inventory')
  .get(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER'), LabController.getInventory)
  .post(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN'), LabController.createInventory);

router.route('/inventory/:id')
  .patch(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN'), LabController.updateInventory)
  .delete(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN'), LabController.deleteInventory);

// --- Bookings ---
router.route('/bookings')
  .get(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER', 'COORDINATOR', 'CLASS_COORDINATOR'), LabController.getBookings)
  .post(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'TEACHER', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'COORDINATOR', 'CLASS_COORDINATOR'), LabController.createBooking);

router.route('/bookings/:id')
  .patch(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER', 'COORDINATOR', 'CLASS_COORDINATOR'), LabController.updateBooking)
  .delete(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER', 'COORDINATOR', 'CLASS_COORDINATOR'), LabController.deleteBooking);

// --- Sessions ---
router.route('/sessions')
  .get(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER', 'COORDINATOR', 'CLASS_COORDINATOR', 'STUDENT'), LabController.getSessions)
  .post(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER', 'COORDINATOR', 'CLASS_COORDINATOR'), LabController.createSession);

router.route('/sessions/:id')
  .patch(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER', 'COORDINATOR', 'CLASS_COORDINATOR'), LabController.updateSession)
  .delete(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER', 'COORDINATOR', 'CLASS_COORDINATOR'), LabController.deleteSession);

// --- Maintenance ---
router.route('/maintenance')
  .get(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER'), LabController.getMaintenance)
  .post(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN', 'TEACHER'), LabController.createMaintenance);

router.route('/maintenance/:id')
  .patch(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN'), LabController.updateMaintenance)
  .delete(restrictTo('SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'LAB_INCHARGE', 'LAB_TECHNICIAN'), LabController.deleteMaintenance);

export default router;
