import { DotenvConfigOptions } from 'dotenv';
import { ModuleMetadata } from '@nestjs/common';

export interface InfisicalModuleOptions {
  baseUrl?: string;
  token?: string;
  projectId?: string;
  environment?: string;
  dotenv?: DotenvConfigOptions | false;
  override?: boolean;
  failFast?: boolean;
}

export interface InfisicalModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory: (...args: any[]) => Promise<InfisicalModuleOptions> | InfisicalModuleOptions;
}
