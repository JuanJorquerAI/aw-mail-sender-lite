export interface EmailPayload {
  to: string | string[];
  from: string;
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
}

export interface IEmailProvider {
  send(payload: EmailPayload): Promise<void>;
}