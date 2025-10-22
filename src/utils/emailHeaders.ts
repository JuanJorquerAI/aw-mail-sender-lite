// utils/emailHeaders.ts
export type ListUnsubHeaders = {
  'List-Unsubscribe': string;
  'List-Unsubscribe-Post': string; // típicamente 'List-Unsubscribe=One-Click'
};

export function listUnsubHeaders(unsubHttpUrl: string, unsubMailto?: string): ListUnsubHeaders {
  const parts: string[] = [];
  if (unsubMailto) parts.push(`<mailto:${unsubMailto}>`);
  parts.push(`<${unsubHttpUrl}>`);
  return {
    'List-Unsubscribe': parts.join(', '),
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}
