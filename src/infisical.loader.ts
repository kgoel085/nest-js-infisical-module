import axios from 'axios';

const LOG_PREFIX = '[nestjs-infisical]';

export async function loadInfisicalSecrets(options: {
  baseUrl: string;
  token: string;
  projectId: string;
  environment: string;
  override: boolean;
  failFast: boolean;
}): Promise<void> {
  try {
    const response = await axios.get(`${options.baseUrl}/api/v3/secrets/raw`, {
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
      params: {
        projectId: options.projectId,
        environment: options.environment,
      },
    });

    const secrets: Record<string, string> = response.data?.secrets ?? {};

    for (const [key, value] of Object.entries(secrets)) {
      if (options.override || process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (err) {
    if (options.failFast) {
      throw err;
    }
    console.warn(`${LOG_PREFIX} Failed to load secrets from Infisical. Continuing without secrets.`);
  }
}
