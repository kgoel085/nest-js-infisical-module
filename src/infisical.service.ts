import { InfisicalModuleOptions } from './infisical.types';
import { loadInfisicalSecrets } from './infisical.loader';
import dotenv from 'dotenv';

const LOG_PREFIX = '[nestjs-infisical]';

function debugLog(enabled: boolean | undefined, message: string) {
  if (enabled) {
    console.log(`${LOG_PREFIX} ${message}`);
  }
}

export async function initializeInfisical(
  options: InfisicalModuleOptions,
): Promise<void> {
  const {
    dotenv: dotenvOptions,
    baseUrl,
    token,
    projectId,
    environment,
    override = true,
    failFast = true,
    debug = false
  } = options;

  if (dotenvOptions !== false) {
    debugLog(debug, 'Loading dotenv configuration');
    dotenv.config(dotenvOptions);
  } else {
    debugLog(debug, 'Dotenv disabled');
  }

  const provided = [baseUrl, token, projectId, environment].filter(Boolean).length;
  debugLog(
    debug,
    `Infisical config resolved: ${provided === 0 ? 'none' : provided === 4 ? 'complete' : 'partial'}`
  );

  if (provided === 0) {
    debugLog(debug, 'No Infisical configuration provided');
    return;
  }

  if (provided !== 4) {
    console.warn(
      `${LOG_PREFIX} Partial Infisical configuration detected. Secrets will not be loaded.`,
    );
    debugLog(debug, `baseUrl=${!!baseUrl}, token=${!!token}, projectId=${!!projectId}, environment=${!!environment}`);
    return;
  }

  debugLog(debug, 'Loading Infisical secrets');
  await loadInfisicalSecrets({
    baseUrl: baseUrl as string,
    token: token as string,
    projectId: projectId as string,
    environment: environment as string,
    override,
    failFast,
    debug
  });
}
