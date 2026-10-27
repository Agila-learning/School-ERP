import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../modules/auth/models/Role.model';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/school_erp';

const updatedPermissions = {
  SCHOOL_ADMIN: [
    'students.view', 'students.manage', 'students.medical.view', 'students.medical.manage', 'students.transfer',
    'hr.employee.view', 'hr.employee.create', 'hr.employee.edit', 'hr.employee.delete', 'hr.employee.manage',
    'hr.department.manage', 'hr.designation.manage',
    'parents.view', 'parents.create', 'parents.update', 'parents.delete',
    'academic.view', 'academic.manage',
    'academic.class.view', 'academic.class.manage',
    'academic.section.view', 'academic.section.manage',
    'academic.subject.view', 'academic.subject.manage',
    'academic.teacher.view', 'academic.teacher.manage',
    'attendance.view', 'attendance.manage',
    'examination.view', 'examination.manage',
    'exam.marks.enter', 'exam.marks.verify', 'exam.marks.moderate',
    'exam.result.calculate', 'exam.result.approve', 'exam.result.publish',
    'exam.report.generate', 'exam.report.view', 'exam.ranking.view',
    'exam.analytics.view', 'exam.paper.create', 'exam.paper.approve',
    'exam.settings.manage', 'exam.calendar.view', 'exam.logistics.manage',
    'finance.view', 'finance.manage',
    'library.view', 'library.manage',
    'transport.view', 'transport.manage',
    'hostel.view', 'hostel.manage',
    'hr.view', 'hr.manage',
    'timetable.view', 'timetable.create', 'timetable.update', 'timetable.delete', 'timetable.publish', 'timetable.generate', 'timetable.manage', 'timetable.substitution.create', 'timetable.substitution.approve', 'timetable.substitution.view', 'timetable.teacher.view', 'timetable.room.view',
    'admission.view', 'admission.manage',
    'leave.view', 'leave.approve',
    'roles.manage', 'settings.manage',
    'reports.view', 'audit.view',
    'health.view', 'health.manage',
    'security.view', 'security.manage',
    'communication.view', 'communication.manage',
    'users.view', 'users.create', 'users.update',
    'tenant.view', 'tenant.manage',
    'system.audit',
    'promotion.view', 'promotion.config', 'promotion.evaluate',
    'promotion.approve', 'promotion.rollover', 'promotion.allocate',
  ],
  ADMIN: [
    'students.view', 'students.manage',
    'academic.view', 'academic.manage',
    'attendance.view', 'attendance.manage',
    'examination.view', 'examination.manage',
    'timetable.view', 'timetable.create', 'timetable.update', 'timetable.delete', 'timetable.publish', 'timetable.generate', 'timetable.manage', 'timetable.substitution.create', 'timetable.substitution.approve', 'timetable.substitution.view', 'timetable.teacher.view', 'timetable.room.view',
    'leave.view', 'leave.approve',
    'reports.view', 'audit.view',
    'hr.view', 'hr.manage',
    'communication.view', 'communication.manage',
    'tenant.view', 'tenant.manage',
  ],
  PRINCIPAL: [
    'students.view', 'hr.employee.view', 'parents.view',
    'academic.view', 'academic.class.view', 'academic.section.view', 'academic.subject.view', 'academic.teacher.view',
    'attendance.view',
    'examination.view',
    'finance.view',
    'leave.view', 'leave.approve',
    'reports.view',
    'timetable.view', 'timetable.create', 'timetable.update', 'timetable.delete', 'timetable.publish', 'timetable.generate', 'timetable.manage', 'timetable.substitution.create', 'timetable.substitution.approve', 'timetable.substitution.view', 'timetable.teacher.view', 'timetable.room.view',
    'communication.view', 'communication.manage',
    'hr.view',
  ],
  CLASS_COORDINATOR: [
    'students.view.assigned', 'students.view.class',
    'attendance.mark', 'attendance.view.assigned', 'attendance.view.class',
    'timetable.view', 'timetable.create', 'timetable.update', 'timetable.delete', 'timetable.manage', 'timetable.publish', 'timetable.substitution.create', 'timetable.teacher.view', 'timetable.room.view',
    'communication.view', 'communication.create'
  ],
  ACADEMIC_COORDINATOR: [
    'students.view', 'students.manage',
    'academic.view', 'academic.manage',
    'academic.class.view', 'academic.class.manage',
    'academic.section.view', 'academic.section.manage',
    'academic.subject.view', 'academic.subject.manage',
    'academic.teacher.view', 'academic.teacher.manage',
    'attendance.view', 'attendance.manage',
    'examination.view', 'examination.manage',
    'timetable.view', 'timetable.create', 'timetable.update', 'timetable.delete', 'timetable.publish', 'timetable.generate', 'timetable.manage', 'timetable.substitution.create', 'timetable.substitution.approve', 'timetable.substitution.view', 'timetable.teacher.view', 'timetable.room.view',
    'communication.view', 'communication.manage', 'leave.view'
  ],
  OFFICE_ADMIN: [
    'students.view', 'students.create', 'students.manage', 'students.documents.manage',
    'admission.view', 'admission.manage',
    'finance.view', 'finance.manage',
    'communication.view', 'communication.manage', 'hr.view',
    'attendance.view', 'leave.view', 'timetable.view',
    'document.view', 'document.upload', 'document.approve'
  ],
  OFFICE_STAFF: [
    'students.view', 'students.create', 'students.manage', 'students.documents.manage',
    'admission.view', 'admission.manage',
    'finance.view', 'finance.manage',
    'communication.view', 'hr.view',
    'attendance.view', 'leave.view', 'timetable.view',
    'document.view', 'document.upload'
  ]
};

async function sync() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  for (const [code, perms] of Object.entries(updatedPermissions)) {
    console.log(`Updating role: ${code} with ${perms.length} permissions...`);
    const result = await Role.updateMany(
      { name: { $regex: new RegExp(`^${code.replace('_', ' ')}$`, 'i') } },
      { $set: { permissions: perms, code: code } }
    );
    // Also try exact match for code if it was saved with code
    const result2 = await Role.updateMany(
      { code: code },
      { $set: { permissions: perms } }
    );
    console.log(`Updated ${result.modifiedCount + result2.modifiedCount} roles for ${code}.`);
  }

  console.log('Done.');
  process.exit(0);
}

sync().catch(err => {
  console.error(err);
  process.exit(1);
});
