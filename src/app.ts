import path from 'node:path';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import router from './routes/index.js';

import env from './config/env.js';
import errorMiddleware from './middlewares/error.js';

const app = express();
const ROOT = process.cwd(); // raíz del proyecto (donde están /views y /public)

// Si corres detrás de proxy (NGINX/Render/Heroku), habilita trust proxy para rate-limit/IP reales
app.set('trust proxy', 1);

// logging estructurado
app.use(pinoHttp());

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

// Vistas (EJS) y estáticos desde la raíz del proyecto
app.set('views', path.join(ROOT, 'views'));
app.set('view engine', 'ejs');
app.use('/static', express.static(path.join(ROOT, 'public'), { maxAge: '1d', etag: true }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(ROOT, 'public', 'index.html'));
});

// Rutas
app.get('/health', (_req, res) => {
  res.json({ ok: true, env: env.NODE_ENV, time: new Date().toISOString() });
});

app.use('/', router);

// Manejador centralizado de errores
app.use(errorMiddleware);

export default app;