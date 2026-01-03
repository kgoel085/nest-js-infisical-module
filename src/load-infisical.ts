import dotenv from 'dotenv';
import { InfisicalOptions } from './infisical.types';
import { fetchInfisicalSecrets } from './infisical.http';
import { fetchUniversalAuthToken } from './infisical.auth';
import { debugLog } from './infisical.logger';

const LOG_PREFIX = '[nestjs-infisical]';

export async function loadInfisical(
  options: InfisicalOptions = {},
): Promise<void> {
  const {
    dotenv: dotenvOptions,
    override = true,
    failFast = true,
    debug = false,
  } = options;

  // 1️⃣ dotenv first
  if (dotenvOptions !== false) {
    debugLog(debug, 'Loading dotenv configuration');
    dotenv.config(dotenvOptions);
  }

  // 2️⃣ Resolve config (options → env)
  const resolved = {
    baseUrl:
      options.baseUrl ??
      process.env.INFISICAL_BASE_URL ??
      'https://app.infisical.com',

    token: options.token ?? process.env.INFISICAL_TOKEN,

    clientId:
      options.clientId ?? process.env.INFISICAL_CLIENT_ID,
    clientSecret:
      options.clientSecret ??
      process.env.INFISICAL_CLIENT_SECRET,

    projectId:
      options.projectId ?? process.env.INFISICAL_PROJECT_ID,

    environment:
      options.environment ??
      process.env.INFISICAL_ENVIRONMENT,
  };

  const providedCount = Object.values(resolved).filter(Boolean).length;

  debugLog(
    debug,
    `Infisical config resolved: ${
      providedCount === 0
        ? 'none'
        : providedCount >= 4
        ? 'complete'
        : 'partial'
    }`,
  );

  if (providedCount === 0) {
    debugLog(debug, 'No Infisical configuration provided. Skipping.');
    return;
  }

  if (!resolved.projectId || !resolved.environment) {
    console.warn(
      `${LOG_PREFIX} Missing projectId or environment. Secrets will not be loaded.`,
    );
    return;
  }

  try {
    // 3️⃣ Resolve authentication
    let accessToken: string | undefined;

    if (resolved.token) {
      debugLog(debug, 'Using Infisical service token');
      accessToken = resolved.token.trim();
    } else if (resolved.clientId && resolved.clientSecret) {
      debugLog(debug, 'Using Infisical Universal Authentication');

      accessToken = await fetchUniversalAuthToken({
        baseUrl: resolved.baseUrl,
        clientId: resolved.clientId,
        clientSecret: resolved.clientSecret,
      });
    } else {
      console.warn(
        `${LOG_PREFIX} No valid Infisical authentication provided. Skipping.`,
      );
      return;
    }

    // 4️⃣ Fetch secrets
    const secrets = await fetchInfisicalSecrets({
      baseUrl: resolved.baseUrl,
      accessToken,
      projectId: resolved.projectId,
      environment: resolved.environment,
      debug,
    });

    for (const [key, value] of Object.entries(secrets)) {
      if (override || process.env[key] === undefined) {
        process.env[key] = value;
      }
    }

    debugLog(
      debug,
      `Loaded ${Object.keys(secrets).length} secrets from Infisical`,
    );
  } catch (err) {
    if (failFast) {
      throw err;
    }

    console.warn(
      `${LOG_PREFIX} Failed to load Infisical secrets. Continuing without them.`,
    );
  }
}
