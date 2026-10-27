import { Response } from 'express';

interface ApiResponseParams<T> {
  res: Response;
  status?: number;
  message?: string;
  data?: T;
  meta?: any;
}

export const sendResponse = <T>({
  res,
  status = 200,
  message = 'Success',
  data = null as any,
  meta = null,
}: ApiResponseParams<T>) => {
  res.status(status).json({
    success: status >= 200 && status < 300,
    message,
    data,
    meta,
  });
};
