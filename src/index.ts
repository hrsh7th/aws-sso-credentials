import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'ini';
import { execSync } from 'node:child_process';
import { parseArgs } from 'node:util';
import { Config, Credentials, SessionCache, SessionCachePart, exit, trying } from './utils';

const profile = trying(() => {
  const profile = parseArgs({
    options: {
      profile: {
        type: 'string'
      }
    }
  }).values.profile ?? process.env.AWS_PROFILE ?? process.env.AWS_DEFAULT_PROFILE;
  if (!profile) {
    throw Error();
  }
  return profile;
}, (e) => {
  exit(`Can't detect profile from \`AWS_PROFILE\`, \`AWS_DEFAULT_PROFILE\` or \`--profile <HERE>\``, e);
});

const awsConfig = trying<Config>(() => {
  return parse(readFileSync(join(homedir(), '.aws', 'config'), 'utf-8'));
}, e => {
  exit('Failed to read `~/.aws/config`', e);
});

const profileConfig = trying(() => {
  if (!(`profile ${profile}` in awsConfig)) {
    throw new Error();
  }
  return awsConfig[`profile ${profile}`];
}, e => {
  exit(`Profile \`${profile}\` not found in \`~/.aws/config\``, e);
})

const ssoSessionCache = trying(() => {
  for (const name of readdirSync(join(homedir(), '.aws', 'sso', 'cache'), 'utf-8')) {
    const cache: SessionCache | SessionCachePart = JSON.parse(readFileSync(join(homedir(), '.aws', 'sso', 'cache', name), 'utf-8'));
    if ('startUrl' in cache) {
      return cache;
    }
  }
  throw new Error('No SSO session cache found');
}, e => {
  exit('Failed to parse/search AWS SSO session cache', e);
});

const credentials = trying<Credentials>(() => {
  return JSON.parse(execSync(`
    aws sso get-role-credentials \
      --role-name ${profileConfig.sso_role_name} \
      --account-id ${profileConfig.sso_account_id} \
      --access-token ${ssoSessionCache.accessToken} \
      --region ${profileConfig.sso_region ?? profileConfig.region ?? 'ap-northeast-1'}
  `).toString('utf-8'));
}, e => {
  exit('Failed to call/parse `aws sso get-role-credentials ...`', e);
});

const region = ssoSessionCache.region ?? profileConfig.region ?? 'ap-northeast-1';

console.log(`[${profile}]
region = ${region}
aws_access_key_id = ${credentials.roleCredentials.accessKeyId}
aws_secret_access_key = ${credentials.roleCredentials.secretAccessKey}
aws_session_token = ${credentials.roleCredentials.sessionToken}`);

