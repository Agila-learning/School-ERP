import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../../../config/env';

export const generateToken = (id: string, tenantId: string) => {
  return jwt.sign({ id, tenantId }, env.jwtSecret as jwt.Secret, {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = (id: string, tenantId: string) => {
  return jwt.sign({ id, tenantId }, env.jwtRefreshSecret as jwt.Secret, {
    expiresIn: env.jwtRefreshExpiresIn as SignOptions['expiresIn'],
  });
};
