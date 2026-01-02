import { DynamicModule, Module } from '@nestjs/common';
import {
  InfisicalModuleAsyncOptions,
  InfisicalModuleOptions,
} from './infisical.types';
import { initializeInfisical } from './infisical.service';

@Module({})
export class InfisicalModule {
  static forRoot(options: InfisicalModuleOptions = {}): DynamicModule {
    const resolved: InfisicalModuleOptions = {
      baseUrl: options.baseUrl ?? process.env.INFISICAL_BASE_URL,
      token: options.token ?? process.env.INFISICAL_TOKEN,
      projectId: options.projectId ?? process.env.INFISICAL_PROJECT_ID,
      environment: options.environment ?? process.env.INFISICAL_ENVIRONMENT,
      dotenv: options.dotenv,
      override: options.override ?? true,
      failFast: options.failFast ?? true,
    };

    return {
      module: InfisicalModule,
      providers: [
        {
          provide: 'INFISICAL_INIT',
          useFactory: async () => {
            await initializeInfisical(resolved);
          },
        },
      ],
    };
  }

  static forRootAsync(options: InfisicalModuleAsyncOptions): DynamicModule {
    return {
      module: InfisicalModule,
      imports: options.imports,
      providers: [
        {
          provide: 'INFISICAL_INIT',
          inject: options.inject ?? [],
          useFactory: async (...args: any[]) => {
            const resolved = await options.useFactory(...args);
            await initializeInfisical(resolved);
          },
        },
      ],
    };
  }
}
