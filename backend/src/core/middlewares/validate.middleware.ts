import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/AppError';

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      console.error('Validation error:', error);
      const messages = error.errors ? error.errors.map((e: any) => e.message).join(', ') : error.message || 'Validation failed';
      next(new ValidationError(messages));
    }
  };
};
