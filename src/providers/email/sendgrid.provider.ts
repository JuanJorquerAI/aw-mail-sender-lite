import sgMail, { MailDataRequired } from '@sendgrid/mail';
import type { EmailPayload, IEmailProvider } from './IEmailProvider.js';
import env from '../../config/env.js';

if (env.SENDGRID_API_KEY) sgMail.setApiKey(env.SENDGRID_API_KEY);

// Fallback simple de HTML a texto plano (puedes reemplazar por html-to-text si quieres)
function htmlToText(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default class SendgridProvider implements IEmailProvider {
  async send(p: EmailPayload): Promise<void> {
    const msg: MailDataRequired = {
      to: p.to as any, // SendGrid acepta string | string[]
      from: p.from,
      subject: p.subject,
      html: p.html,
      text: p.text ?? htmlToText(p.html),
      headers: p.headers,
    };

    await sgMail.send(msg);
  }
}