import { DotenvConfigOptions } from 'dotenv';

export interface InfisicalOptions {
  baseUrl?: string;
  token?: string;
  projectId?: string;
  environment?: string;

  dotenv?: DotenvConfigOptions | false;
  override?: boolean;
  failFast?: boolean;
  debug?: boolean;
}

export interface InfisicalSecretItem {
  id: string;
  environment: string;
  type: string;
  secretKey: string;
  secretValue: string;
  createdAt: string;
  updatedAt: string;
}