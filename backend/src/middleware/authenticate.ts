import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔒 [AUTH] Request:', req.method, req.path);
    const authHeader = req.headers.authorization;
    console.log('🔒 [AUTH] Auth header:', authHeader ? authHeader.substring(0, 20) + '...' : 'NONE');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [AUTH] No token provided');
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔒 [AUTH] Token extracted:', token.substring(0, 20) + '...');

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.log('❌ [AUTH] JWT_SECRET not configured');
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    req.user = { userId: decoded.id, email: decoded.email };
    console.log('✅ [AUTH] Token valid for user:', decoded.email);

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.log('❌ [AUTH] Token expired');
      res.status(401).json({ error: 'Token expired' });
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.log('❌ [AUTH] Invalid token:', error.message);
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    console.log('❌ [AUTH] Authentication error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};
