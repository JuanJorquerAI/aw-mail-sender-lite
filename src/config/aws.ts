import { SESClient, SESClientConfig } from "@aws-sdk/client-ses";
import env from './env.js';

export const awsRegion = env.AWS_REGION ?? 'us-east-1';

export function createSesClient(overrides: Partial<SESClientConfig> = {}) {
  return new SESClient({
    region: awsRegion,
    ...overrides,
  });
}