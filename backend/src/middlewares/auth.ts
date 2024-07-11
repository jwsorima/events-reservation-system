import { Request, Response, NextFunction } from 'express';

export function checkAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
      return res.status(401).send({ authentication: false, message: 'Authentication required' });
  }
  next();
}