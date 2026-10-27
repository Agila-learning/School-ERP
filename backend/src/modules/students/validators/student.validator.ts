import { z } from 'zod';

export const updateMedicalProfileSchema = z.object({
  body: z.object({
    allergies: z.array(z.string()).optional(),
    medicalConditions: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    emergencyInstructions: z.string().optional(),
    doctorName: z.string().optional(),
    doctorPhone: z.string().optional(),
    hospitalName: z.string().optional(),
    insuranceDetails: z.string().optional(),
  }),
});

export const updateStudentProfileSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    bloodGroup: z.string().optional(),
  }),
});
