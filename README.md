# aws-sso-credentials

Generate AWS Credentials from current AWS SSO Session.

# Install

```bash
npm i -g aws-sso-credentials
```

# Usage

```
$ aws-sso-credentials > ~/.aws/credentials
$ echo ~/.aws/credentials
[%profile-name%]
region = %region%
aws_access_key_id = %ACCESS_KEY_ID%
aws_secret_access_key = %SECRET_ACCESS_KEY%
aws_session_token = %SESSION_TOKEN%
```

# How it works

- Get current profile name from `--profile <here>`, `AWS_PROFILE` or `AWS_DEFAULT_PROFILE`.
- Get profile config from `~/.aws/config`.
- Get AWS SSO Login cache from `~/.aws/sso/cache/*.json`
- Get credentials from `aws sso get-role-credentials ...`
