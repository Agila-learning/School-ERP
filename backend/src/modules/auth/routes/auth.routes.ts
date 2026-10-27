import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, inviteUser, acceptInvitation, refresh, logout } from '../controllers/auth.controller';
import { protect } from '../../../core/middlewares/auth.middleware';
import { tenantMiddleware } from '../../../core/middlewares/tenant.middleware';
import { validate } from '../../../core/middlewares/validate.middleware';
import { loginSchema } from '../validators/auth.validator';
import TeacherAssignment from '../../academic/models/TeacherAssignment.model';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 500,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

const router = express.Router();

router.post('/login', tenantMiddleware, authLimiter, validate(loginSchema), login);
router.post('/invite', tenantMiddleware, protect, inviteUser);
router.post('/accept-invitation', acceptInvitation);
router.post('/refresh', tenantMiddleware, refresh);
router.post('/logout', tenantMiddleware, protect, logout);

/**
 * GET /me
 * Returns full user profile including roles, permissions, and responsibilities
 * (teacher assignments if applicable).
 */
router.get('/me', tenantMiddleware, protect, async (req: any, res) => {
  try {
    await req.user.populate('roleIds');
    const populatedRoles = (req.user.roleIds as any[]).filter((r: any) => r != null);
    const roleNames = populatedRoles.map((r: any) => (r.name ?? '').toUpperCase().trim());
    const isTeacher = roleNames.some((r: string) =>
      ['TEACHER', 'CLASS TEACHER', 'CLASS_TEACHER', 'CLASS COORDINATOR', 'CLASS_COORDINATOR'].includes(r)
    );

    let responsibilities: any[] = [];
    if (isTeacher) {
      responsibilities = await TeacherAssignment.find({
        tenantId: req.tenantId,
        userId: req.user._id,
        status: 'ACTIVE',
        isDeleted: { $ne: true },
      })
        .populate('classId', 'name')
        .populate('sectionId', 'name')
        .populate('subjectId', 'name code')
        .lean();
    }

    res.json({
      success: true,
      data: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        accountStatus: req.user.accountStatus,
        roles: populatedRoles,
        responsibilities,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
});

/**
 * GET /demo-info
 * Returns demo credentials list — only available in non-production environments.
 * Credentials are served from backend, NOT stored in frontend source code.
 * NOTE: No tenantMiddleware — this is public endpoint for demo purposes.
 */
router.get('/demo-info', (req: any, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  const schoolCode = 'FIC001';
  const demoAccounts = [
    { role: 'Super Admin',       email: 'superadmin@ficschool.edu', password: 'SuperAdmin@1234',  school: schoolCode },
    { role: 'School Admin',      email: 'admin@ficschool.edu',      password: 'Admin@1234',       school: schoolCode },
    { role: 'Principal',         email: 'principal@ficschool.edu',  password: 'Principal@1234',   school: schoolCode },
    { role: 'Teacher + Coord',   email: 'teacher@ficschool.edu',    password: 'Teacher@1234',     school: schoolCode },
    { role: 'Teacher',           email: 'teacher2@ficschool.edu',   password: 'Teacher@1234',     school: schoolCode },
    { role: 'Student',           email: 'student@ficschool.edu',    password: 'Student@1234',     school: schoolCode },
    { role: 'Parent',            email: 'parent@ficschool.edu',     password: 'Parent@1234',      school: schoolCode },
    { role: 'Driver',            email: 'driver@ficschool.edu',     password: 'Driver@1234',      school: schoolCode },
    { role: 'Transport Manager', email: 'transport@ficschool.edu',  password: 'Transport@1234',   school: schoolCode },
    { role: 'Librarian',         email: 'librarian@ficschool.edu',  password: 'Librarian@1234',   school: schoolCode },
    { role: 'Lab In-Charge',     email: 'labtech@ficschool.edu',    password: 'LabTech@1234',     school: schoolCode },
    { role: 'Sports Coach',      email: 'sports@ficschool.edu',     password: 'Sports@1234',      school: schoolCode },
    { role: 'Finance Admin',     email: 'finance@ficschool.edu',    password: 'Finance@1234',     school: schoolCode },
    { role: 'HR Admin',          email: 'hr@ficschool.edu',          password: 'Hr@1234',          school: schoolCode },
    { role: 'Hostel Warden',     email: 'warden@ficschool.edu',     password: 'Warden@1234',      school: schoolCode },
    { role: 'Office Admin',      email: 'office@ficschool.edu',     password: 'Office@1234',      school: schoolCode },
    { role: 'Admission Staff',   email: 'admission@ficschool.edu',  password: 'Admission@1234',   school: schoolCode },
  ];

  res.json({ success: true, data: demoAccounts });
});

export default router;
