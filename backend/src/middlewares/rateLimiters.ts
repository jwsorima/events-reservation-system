import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export const rateLimitUsers = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 200,
  message: 'Too many requests from this IP or user, please try again after 10 minutes', 
  standardHeaders: true,
  legacyHeaders: false,
})

export const rateLimitAdmin = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 2000,
  message: 'Too many requests from this IP or user, please try again after 5 minutes', 
  standardHeaders: true,
  legacyHeaders: false,
})

export const conditionalRateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    rateLimitAdmin(req, res, next);
  } else {
    rateLimitUsers(req, res, next);
  }
}