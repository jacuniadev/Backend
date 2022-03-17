"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyManager = void 0;
const uuid_1 = require("uuid");
/**
 * A manager that creates temporary keys for people to signup their machines with
 */
class KeyManager extends Map {
    constructor(expiration = 60000 /* Minute */) {
        super();
        this.expiration = expiration;
    }
    add(userUuid, key) {
        var _a;
        const timer = setTimeout(() => this.delete(userUuid), this.expiration);
        clearTimeout((_a = this.get(userUuid)) === null || _a === void 0 ? void 0 : _a.timer);
        this.set(userUuid, { key, timer });
    }
    generateKey() {
        return (0, uuid_1.v4)().replace(/-/g, "").toUpperCase();
    }
    validate(key) {
        for (const [userUuid, value] of this.entries()) {
            if (value.key === key)
                return userUuid;
        }
    }
}
exports.KeyManager = KeyManager;
