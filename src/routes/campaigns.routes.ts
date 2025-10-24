import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middlewares/validate.js';
import * as ctrl from '../controllers/campaigns.controller.js';

const router = Router();
const Email = z.email({ message: 'Correo inválido' }).transform((s) => s.trim().toLowerCase());

const TestSchema = z.object({
  from: Email,
  to: Email,
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  provider: z.enum(['ses', 'sendgrid']).optional(),
});

const SendSchema = z.object({
  from: Email,
  subject: z.string().min(1, 'Asunto requerido').trim(),
  html: z.string().min(1, 'HTML requerido'),
  listId: z.string().min(1, 'listId requerido'),
  provider: z.enum(['ses', 'sendgrid']).optional().default('ses'),
});

router.post('/send-test', validateBody(TestSchema), ctrl.sendTest);

// router.post('/send-campaign', validateBody(SendSchema), ctrl.sendCampaign);
export default router;
