"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const logger_1 = require("../classes/logger");
async function default_1(req, res, next) {
    const startedAt = process.hrtime();
    next();
    const elapsed = process.hrtime(startedAt);
    const ms = elapsed[0] * 1e3 + elapsed[1] * 1e-6;
    logger_1.Logger.info(`${req.method} ${req.originalUrl || req.url} ${ms.toFixed(2)}ms ${chalk_1.default.gray(`-- ${req.headers["cf-connecting-ip"] || "0.0.0.0"}`)}`);
}
exports.default = default_1;
