import { z } from 'zod';

export const createEnquirySchema = z.object({
  body: z.object({
    studentFirstName: z.string().min(1),
    studentLastName: z.string().min(1),
    parentName: z.string().min(1),
    mobile: z.string().min(10),
    email: z.string().email().optional(),
    classId: z.string().min(24),
    academicYearId: z.string().min(24),
    branchId: z.string().min(24),
    source: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const createApplicationSchema = z.object({
  body: z.object({
    branchId: z.string().min(24).or(z.literal('')).optional(),
    academicYearId: z.string().min(24).or(z.literal('')).optional(),
    applyingClassId: z.string().min(24),
    
    studentDetails: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      dateOfBirth: z.string().datetime(),
      gender: z.enum(['Male', 'Female', 'Other']),
      nationality: z.string().min(2),
    }),

    parentDetails: z.object({
      fatherName: z.string().min(1),
      fatherMobile: z.string().min(10),
      motherName: z.string().min(1),
    }),

    address: z.object({
      current: z.string().min(5),
      permanent: z.string().optional(),
    }),
  }),
});

export const approveApplicationSchema = z.object({
  body: z.object({
    applicationId: z.string().min(24),
    assignedSectionId: z.string().min(24),
    generatePortalAccess: z.boolean().default(true),
  }),
});
