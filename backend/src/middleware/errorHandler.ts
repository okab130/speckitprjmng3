import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      status: err.statusCode,
    });
    return;
  }

  // Handle specific error types
  if (err.message.includes('Optimistic lock conflict')) {
    res.status(409).json({
      error: 'This record was modified by another user. Please refresh and try again.',
      status: 409,
    });
    return;
  }

  if (err.message.includes('not found')) {
    res.status(404).json({
      error: err.message,
      status: 404,
    });
    return;
  }

  // Database errors
  if ('code' in err) {
    const dbError = err as any;
    if (dbError.code === '23505') {
      res.status(409).json({
        error: 'A record with this unique value already exists',
        status: 409,
      });
      return;
    }
    if (dbError.code === '23503') {
      res.status(400).json({
        error: 'Referenced record does not exist',
        status: 400,
      });
      return;
    }
    if (dbError.code === '23514') {
      res.status(400).json({
        error: 'Invalid value for field: ' + dbError.constraint,
        status: 400,
      });
      return;
    }
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    status: 500,
  });
};
