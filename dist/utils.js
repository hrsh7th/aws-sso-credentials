"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exit = exports.trying = void 0;
function trying(runner, catcher) {
    try {
        return runner();
    }
    catch (e) {
        catcher(e);
    }
    throw new Error('unreachable');
}
exports.trying = trying;
function exit(message, e) {
    if (process.env.DEBUG === '1') {
        console.error(message, e);
    }
    else {
        console.error(message);
    }
    process.exit(1);
}
exports.exit = exit;
