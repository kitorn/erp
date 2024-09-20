import { NextFunction, Request, Response } from 'express';
import { CustomError } from '@/utils/customError';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new CustomError(404, 'Not found');
  next(err);
};
