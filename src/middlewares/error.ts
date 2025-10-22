import type { Request, Response, NextFunction } from 'express';

export default function errorMiddleware(err: any, req: Request, res: Response, _next: NextFunction) {
  (req as any).log?.error({ err }, 'Unhandled error');
  const status = err?.status ?? 500;
  res.status(status).json({ error: err?.message ?? 'Internal error' });
};