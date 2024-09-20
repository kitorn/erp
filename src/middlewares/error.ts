import { NextFunction, Request, Response } from 'express';
import { CustomError } from '@/utils/customError';
import { ValidationError } from 'class-validator';

const validationErrorsToString = (errors: ValidationError[]): string => {
  return errors
    .map((error) => {
      if (error.constraints) {
        return Object.values(error.constraints).join(', ');
      }
      return '';
    })
    .filter((message) => message !== '')
    .join('; ');
};

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  // without node.js, the application crashes, so I disabled the linter on this line
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  if (Array.isArray(err) && err.every((e) => e instanceof ValidationError)) {
    const errorMessage = validationErrorsToString(err);
    res.status(400).json({ message: errorMessage });
  }
  const { statusCode = 500, message: errorMessage } = err;
  let status = statusCode || 500;
  let message = errorMessage;
  if (err.name === 'CastError') {
    status = 400;
    message = 'Некорректная длина id';
  } else if (err.name === 'ValidationError') {
    status = 400;
  }
  return res
    .status(status)
    .send({ message: status !== 500 ? message : 'An error has occurred' });
};
