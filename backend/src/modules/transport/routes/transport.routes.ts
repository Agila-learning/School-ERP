import { Router } from 'express';
import { TransportController, TripController } from '../controllers/transport.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';

const router = Router();
router.use(tenantMiddleware, protect);

// Dashboard
router.get('/dashboard', requirePermission('transport.view'), TransportController.getDashboardStats);

// Staff (Drivers/Attendants)
router.get('/staff', requirePermission('transport.view'), TransportController.getStaff);
router.post('/staff', requirePermission('transport.manage'), TransportController.createStaff);
router.patch('/staff/:id', requirePermission('transport.manage'), TransportController.updateStaff);
router.delete('/staff/:id', requirePermission('transport.manage'), TransportController.deleteStaff);

// Vehicles & Fleet
router.get('/fleet', requirePermission('transport.vehicle.view'), TransportController.getVehicles);
router.get('/vehicles', requirePermission('transport.vehicle.view'), TransportController.getVehicles);
router.post('/vehicles', requirePermission('transport.vehicle.manage'), TransportController.createVehicle);
router.patch('/vehicles/:id', requirePermission('transport.vehicle.manage'), TransportController.updateVehicle);
router.delete('/vehicles/:id', requirePermission('transport.vehicle.manage'), TransportController.deleteVehicle);

// Routes & Stops
router.get('/routes', requirePermission('transport.route.view'), TransportController.getRoutes);
router.post('/routes', requirePermission('transport.route.manage'), TransportController.createRoute);
router.patch('/routes/:id', requirePermission('transport.route.manage'), TransportController.updateRoute);
router.delete('/routes/:id', requirePermission('transport.route.manage'), TransportController.deleteRoute);
router.get('/routes/:routeId/stops', requirePermission('transport.route.view'), TransportController.getRouteStops);
router.post('/routes/:routeId/stops', requirePermission('transport.route.manage'), TransportController.createRouteStop);
router.patch('/routes/:routeId/stops/:stopId', requirePermission('transport.route.manage'), TransportController.updateRouteStop);
router.delete('/routes/:routeId/stops/:stopId', requirePermission('transport.route.manage'), TransportController.deleteRouteStop);

// Assignments
router.get('/assignments', requirePermission('transport.assign.view'), TransportController.getAssignments);
router.post('/assignments', requirePermission('transport.assign.manage'), TransportController.assignStudent);
router.patch('/assignments/:id', requirePermission('transport.assign.manage'), TransportController.updateAssignment);
router.delete('/assignments/:id', requirePermission('transport.assign.manage'), TransportController.removeAssignment);

// Trips & Driver Real-Time Execution
router.get('/driver/today', TripController.getDriverTodayTrip);
router.patch('/trips/:tripId/status', TripController.updateTripStatus);
router.get('/trips', TripController.getTrips);
router.post('/trips', TripController.createTrip);
router.patch('/trips/:tripId/cancel', TripController.cancelTrip);
router.post('/trips/:tripId/start', TripController.startTrip);
router.post('/trips/:tripId/end', TripController.endTrip);
router.post('/trips/:tripId/boarding', TripController.recordBoarding);
router.get('/trips/:tripId/gps', TripController.getLatestGPS);

// Maintenance
router.get('/maintenance', requirePermission('transport.vehicle.view'), TransportController.getMaintenanceRecords);
router.post('/maintenance', requirePermission('transport.vehicle.manage'), TransportController.createMaintenanceRecord);
router.patch('/maintenance/:id', requirePermission('transport.vehicle.manage'), TransportController.updateMaintenanceRecord);
router.delete('/maintenance/:id', requirePermission('transport.vehicle.manage'), TransportController.deleteMaintenanceRecord);

// Reports
router.get('/reports', requirePermission('transport.report.view'), TransportController.getTransportReport);

export default router;
