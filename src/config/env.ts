// config/env.js
import 'dotenv-safe/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  MONGO_URI: z.string().min(1),

  SEND_FROM: z.string().email().optional(),
  BASE_URL: z.string().url().default('http://localhost:3000'),

  AWS_REGION: z.string().optional(),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  SENDGRID_API_KEY: z.string().optional(),
});

const env = EnvSchema.parse(process.env);
export default env;