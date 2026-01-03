const PREFIX = '[nestjs-infisical]';

export function debugLog(enabled: boolean | undefined, message: string) {
  if (enabled) {
    console.log(`${PREFIX} ${message}`);
  }
}