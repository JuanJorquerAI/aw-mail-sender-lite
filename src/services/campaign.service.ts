import { listUnsubHeaders } from '../utils/emailHeaders';
import { injectOpenPixel, rewriteLinksForClicks } from '../utils/html';
import env from '../config/env';
import { IEmailProvider } from '../providers/email/IEmailProvider';

export async function sendToSubscriber(args: {
  provider: IEmailProvider;
  to: string;
  from: string;
  subject: string;
  html: string;
  campaignId: string;
  subscriberId: string;
}) {
  const pixel = `${env.BASE_URL}/t/o/${args.campaignId}/${args.subscriberId}.gif`;
  const unsub = `${env.BASE_URL}/unsubscribe/${args.subscriberId}?email=${encodeURIComponent(args.to)}`;

  let html = injectOpenPixel(args.html, pixel);
  html = rewriteLinksForClicks(html, (href) =>
    `${env.BASE_URL}/t/c/${args.campaignId}/${args.subscriberId}?u=${encodeURIComponent(href)}`
  );

  const headers = listUnsubHeaders(unsub, 'unsubscribe@tu-dominio.com');

  await args.provider.send({
    to: args.to, from: args.from, subject: args.subject, html, headers
  });
}
