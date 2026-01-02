import axios from 'axios';

const LOG_PREFIX = '[nestjs-infisical]';

function debugLog(enabled: boolean | undefined, message: string) {
  if (enabled) {
    console.log(`${LOG_PREFIX} ${message}`);
  }
}

export async function loadInfisicalSecrets(options: {
  baseUrl: string;
  token: string;
  projectId: string;
  environment: string;
  override: boolean;
  failFast: boolean;
  debug?: boolean;
}): Promise<void> {
  try {
    debugLog(options.debug, `Fetching secrets from Infisical`);
    debugLog(options.debug, `baseUrl=${options.baseUrl}, projectId=${options.projectId}, environment=${options.environment}`);


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
    debugLog(
      options.debug,
      `Fetched ${Object.keys(secrets).length} secrets from Infisical`,
    );
    debugLog(
      options.debug,
      `Secret keys fetched: ${Object.keys(secrets).join(', ')}`,
    );


    for (const [key] of Object.entries(secrets)) {
      const exists = process.env[key] !== undefined;

      if (options.override || !exists) {
        debugLog(
          options.debug,
          exists
            ? `Overwriting env var: ${key}`
            : `Setting env var: ${key}`,
        );
        process.env[key] = secrets[key];
      } else {
        debugLog(options.debug, `Skipping existing env var: ${key}`);
      }
    }

  } catch (err) {
    debugLog(options.debug, `Error loading secrets from Infisical: ${err}`);
    if (options.failFast) {
      throw err;
    }
    console.warn(`${LOG_PREFIX} Failed to load secrets from Infisical. Continuing without secrets.`);
  }
}
