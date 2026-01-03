import { DotenvConfigOptions } from 'dotenv';

export interface InfisicalOptions {
  baseUrl?: string;

  // Auth (ONE of the following)
  token?: string; // service / personal token
  clientId?: string; // universal auth
  clientSecret?: string; // universal auth

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