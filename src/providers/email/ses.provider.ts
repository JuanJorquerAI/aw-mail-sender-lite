import nodemailer from 'nodemailer';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import type { EmailPayload, IEmailProvider } from './IEmailProvider.js';
import env from '../../config/env.js';

const ses = new SESClient({ region: env.AWS_REGION });

const transport = nodemailer.createTransport({
  SES: { ses, aws: { SendRawEmailCommand } },
} as any);

export default class SesProvider implements IEmailProvider {
  async send(p: EmailPayload): Promise<void> {
    await transport.sendMail({
      to: p.to,
      from: p.from,
      subject: p.subject,
      html: p.html,
      text: p.text,
      headers: p.headers,
    });
  }
}
