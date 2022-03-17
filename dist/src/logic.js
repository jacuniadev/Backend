"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProcessorUsage = exports.getMemoryUsage = void 0;
const node_os_utils_1 = __importDefault(require("node-os-utils"));
/**
 * Gets the used/total heap in ram used
 */
const getMemoryUsage = async () => {
    const mem = process.memoryUsage();
    return {
        used: mem.heapUsed / 1024 / 1024,
        total: mem.heapTotal / 1024 / 1024,
    };
};
exports.getMemoryUsage = getMemoryUsage;
const getProcessorUsage = async () => {
    return node_os_utils_1.default.cpu.usage();
};
exports.getProcessorUsage = getProcessorUsage;
