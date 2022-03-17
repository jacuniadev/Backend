"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketManager = void 0;
const axios_1 = __importDefault(require("axios"));
const machine_service_1 = require("../services/machine.service");
const user_service_1 = require("../services/user.service");
const ws_1 = require("../utils/ws");
/**
 * Welcome to the troll-zone :trollface:
 */
class WebsocketManager {
    constructor(server) {
        this.userConnections = {};
        this.reporterConnections = {};
        this.heartbeat = setInterval(() => this.broadcastClients("heartbeat"), 1000);
        // I will trollcrazy you :trollface:
        const [_userSocketServer, userSocket] = (0, ws_1.newWebSocketHandler)(server, "/client");
        userSocket.on("connection", (socket) => {
            socket.on("login", async (data) => {
                const user = await (0, user_service_1.loginWebsocketUser)(data.auth_token);
                this.userConnections[`${user.uuid}-${Date.now()}`] = socket;
            });
        });
        // I will trollcrazy you again :trollface:
        const [_reporterSocketServer, reporterSocket] = (0, ws_1.newWebSocketHandler)(server, "/reporter");
        reporterSocket.on("connection", async (socket) => {
            let machineUUID = undefined;
            // let usersThatHaveAccess: string[] = [];
            socket.on("login", async (data) => {
                try {
                    const machine = await (0, machine_service_1.loginMachine)(data.auth_token);
                    this.reporterConnections[machine.uuid] = socket;
                    machineUUID = machine.uuid;
                    // // Find the machine in the database
                    // const machineInDatabase = await machines.findOne({ uuid: machineUUID }).catch();
                    // // TODO: Make this disconnect the socket
                    // if (!machineInDatabase) return;
                    // usersThatHaveAccess = [machineInDatabase.owner_uuid, ...machineInDatabase.access];
                }
                catch (error) {
                    socket.socket.close();
                }
            });
            socket.on("staticData", async (data) => {
                var _a;
                // Get the country flag from their IP
                const response = await axios_1.default.get(`https://ipwhois.app/json/${data.public_ip}`).catch();
                ((_a = response.data) === null || _a === void 0 ? void 0 : _a.country_code) && (data.country = response.data.country_code);
                (0, machine_service_1.updateStaticData)(machineUUID, data);
            });
            socket.on("dynamicData", async (data) => {
                const computedData = Object.assign(Object.assign({}, data), { uuid: machineUUID, 
                    // Computed values
                    cau: ~~(data.cpu.usage.reduce((a, b) => a + b, 0) / data.cpu.usage.length), cas: ~~(data.cpu.freq.reduce((a, b) => a + b, 0) / data.cpu.usage.length), td: data.network.reduce((a, b) => a + b.rx, 0) / 1000 / 1000, tu: data.network.reduce((a, b) => a + b.tx, 0) / 1000 / 1000 });
                // this.broadcastClients("machineData", computedData, usersThatHaveAccess);
                this.broadcastClients("machineData", computedData);
            });
        });
    }
    /**
     * Sends an event to all the clients or to a specified list of clients by their uuid
     * @param event The name of the event
     * @param data The data to send
     * @param specificClients The list of specific clients to emit to
     */
    broadcastClients(event, data, specificClients) {
        // If they defined specific client uuids then just emit to those
        // if (specificClients) {
        //   return Object.entries(this.userConnections).forEach(
        //     ([userUuid, user]) => specificClients.includes(userUuid) && user.emit(event, data)
        //   );
        // }
        // Otherwise emit to all the clients
        Object.values(this.userConnections).forEach((user) => user.emit(event, data));
    }
}
exports.WebsocketManager = WebsocketManager;
