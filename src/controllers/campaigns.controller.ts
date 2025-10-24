import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
// import SesProvider from '../providers/email/ses.provider.js';
import SendgridProvider from '../providers/email/sendgrid.provider.js';
import { sendToSubscriber } from '../services/campaign.service.js';

export async function sendTest(req: Request, res: Response, next: NextFunction) {
  try {
    const Schema = z.object({
      from: z.email(),
      to: z.email(),
      subject: z.string().min(1),
      html: z.string().min(1),
      text: z.string().optional(),
      provider: z.enum(['ses', 'sendgrid']).default('ses').optional(),
    });
    const d = Schema.parse(req.body);

    const provider = d.provider === 'sendgrid' ? new SendgridProvider() : new SendgridProvider();

    await sendToSubscriber({
      provider,
      to: d.to,
      from: d.from,
      subject: d.subject,
      html: d.html,
      text: d.text,
      campaignId: `test_${Date.now()}`,
      subscriberId: 'test',
    });

    res.json({ ok: true });
  } catch (e) { next(e); }
}

// export async function sendCampaign(req: Request, res: Response, next: NextFunction) {
//   try {
//     const { subject, html, listId, provider = 'ses' } = req.body;
//     // aquí: buscar suscriptores activos por listId (servicio)
//     // for demo:
//     const subscribers = []; // <- reemplazar por fetch real

//     const p = provider === 'sendgrid' ? new SendgridProvider() : new SesProvider();
//     for (const s of subscribers) {
//       await sendToSubscriber({
//         provider: p,
//         to: s.email,
//         from: req.body.from,
//         subject,
//         html,
//         campaignId: 'CAMPAIGN_ID',
//         subscriberId: String(s._id),
//       });
//     }
//     res.json({ ok: true, count: subscribers.length });
//   } catch (e) { next(e); }
// }
