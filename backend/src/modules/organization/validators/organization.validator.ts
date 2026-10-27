import { z } from 'zod';

export const createSchoolSchema = z.object({
  body: z.object({
    legalName: z.string().min(2, 'Legal name is required'),
    displayName: z.string().min(2, 'Display name is required'),
    code: z.string().min(2, 'Code is required'),
    registrationNumber: z.string().optional(),
    affiliationNumber: z.string().optional(),
    schoolType: z.string().optional(),
    board: z.string().optional(),
    medium: z.string().optional(),
    establishmentDate: z.string().optional(),
    logo: z.string().optional(),
    favicon: z.string().optional(),
    website: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    alternatePhone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      area: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }).optional(),
    timezone: z.string().optional(),
    currency: z.string().optional(),
    dateFormat: z.string().optional(),
    status: z.enum(['ACTIVE', 'TRIAL', 'SUSPENDED', 'INACTIVE', 'ARCHIVED']).optional(),
  }),
});

export const createBranchSchema = z.object({
  body: z.object({
    schoolId: z.string().optional(),
    name: z.string().min(2, 'Name is required'),
    code: z.string().min(2, 'Code is required'),
    principalId: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    }).optional(),
    workingHours: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  }),
});

export const createCampusSchema = z.object({
  body: z.object({
    branchId: z.string().min(24, 'Invalid branch ID'),
    name: z.string().min(2, 'Name is required'),
    code: z.string().min(2, 'Code is required'),
    address: z.string().optional(),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().optional(),
    facilities: z.array(z.string()).optional(),
  }),
});

export const createBuildingSchema = z.object({
  body: z.object({
    campusId: z.string().min(24, 'Invalid campus ID'),
    name: z.string().min(2, 'Name is required'),
    code: z.string().min(2, 'Code is required'),
    floors: z.number().int().min(1).optional(),
  }),
});

export const createRoomSchema = z.object({
  body: z.object({
    buildingId: z.string().min(24, 'Invalid building ID'),
    name: z.string().min(2, 'Name is required'),
    code: z.string().min(2, 'Code is required'),
    type: z.string(), // Extracted to master data logic later, just string validation here
    capacity: z.number().int().min(1),
    floor: z.number().int().optional(),
  }),
});

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    code: z.string().min(2, 'Code is required'),
    description: z.string().optional(),
    headId: z.string().optional(),
  }),
});
