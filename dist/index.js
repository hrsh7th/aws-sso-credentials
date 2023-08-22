"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_os_1 = require("node:os");
var node_path_1 = require("node:path");
var node_fs_1 = require("node:fs");
var ini_1 = require("ini");
var node_child_process_1 = require("node:child_process");
var node_util_1 = require("node:util");
var utils_1 = require("./utils");
var profile = (0, utils_1.trying)(function () {
    var _a, _b;
    var profile = (_b = (_a = (0, node_util_1.parseArgs)({
        options: {
            profile: {
                type: 'string'
            }
        }
    }).values.profile) !== null && _a !== void 0 ? _a : process.env.AWS_PROFILE) !== null && _b !== void 0 ? _b : process.env.AWS_DEFAULT_PROFILE;
    if (!profile) {
        throw Error();
    }
    return profile;
}, function (e) {
    (0, utils_1.exit)("Can't detect profile from `AWS_PROFILE`, `AWS_DEFAULT_PROFILE` or `--profile <HERE>`", e);
});
var awsConfig = (0, utils_1.trying)(function () {
    return (0, ini_1.parse)((0, node_fs_1.readFileSync)((0, node_path_1.join)((0, node_os_1.homedir)(), '.aws', 'config'), 'utf-8'));
}, function (e) {
    (0, utils_1.exit)('Failed to read `~/.aws/config`', e);
});
var profileConfig = (0, utils_1.trying)(function () {
    if (!("profile ".concat(profile) in awsConfig)) {
        throw new Error();
    }
    return awsConfig["profile ".concat(profile)];
}, function (e) {
    (0, utils_1.exit)("Profile `".concat(profile, "` not found in `~/.aws/config`"), e);
});
var ssoSessionCache = (0, utils_1.trying)(function () {
    for (var _i = 0, _a = (0, node_fs_1.readdirSync)((0, node_path_1.join)((0, node_os_1.homedir)(), '.aws', 'sso', 'cache'), 'utf-8'); _i < _a.length; _i++) {
        var name_1 = _a[_i];
        var cache = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.join)((0, node_os_1.homedir)(), '.aws', 'sso', 'cache', name_1), 'utf-8'));
        if ('startUrl' in cache) {
            return cache;
        }
    }
    throw new Error('No SSO session cache found');
}, function (e) {
    (0, utils_1.exit)('Failed to parse/search AWS SSO session cache', e);
});
var credentials = (0, utils_1.trying)(function () {
    var _a, _b;
    return JSON.parse((0, node_child_process_1.execSync)("\n    aws sso get-role-credentials       --role-name ".concat(profileConfig.sso_role_name, "       --account-id ").concat(profileConfig.sso_account_id, "       --access-token ").concat(ssoSessionCache.accessToken, "       --region ").concat((_b = (_a = profileConfig.sso_region) !== null && _a !== void 0 ? _a : profileConfig.region) !== null && _b !== void 0 ? _b : 'ap-northeast-1', "\n  ")).toString('utf-8'));
}, function (e) {
    (0, utils_1.exit)('Failed to call/parse `aws sso get-role-credentials ...`', e);
});
console.log("[".concat(profile, "]\nregion=ap-northeast-1\naws_access_key_id = ").concat(credentials.roleCredentials.accessKeyId, "\naws_secret_access_key = ").concat(credentials.roleCredentials.secretAccessKey, "\naws_session_token = ").concat(credentials.roleCredentials.sessionToken));
