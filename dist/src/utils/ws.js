"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newWebSocketHandler = exports.parseData = exports.WebsocketConnection = void 0;
const mitt_1 = __importDefault(require("mitt"));
const ws_1 = __importDefault(require("ws"));
const mitt_2 = require("./mitt");
class WebsocketConnection extends mitt_2.Mitt {
    constructor(socket) {
        super();
        this.socket = socket;
        socket.on("message", (message) => {
            const { e: event, d: data } = parseData(message);
            this.emit(event, data);
        });
        this.on("*", (name, event) => socket.send(JSON.stringify({
            e: name,
            d: event,
        })));
    }
}
exports.WebsocketConnection = WebsocketConnection;
function parseData(data) {
    return JSON.parse(data.toString());
}
exports.parseData = parseData;
function newWebSocketHandler(server, path) {
    const websocketServer = new ws_1.default.Server({
        noServer: true,
        path,
    });
    server.on("upgrade", function upgrade(request, socket, head) {
        if (request.url === path) {
            websocketServer.handleUpgrade(request, socket, head, function done(ws) {
                websocketServer.emit("connection", ws, request);
            });
        }
    });
    const emitter = (0, mitt_1.default)();
    websocketServer.on("connection", (socket) => emitter.emit("connection", new WebsocketConnection(socket)));
    return [websocketServer, emitter];
}
exports.newWebSocketHandler = newWebSocketHandler;
