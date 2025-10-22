import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Body
export const validateBody = <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const r = schema.safeParse(req.body);
    if (!r.success) {
      return next(Object.assign(new Error('Bad Request'), {
        status: 400,
        details: r.error.issues,
      }));
    }
    req.body = r.data as z.infer<T>;
    return next();
  };

// Query
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const r = schema.safeParse(req.query);
    if (!r.success) {
      return next(Object.assign(new Error('Bad Request'), {
        status: 400,
        details: r.error.issues,
      }));
    }
    req.query = r.data as any;
    return next();
  };

// Params
export const validateParams = <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const r = schema.safeParse(req.params);
    if (!r.success) {
      return next(Object.assign(new Error('Bad Request'), {
        status: 400,
        details: r.error.issues,
      }));
    }
    req.params = r.data as any;
    return next();
  };
