import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';

import env from './config/env.js';

const app = express();

// Si corres detrás de proxy (NGINX/Render/Heroku), habilita trust proxy para rate-limit/IP reales
app.set('trust proxy', 1);

// logging estructurado
app.use(pinoHttp);

// security headers
app.use(helmet());

app.use(cors({
    origin: env.CORS_ORIGIN.split(',').map((s: string) => s.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Manejador centralizado de errores
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  (req as any).log?.error({ err }, 'Unhandled error');
  const status = err?.status ?? 500;
  res.status(status).json({ error: err?.message ?? 'Internal error' });
});

export default app;