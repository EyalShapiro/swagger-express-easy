import type { NextFunction, Request, Response } from 'express';

export const requestTimeLogger = () => (req: Request, res: Response, next: NextFunction) => {
  const start: number = new Date().getTime();
  const log = (event: 'finish' | 'close') => {
    const durationMs = Date.now() - start;

    console.info(
      `[${event}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs.toFixed(2)}ms`,
    );
  };
  let finished = false;

  res.on('finish', () => {
    finished = true;
    log('finish');
  });

  res.on('close', () => {
    if (!finished) {
      log('close');
    }
  });
  next();
};
