# nestjs-infisical

CLI-free Infisical secrets loader for NestJS.

Loads secrets from Infisical via the HTTP API **before application bootstrap**,
injects them into `process.env`, and works seamlessly with `@nestjs/config`.

![npm](https://img.shields.io/npm/v/nestjs-infisical)
![node](https://img.shields.io/node/v/nestjs-infisical)
![license](https://img.shields.io/npm/l/nestjs-infisical)


---

## Why nestjs-infisical exists

Secrets loading is **global, side-effectful, and order-sensitive**.

Running Infisical logic inside NestJS modules, providers, or lifecycle hooks leads to:
- Non-deterministic startup order
- Race conditions between modules
- Hard-to-debug configuration issues

`nestjs-infisical` follows the same approach used by mature infrastructure tooling:
**load secrets before the framework starts**.

This guarantees predictable startup behavior across:
- Local development
- Docker
- CI/CD
- Production environments

---

## Architecture (pre-bootstrap loader)

Startup flow:

1. Optional dotenv load
2. Resolve configuration (options → environment variables)
3. Authenticate with Infisical
4. Fetch secrets via Infisical HTTP API
5. Inject secrets into `process.env`
6. Bootstrap NestJS
7. `@nestjs/config` reads from `process.env`

Diagram:

dotenv → Infisical Auth → Infisical HTTP API → process.env → NestJS → ConfigModule

---

## Authentication modes

This package supports **two Infisical authentication methods**.

### Recommended: Universal Authentication

Uses a short-lived access token generated from a client ID and client secret.

Best suited for:
- Production
- CI/CD pipelines
- Docker / Kubernetes
- Machine-to-machine access

Environment variables:

INFISICAL_CLIENT_ID  
INFISICAL_CLIENT_SECRET  

---

### Service / Personal Token (supported)

Uses a long-lived Infisical token.

Best suited for:
- Local development
- Prototyping
- Backward compatibility

Environment variable:

INFISICAL_TOKEN  

---

### Authentication priority

If both authentication methods are provided:
- Service token is used
- A warning is logged

---

## Installation

```
npm install nestjs-infisical
```

Requirements:
- Node.js 18 or newer

---

## Usage (recommended)

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

Required configuration:

INFISICAL_PROJECT_ID  
INFISICAL_ENVIRONMENT  

Authentication (choose one):

INFISICAL_TOKEN  
or  
INFISICAL_CLIENT_ID + INFISICAL_CLIENT_SECRET  

Optional:

INFISICAL_BASE_URL (defaults to Infisical Cloud)

---

## Zero-config usage

If everything is defined in `.env`:

```env
INFISICAL_CLIENT_ID=xxx
INFISICAL_CLIENT_SECRET=yyy
INFISICAL_PROJECT_ID=zzz
INFISICAL_ENVIRONMENT=dev
```

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

Missing values are automatically resolved from `process.env`.

---

## Disable dotenv (Docker / Kubernetes)

```ts
await loadInfisical({
  dotenv: false
});
```

---

## Failure behavior

- **failFast: true** (default)  
  Application startup fails if Infisical cannot be reached

- **failFast: false**  
  Logs a warning and continues without secrets

---

## Compatibility with @nestjs/config

Because secrets are loaded **before NestJS starts**,
`@nestjs/config` works automatically with no special integration.

```ts
ConfigModule.forRoot({
  isGlobal: true
});
```

---

## What this package does NOT do

- No Infisical CLI usage
- No token rotation or refresh
- No background polling
- No caching
- No retries
- No NestJS lifecycle hooks
- No decorators
- No health checks

---

## Versioning note

v2.x introduces a **pre-bootstrap loader architecture**.
If you were using a module-based approach, migrate by moving Infisical loading
into `main.ts`.

---

## Repository

GitHub:  
https://github.com/kgoel085/nest-js-infisical-module

---

## License

MIT
