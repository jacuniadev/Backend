"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.v1 = void 0;
const express_1 = __importDefault(require("express"));
const logic_1 = require("../../logic");
const machines_route_1 = require("./machines.route");
const users_route_1 = require("./users.route");
exports.v1 = express_1.default.Router();
const HELLO_WORLD = JSON.stringify({
    message: "Hello World",
});
exports.v1.get("/", async (req, res) => res.send(HELLO_WORLD));
exports.v1.get("/ping", async (req, res) => res.send());
exports.v1.get("/status", async (req, res) => res.json({
    memory: await (0, logic_1.getMemoryUsage)(),
    processor: await (0, logic_1.getProcessorUsage)(),
    uptime: process.uptime(),
}));
exports.v1.use("/users", users_route_1.users);
exports.v1.use("/machines", machines_route_1.machines);
