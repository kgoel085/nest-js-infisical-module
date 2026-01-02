import { InfisicalModuleOptions } from './infisical.types';
import { loadInfisicalSecrets } from './infisical.loader';
import dotenv from 'dotenv';

const LOG_PREFIX = '[nestjs-infisical]';

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
  } = options;

  if (dotenvOptions !== false) {
    dotenv.config(dotenvOptions);
  }

  const provided = [baseUrl, token, projectId, environment].filter(Boolean).length;

  if (provided === 0) {
    return;
  }

  if (provided !== 4) {
    console.warn(
      `${LOG_PREFIX} Partial Infisical configuration detected. Secrets will not be loaded.`,
    );
    return;
  }

  await loadInfisicalSecrets({
    baseUrl: baseUrl as string,
    token: token as string,
    projectId: projectId as string,
    environment: environment as string,
    override,
    failFast,
  });
}
