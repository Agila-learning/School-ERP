import express from 'express';
import { registerSchool, verifySchool } from '../controllers/onboarding.controller';
import rateLimit from 'express-rate-limit';

const onboardingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration requests per windowMs
  message: 'Too many registration requests from this IP, please try again after an hour',
});

const router = express.Router();

router.post('/register-school', onboardingLimiter, registerSchool);
router.post('/verify-school', verifySchool);

export default router;
