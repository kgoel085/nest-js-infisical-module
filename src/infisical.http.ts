import { debugLog } from './infisical.logger';
import { InfisicalSecretItem } from './infisical.types';

export async function fetchInfisicalSecrets(options: {
  baseUrl: string;
  token: string;
  projectId: string;
  environment: string;
  debug?: boolean;
}): Promise<Record<string, string>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    debugLog(options.debug, 'Calling Infisical HTTP API');

    const url = new URL(`${options.baseUrl}/api/v3/secrets/raw`);
    url.searchParams.set('projectId', options.projectId);
    url.searchParams.set('environment', options.environment);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${options.token}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Infisical API ${response.status}: ${text}`);
    }

    const json = (await response.json()) as { secrets: InfisicalSecretItem[] };
    const secrets: Record<string, string> = {};
    json.secrets.map((item) => {
      secrets[item.secretKey] = item.secretValue;
      return item;
    })

    return secrets;
  } finally {
    clearTimeout(timeout);
  }
}
