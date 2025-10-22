import env from '../config/env';
import { SESProvider } from '../providers/email/ses.provider';
import { SendGridProvider } from '../providers/email/sendgrid.provider';
import { IEmailProvider, EmailPayload } from '../providers/email/IEmailProvider';

export type ProviderId = 'aws-ses' | 'sendgrid';

function getProvider(id: ProviderId): IEmailProvider {
  if (id === 'sendgrid') return new SendGridProvider();
  return new SESProvider();
}

export function getProviders() {
  return [
    { id: 'aws-ses', name: 'Amazon SES', available: Boolean(env.AWS_REGION) },
    { id: 'sendgrid', name: 'Sendgrid', available: Boolean(env.SENDGRID_API_KEY) },
  ];
}

export async function sendEmail(payload: Omit<EmailPayload, 'from'> & { from?: string; provider?: ProviderId }) {
  const provider = getProvider(payload.provider ?? 'aws-ses');
  const from = payload.from ?? (env.SEND_FROM ?? 'no-reply@example.com');
  return provider.send({ ...payload, from });
}

export async function sendTestEmail(payload: Omit<EmailPayload, 'from'> & { from?: string; provider?: ProviderId }) {
  const subject = `[PRUEBA] ${payload.subject}`;
  const note = `
    <div style="margin-top:20px;padding:10px;background:#f8f9fa;border-left:4px solid #0d6efd">
      <p><strong>Nota:</strong> Este es un correo de pryeba enviado desde la aplicación.</p>
    </div>`;
  const html = (payload.html ?? payload.text ?? '') + note;
  return sendEmail({ ...payload, subject, html });
}