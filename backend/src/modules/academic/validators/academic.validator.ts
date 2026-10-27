import { z } from 'zod';

// Foundation
export const createAcademicYearSchema = z.object({
  body: z.object({
    branchId: z.string().optional(),
    name: z.string().min(4),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    status: z.enum(['upcoming', 'active', 'completed']).optional(),
  }),
});

export const createTermSchema = z.object({
  body: z.object({
    academicYearId: z.string().min(24),
    branchId: z.string().optional(),
    name: z.string().min(2),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }),
});

export const createClassSchema = z.object({
  body: z.object({
    branchId: z.string().min(24).optional(),
    name: z.string().min(1),
    code: z.string().min(1),
    level: z.number().int().min(0),
    description: z.string().optional(),
    displayOrder: z.number().int().optional(),
    capacity: z.number().int().min(1).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const createSectionSchema = z.object({
  body: z.object({
    branchId: z.string().min(24).optional(),
    campusId: z.string().optional(),
    academicYearId: z.string().min(24),
    classId: z.string().min(24),
    roomId: z.string().optional(),
    name: z.string().min(1),
    code: z.string().min(1),
    capacity: z.number().int().min(1).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    shortName: z.string().optional(),
    typeId: z.string().optional(),
    categoryId: z.string().optional(),
    description: z.string().optional(),
    creditHours: z.number().min(0).optional(),
    maximumMarks: z.number().min(0).optional(),
    passingMarks: z.number().min(0).optional(),
    theoryMarks: z.number().min(0).optional(),
    practicalMarks: z.number().min(0).optional(),
    internalMarks: z.number().min(0).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
});

// Curriculum & Syllabus
export const createCurriculumSchema = z.object({
  body: z.object({
    branchId: z.string().min(24),
    academicYearId: z.string().min(24),
    classId: z.string().min(24),
    subjectId: z.string().min(24),
    name: z.string().min(2),
    weeklyPeriods: z.number().int().min(0),
    maximumMarks: z.number().min(0),
    passingMarks: z.number().min(0),
    credits: z.number().min(0).optional(),
    learningObjectives: z.string().optional(),
  }),
});

// Teacher Assignments
export const createTeacherAssignmentSchema = z.object({
  body: z.object({
    academicYearId: z.string().min(24).optional(),
    teacherId: z.string().min(24),
    classId: z.string().min(24).optional(),
    sectionId: z.string().min(24),
    subjectId: z.string().min(24),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
});

// Student Enrollment
export const enrollStudentSchema = z.object({
  body: z.object({
    studentId: z.string().min(24),
    academicYearId: z.string().min(24),
    classId: z.string().min(24),
    sectionId: z.string().min(24),
    rollNumber: z.string().optional(),
    admissionNumber: z.string().min(1),
  }),
});

export const bulkPromoteSchema = z.object({
  body: z.object({
    studentIds: z.array(z.string()),
    currentAcademicYearId: z.string().min(24),
    newAcademicYearId: z.string().min(24),
    newClassId: z.string().min(24),
    newSectionId: z.string().min(24),
    remarks: z.string().optional(),
  }),
});
