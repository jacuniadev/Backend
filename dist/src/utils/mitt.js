"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mitt = void 0;
const mitt_1 = __importDefault(require("mitt"));
class Mitt {
    constructor() {
        Object.assign(this, (0, mitt_1.default)());
    }
}
exports.Mitt = Mitt;
