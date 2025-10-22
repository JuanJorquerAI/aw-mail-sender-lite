import { Router } from 'express';
import campaigns from './campaigns.routes';
// importa el resto: lists, subscribers, settings, tracking, webhooks

const router = Router();
router.use('/api', campaigns);
export default router;
