"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Backend = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("../middleware/cors"));
const log_1 = __importDefault(require("../middleware/log"));
const v1_1 = require("../routes/v1");
const logger_1 = require("./logger");
const websocketManager_class_1 = require("./websocketManager.class");
class Backend {
    constructor(settings) {
        this.express = (0, express_1.default)().use(cors_1.default).use(log_1.default).use(express_1.default.json()).use(v1_1.v1);
        this.port = settings.port;
        this.verbose = settings.verbose;
        this.mongoUrl = settings.mongoUrl;
        this.secure = settings.secure;
        this.server = this.secure
            ? https_1.default.createServer({
                key: fs_1.default.readFileSync("./key.pem"),
                cert: fs_1.default.readFileSync("./cert.pem"),
            }, this.express)
            : http_1.default.createServer(this.express);
        this.websocketManager = new websocketManager_class_1.WebsocketManager(this.server);
    }
    static async create(settings) {
        const server = new this(settings);
        await server.connectDatabase();
        server.listen();
        return server;
    }
    async connectDatabase() {
        logger_1.Logger.info(`Connecting to MongoDB...`);
        return mongoose_1.default
            .connect(this.mongoUrl, { appName: "Xornet Backend" })
            .then(() => this.verbose && logger_1.Logger.info("MongoDB Connected"))
            .catch((reason) => {
            this.verbose && logger_1.Logger.info("MongoDB failed to connect, reason: ", reason);
            process.exit(1);
        });
    }
    listen() {
        this.server.listen(this.port, () => this.verbose && logger_1.Logger.info(`Started on port ${this.port.toString()}`));
    }
}
exports.Backend = Backend;
