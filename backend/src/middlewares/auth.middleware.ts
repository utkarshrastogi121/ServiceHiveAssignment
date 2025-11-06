import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';

declare global {
  namespace Express {
    interface Request { user?: any }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'];
  if (!auth) return next(createError(401, 'Authorization header missing'));
  const [bearer, token] = (auth || '').split(' ');
  if (bearer !== 'Bearer' || !token) return next(createError(401, 'Invalid authorization header'));

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (err) {
    next(createError(401, 'Invalid or expired token'));
  }
}
