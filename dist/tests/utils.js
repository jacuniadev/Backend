"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.describe = exports.colorizeKeywords = void 0;
const chalk_1 = __importDefault(require("chalk"));
const mocha_1 = require("mocha");
require("ts-mocha");
/**
 * Describe route
 */
const colorizeKeywords = (string) => {
    if (string.includes("()"))
        return chalk_1.default.cyan(string) + chalk_1.default.gray(" (function)");
    return string
        .replace("GET", chalk_1.default.hex("#7D69CB")("GET"))
        .replace("POST", chalk_1.default.hex("#7D69CB")("POST"))
        .replace("PUT", chalk_1.default.hex("#7D69CB")("PUT"))
        .replace("PATCH", chalk_1.default.hex("#7D69CB")("PATCH"))
        .replace("DELETE", chalk_1.default.hex("#7D69CB")("DELETE"));
};
exports.colorizeKeywords = colorizeKeywords;
/**
 * Custom describe that simply adds colors to the title
 */
const describe = (title, fn) => (0, mocha_1.describe)((0, exports.colorizeKeywords)(title), fn);
exports.describe = describe;
