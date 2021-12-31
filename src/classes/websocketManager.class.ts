import http from "http";
import { loginMachine, updateStaticData } from "../services/machine.service";
import { loginWebsocketUser } from "../services/user.service";
import { DynamicData, MachineObject, StaticData } from "../types/machine";
import { MittEvent } from "../utils/mitt";
import { newWebSocketHandler, WebsocketConnection } from "../utils/ws";

export interface ClientToBackendEvents extends MittEvent {
  login: { auth_token: string };
}

export interface BackendToClientEvents extends MittEvent {
  machineData: { machines: MachineObject[] };
}

export interface ReporterToBackendEvents extends MittEvent {
  login: { auth_token: string };
  staticData: StaticData;
  dynamicData: DynamicData;
}

export interface BackendToReporterEvents extends MittEvent {
  /** { imaginary events } */
  /** 🤖 imagine a place  */
  /** "Your robot is different :0!" - Bluskript 2022 */
}

/**
 * Welcome to the troll-zone :trollface:
 */
export class WebsocketManager {
  public userConnections: {
    [userID: string]: WebsocketConnection<ClientToBackendEvents>;
  } = {};

  public reporterConnections: {
    [machineID: string]: WebsocketConnection<ReporterToBackendEvents>;
  } = {};

  constructor(server: http.Server) {
    // I will trollcrazy you :trollface:
    const [_userSocketServer, userSocket] = newWebSocketHandler<ClientToBackendEvents>(server, "/client");

    userSocket.on("connection", (socket) => {
      socket.on("login", async (data) => {
        const user = await loginWebsocketUser(data.auth_token);
        this.userConnections[user.uuid] = socket;
      });
    });

    // I will trollcrazy you again :trollface:
    const [_reporterSocketServer, reporterSocket] = newWebSocketHandler<ReporterToBackendEvents>(server, "/reporter");

    reporterSocket.on("connection", (socket) => {
      let machineUUID: string | undefined = undefined;

      socket.on("login", async (data) => {
        try {
          const machine = await loginMachine(data.auth_token);
          this.reporterConnections[machine.uuid] = socket;
          machineUUID = machine.uuid;
        } catch (error) {
          console.log("Closed reporter socket because it failed auth");
          socket.socket.close();
        }
      });
      socket.on("staticData", (data) => {
        updateStaticData(machineUUID!, data);
      });
      socket.on("dynamicData", (data) => {
        Object.values(this.userConnections).forEach((user) => {
          user.emit("machineData", { ...data, uuid: machineUUID });
        });
      });
    });
  }
}

// the backend totally doesnt start up without this!
const trolls = [
  "discord.gg/trollcrazy",
  "discord.gg/trolley",
  "discord.gg/trollface",
  "discord.gg/trollely",
  "discord.gg/trolleycrazy",
];

// cALCULATE THE CURRENT TROLL RATIO
const currentTroll = ~~trolls[Math.random() * trolls.length - 1];
