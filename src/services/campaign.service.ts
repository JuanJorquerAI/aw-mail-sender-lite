import { listUnsubHeaders } from '../utils/emailHeaders';
import { injectOpenPixel, rewriteLinksForClicks } from '../utils/html';
import env from '../config/env';
import type { IEmailProvider } from '../providers/email/IEmailProvider.js';

export async function sendToSubscriber(args: {
  provider: IEmailProvider;
  to: string | string[];
  from: string;
  subject: string;
  html: string;
  text?: string;
  campaignId: string;
  subscriberId: string;
}) {
  const toOne = Array.isArray(args.to) ? args.to[0] : args.to;
  const pixel = `${env.BASE_URL}/t/o/${args.campaignId}/${args.subscriberId}.gif`;
  const unsub = `${env.BASE_URL}/unsubscribe/${args.subscriberId}?email=${encodeURIComponent(toOne)}`;

  let html = injectOpenPixel(args.html, pixel);
  html = rewriteLinksForClicks(html, (href) =>
    `${env.BASE_URL}/t/c/${args.campaignId}/${args.subscriberId}?u=${encodeURIComponent(href)}`
  );

  const headers = listUnsubHeaders(unsub, 'unsubscribe@tu-dominio.com');

  await args.provider.send({
    to: args.to,
    from: args.from,
    subject: args.subject,
    html,
    text: args.text,
    headers,
  });
}
