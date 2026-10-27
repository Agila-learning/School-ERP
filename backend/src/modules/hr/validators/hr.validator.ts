import { z } from 'zod';

export const onboardEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.string().datetime(),
    gender: z.enum(['Male', 'Female', 'Other']),
    nationality: z.string().min(2),
    mobile: z.string().min(10),
    email: z.string().email(),
    address: z.object({
      current: z.string().min(5),
    }),
    emergencyContact: z.object({
      name: z.string().min(1),
      relationship: z.string().min(1),
      phone: z.string().min(10),
    }),
    departmentId: z.string().min(24),
    designationId: z.string().min(24),
    employmentType: z.enum(['Permanent', 'Probation', 'Contract', 'Temporary', 'Part-time', 'Consultant', 'Intern', 'Volunteer', 'Outsourced']),
    joiningDate: z.string().datetime(),
    branchId: z.string().min(24).or(z.literal('')).optional(),
    createUserAccount: z.boolean().default(false),
    isTeacher: z.boolean().default(false),
  }),
});

export const updateBankProfileSchema = z.object({
  body: z.object({
    bankName: z.string().min(1),
    accountHolderName: z.string().min(1),
    accountNumber: z.string().min(5),
    ifscCode: z.string().optional(),
  }),
});
