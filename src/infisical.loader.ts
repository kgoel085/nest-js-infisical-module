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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    debugLog(options.debug, 'Fetching secrets from Infisical');
    debugLog(
      options.debug,
      `baseUrl=${options.baseUrl}, projectId=${options.projectId}, environment=${options.environment}`,
    );

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
      throw new Error(
        `Infisical API error ${response.status}: ${text}`,
      );
    }

    const body = await response.json();
    const secrets: Record<string, string> = body?.secrets ?? {};

    debugLog(
      options.debug,
      `Fetched ${Object.keys(secrets).length} secrets from Infisical`,
    );

    debugLog(
      options.debug,
      `Secret keys fetched: ${Object.keys(secrets).join(', ')}`,
    );

    for (const [key, value] of Object.entries(secrets)) {
      const exists = process.env[key] !== undefined;

      if (options.override || !exists) {
        debugLog(
          options.debug,
          exists
            ? `Overwriting env var: ${key}`
            : `Setting env var: ${key}`,
        );
        process.env[key] = value;
      } else {
        debugLog(options.debug, `Skipping existing env var: ${key}`);
      }
    }
  } catch (err: any) {
    console.error('Error while loading Infisical secrets', err);
    if (err.name === 'AbortError') {
      console.error(
        `${LOG_PREFIX} Infisical request timed out after 5s`,
      );
    } else {
      console.error(
        `${LOG_PREFIX} Error loading secrets from Infisical`,
        err,
      );
    }

    if (options.failFast) {
      throw err;
    }
  } finally {
    clearTimeout(timeout);
  }
}
