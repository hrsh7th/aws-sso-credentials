declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEBUG?: string;
      AWS_PROFILE?: string;
      AWS_DEFAULT_PROFILE?: string;
    }
  }
}

export type Config = Record<string, {
  sso_start_url: string;
  sso_account_id: string;
  sso_role_name: string;
  sso_region?: string;
  region?: string;
  output?: string;
}>;

export type SessionCache = {
  startUrl: string;
  region: string;
  accessToken: string;
  expiresAt: string;
  clientId: string;
  clientSecret: string;
  registrationExpiresAt: string;
};

export type SessionCachePart = {
  clientId: string;
  clientSecret: string;
};

export type Credentials = {
  roleCredentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
    expiration: string;
  }
};

export function trying<T>(runner: () => T, catcher: (e: unknown) => void): T {
  try {
    return runner()
  } catch (e) {
    catcher(e);
  }
  throw new Error('unreachable');
}

export function exit(message: string, e: unknown) {
  if (process.env.DEBUG === '1') {
    console.error(message, e);
  } else {
    console.error(message);
  }
  process.exit(1);
}

