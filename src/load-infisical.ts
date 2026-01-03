import dotenv from 'dotenv';
import { InfisicalOptions } from './infisical.types';
import { fetchInfisicalSecrets } from './infisical.http';
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

  // 1️⃣ Load dotenv FIRST
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
    projectId: options.projectId ?? process.env.INFISICAL_PROJECT_ID,
    environment:
      options.environment ?? process.env.INFISICAL_ENVIRONMENT,
  };

  const providedCount = Object.values(resolved).filter(Boolean).length;

  debugLog(
    debug,
    `Infisical config resolved: ${
      providedCount === 0
        ? 'none'
        : providedCount === 4
        ? 'complete'
        : 'partial'
    }`,
  );

  // 3️⃣ No config → silently skip
  if (providedCount === 0) {
    debugLog(debug, 'No Infisical configuration provided. Skipping.');
    return;
  }

  // 4️⃣ Partial config → warn & skip
  if (providedCount !== 4) {
    console.warn(
      `${LOG_PREFIX} Partial Infisical configuration detected. Secrets will not be loaded.`,
    );
    return;
  }

  try {
    debugLog(debug, 'Fetching Infisical secrets');

    const secrets = await fetchInfisicalSecrets({
      baseUrl: resolved.baseUrl!,
      token: resolved.token!.trim(),
      projectId: resolved.projectId!,
      environment: resolved.environment!,
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
