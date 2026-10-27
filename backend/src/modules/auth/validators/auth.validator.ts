import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const passwordMessage = 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'), // Keep login simple just checking for presence to avoid leaking complexity requirements, but during registration enforce it.
  }),
});

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().regex(passwordRegex, passwordMessage),
    role: z.enum([
      'Super Admin', 'School Owner', 'Principal', 'Vice Principal',
      'Admin', 'HR', 'Accountant', 'Teacher', 'Class Teacher',
      'Librarian', 'Hostel Warden', 'Transport Manager',
      'Receptionist', 'Parent', 'Student'
    ]).optional(),
  }),
});
