"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validators = void 0;
const joi_1 = __importDefault(require("joi"));
class Validators {
}
exports.Validators = Validators;
_a = Validators;
Validators.TRUSTED_IMAGE_HOSTERS = [
    "https://cdn.discordapp.com",
    "https://media.discordapp.net",
    "https://i.imgur.com",
    "https://avatars.githubusercontent.com",
];
Validators.ALLOWED_IMAGE_EXTENSIONS = ["png", "gif", "jpg", "jpeg", "webp"];
Validators.validateEmail = (email) => joi_1.default.string().email().not().empty().required().validate(email).error ? false : true;
Validators.validatePassword = (password) => joi_1.default.string().required().min(4).max(64).not().empty().validate(password).error ? false : true;
Validators.validateUsername = (username) => joi_1.default.string().required().min(4).max(32).alphanum().not().empty().validate(username).error ? false : true;
Validators.validateAvatarUrl = (url) => {
    if (!_a.TRUSTED_IMAGE_HOSTERS.some((hoster) => url.startsWith(hoster)))
        return false;
    if (!_a.ALLOWED_IMAGE_EXTENSIONS.some((ext) => (url.includes("?") ? url.substring(0, url.lastIndexOf("?")) : url).endsWith(ext)))
        return false;
    return joi_1.default.string().uri().validate(url).error ? false : true;
};
Validators.validateUUID = (uuid) => (joi_1.default.string().required().uuid().validate(uuid).error ? false : true);
Validators.validateHostname = (hostname) => joi_1.default.string()
    .required()
    .pattern(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/)
    .max(253)
    .validate(hostname).error
    ? false
    : true;
