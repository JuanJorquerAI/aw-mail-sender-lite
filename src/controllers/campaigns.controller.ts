import { Request, Response, NextFunction } from 'express';
import SesProvider from '../providers/email/ses.provider';
import SendgridProvider from '../providers/email/sendgrid.provider';
import { sendToSubscriber } from '../services/campaign.service';

export async function sendCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const { subject, html, listId, provider = 'ses' } = req.body;
    // aquí: buscar suscriptores activos por listId (servicio)
    // for demo:
    const subscribers = []; // <- reemplazar por fetch real

    const p = provider === 'sendgrid' ? new SendgridProvider() : new SesProvider();
    for (const s of subscribers) {
      await sendToSubscriber({
        provider: p,
        to: s.email,
        from: req.body.from,
        subject,
        html,
        campaignId: 'CAMPAIGN_ID',
        subscriberId: String(s._id),
      });
    }
    res.json({ ok: true, count: subscribers.length });
  } catch (e) { next(e); }
}
