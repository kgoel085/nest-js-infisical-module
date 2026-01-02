# nestjs-infisical

nestjs-infisical is a **CLI-free**, **deterministic**, and **production-safe** Infisical integration for NestJS.

It loads secrets **once at application startup** using the **Infisical HTTP API only** and injects them into `process.env`, making it fully compatible with `@nestjs/config`.

This package is intentionally boring.

---

## Why This Package Exists

Most Infisical integrations rely on the Infisical CLI, background agents, or runtime polling.

This package exists to provide:

- No CLI dependency
- No background processes
- No runtime mutation
- Deterministic startup behavior
- Works in Docker, CI, and production
- Pure HTTP API usage

If you want secrets loaded **once at boot** and then forgotten, this is for you.

---

## What This Package Does

- Loads environment variables from `.env` using `dotenv` (optional)
- Fetches secrets from Infisical via HTTP
- Injects secrets into `process.env`
- Allows `@nestjs/config` to consume them normally
- Runs **only during application bootstrap**

---

## Load Order (IMPORTANT)

The load order is **strict and deterministic**:

```text
dotenv (optional)
   ↓
Infisical HTTP API
   ↓
process.env
   ↓
@nestjs/config
```

This guarantees compatibility with `ConfigModule.forRoot()`.

---

## Installation

```bash
npm install nestjs-infisical
```

Node.js **>= 18** is required.

---

## Basic (Sync) Usage

```ts
import { Module } from '@nestjs/common';
import { InfisicalModule } from 'nestjs-infisical';

@Module({
  imports: [
    InfisicalModule.forRoot({
      baseUrl: 'https://app.infisical.com',
      token: process.env.INFISICAL_TOKEN,
      projectId: process.env.INFISICAL_PROJECT_ID,
      environment: 'production',
    }),
  ],
})
export class AppModule {}
```

Secrets will be injected into `process.env` before the application finishes bootstrapping.

---

## Async Usage (Recommended)

```ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfisicalModule } from 'nestjs-infisical';

@Module({
  imports: [
    ConfigModule.forRoot(),
    InfisicalModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseUrl: config.get('INFISICAL_BASE_URL'),
        token: config.get('INFISICAL_TOKEN'),
        projectId: config.get('INFISICAL_PROJECT_ID'),
        environment: config.get('INFISICAL_ENVIRONMENT'),
      }),
    }),
  ],
})
export class AppModule {}
```

---

## Dotenv Support

This package uses the **official `dotenv` package directly**.

### Enable dotenv (default)

```ts
InfisicalModule.forRoot({
  dotenv: {
    path: '.env.local',
  },
});
```

### Disable dotenv

```ts
InfisicalModule.forRoot({
  dotenv: false,
});
```

---

## Configuration Options

```ts
interface InfisicalModuleOptions {
  baseUrl?: string;
  token?: string;
  projectId?: string;
  environment?: string;
  dotenv?: DotenvConfigOptions | false;
  override?: boolean;   // default: true
  failFast?: boolean;   // default: true
}
```

### override

- `true` → Infisical secrets overwrite existing environment variables
- `false` → Existing environment variables are preserved

### failFast

- `true` → Application startup fails if Infisical API fails
- `false` → Logs a warning and continues startup

---

## Edge Case Behavior

### No Infisical Config Provided

Secrets are silently skipped. No logs, no errors.

### Partial Infisical Config Provided

If only some Infisical values are provided:

```text
[nestjs-infisical] Partial Infisical configuration detected. Secrets will not be loaded.
```

Secrets are skipped intentionally.

### Infisical API Failure

- `failFast: true` → Throws error and aborts startup
- `failFast: false` → Logs warning and continues

---

## Explicitly NOT Supported

This package does **not**:

- Use the Infisical CLI
- Add health checks
- Rotate secrets
- Poll or hot-reload secrets
- Cache secrets
- Add retries or backoff
- Add decorators
- Mutate NestJS internals
- Run after bootstrap

---

## Design Philosophy

- Startup-only
- Deterministic
- Boring
- Predictable
- `process.env` is the only contract

If you need dynamic secrets, rotation, or runtime behavior, use a different tool.

---

## License

MIT
