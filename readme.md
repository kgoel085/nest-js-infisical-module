# nestjs-infisical

CLI-free Infisical secrets loader for NestJS applications.

This package loads secrets from Infisical **before** your NestJS application boots,
injects them into `process.env`, and then hands control back to NestJS.
It is intentionally boring, deterministic, and production-safe.

---

## Why this package exists

Earlier versions attempted to integrate Infisical directly inside NestJS modules.
While technically possible, this approach is **not deterministic** because:

- NestJS does not guarantee global ordering of module side-effects
- Async work inside modules can interleave with bootstrap
- Debugging startup order becomes extremely difficult

Secrets loading is **global, side-effectful, and order-sensitive**.
The correct place for it is **before NestJS starts**.

This package now follows the same pattern used by:
- AWS Parameter Store loaders
- Vault integrations
- Remote config systems
- Feature flag bootstrappers

---

## Architecture (Current)

Startup flow:

1. Optional dotenv load
2. Infisical HTTP API call
3. Inject secrets into `process.env`
4. NestJS application bootstrap
5. `@nestjs/config` reads from `process.env`

Diagram:

dotenv → Infisical HTTP API → process.env → NestJS → ConfigModule

---

## What changed from v1 to v2

### Old approach (v1 – deprecated)

- Dynamic NestJS module
- Async logic inside providers
- Relied on NestJS lifecycle ordering
- Hard to debug, non-deterministic

### New approach (v2 – current)

- Explicit async loader
- Called from `main.ts`
- Fully deterministic
- No NestJS lifecycle coupling
- Easier to reason about and debug

---

## Installation

```
npm install nestjs-infisical
```

Node.js version requirement:

- Node 18 or newer

---

## Basic usage (recommended)

### main.ts

```ts
import { loadInfisical } from 'nestjs-infisical';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  await loadInfisical({
    debug: true
  });

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
```

That is all you need.

---

## Configuration resolution order

Configuration is resolved in this order:

1. dotenv (unless disabled)
2. Explicit options passed to `loadInfisical`
3. Environment variables (`process.env`)

Required environment variables:

- `INFISICAL_BASE_URL` (optional, defaults to Infisical Cloud)
- `INFISICAL_TOKEN`
- `INFISICAL_PROJECT_ID`
- `INFISICAL_ENVIRONMENT`

---

## Zero-config usage

If all configuration is present in `.env`:

```
INFISICAL_TOKEN=xxx
INFISICAL_PROJECT_ID=yyy
INFISICAL_ENVIRONMENT=dev
```

You can simply call:

```ts
await loadInfisical();
```

---

## Mixed configuration example

```ts
await loadInfisical({
  environment: 'production',
  debug: true
});
```

Missing values are automatically read from `process.env`.

---

## Disable dotenv (Docker / Kubernetes)

```ts
await loadInfisical({
  dotenv: false
});
```

---

## Failure behavior

- `failFast: true` (default)
  - Application crashes if Infisical fails
- `failFast: false`
  - Logs warning and continues without secrets

---

## What this package does NOT do

- No Infisical CLI usage
- No secret rotation
- No background polling
- No caching
- No retries
- No NestJS module mutation
- No decorators
- No health checks

---

## Compatibility with @nestjs/config

Because secrets are loaded **before** NestJS starts,
`@nestjs/config` works automatically without any integration.

```ts
ConfigModule.forRoot({
  isGlobal: true
});
```

All secrets are already present in `process.env`.

---

## Versioning note

This architecture change is released as **v2.x**.
If you were using the old module-based integration,
migrate by moving Infisical loading to `main.ts`.

---

## License

MIT
