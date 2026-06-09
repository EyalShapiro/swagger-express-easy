import { Request, Response, NextFunction } from 'express';
import { SECRET_TOKEN } from '../config';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  const token = authHeader?.replace('Bearer ', '');

  if (authHeader && token !== SECRET_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};
