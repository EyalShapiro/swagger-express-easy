import { Request, Response, NextFunction } from 'express';

export function addTimeStamp(req: Request, res: Response, next: NextFunction) {
  res.locals.timeStamp = new Date().toUTCString();
  next();
}
