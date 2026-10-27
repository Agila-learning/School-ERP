import express from 'express';
import * as Controller from '../controllers/organization.controller';
import { protect, requirePermission } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { validate } from '../../../core/middlewares/validate.middleware';
import * as Validator from '../validators/organization.validator';

const router = express.Router();

// Require tenant context and 'organization.manage' permission
router.use(tenantMiddleware, protect, requirePermission('organization.manage'));

// Schools
router.post('/schools', validate(Validator.createSchoolSchema), Controller.createSchool);
router.get('/schools', Controller.getSchools);

// Branches
router.post('/branches', validate(Validator.createBranchSchema), Controller.createBranch);
router.get('/branches', Controller.getBranches);
router.put('/branches/:id', Controller.updateBranch);

// Campuses
router.post('/campuses', validate(Validator.createCampusSchema), Controller.createCampus);

// Buildings
router.post('/buildings', validate(Validator.createBuildingSchema), Controller.createBuilding);

// Rooms
router.get('/rooms', Controller.getRooms);
router.post('/rooms', validate(Validator.createRoomSchema), Controller.createRoom);

// Departments
router.post('/departments', validate(Validator.createDepartmentSchema), Controller.createDepartment);
router.get('/departments', Controller.getDepartments);
router.put('/departments/:id', Controller.updateDepartment);

export default router;
