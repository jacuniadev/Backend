import axios from "axios";
import http from "http";
import machines from "../models/machine.model";
import { loginMachine, updateStaticData } from "../services/machine.service";
import { loginWebsocketUser } from "../services/user.service";
import { IGeolocation } from "../types";
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

  public heartbeat = setInterval(() => this.broadcastClients("heartbeat"), 1000);

  public broadcastClients(event: string, data?: any) {
    Object.values(this.userConnections).forEach((user) => user.emit(event, data));
  }

  public broadcastDynamicDataToClients(event: string, data: DynamicData & { uuid: string }) {
    Object.entries(this.userConnections).forEach(([userId, socket]) => {
      machines
        .find({ uuid: data?.uuid })
        .then((machine) => {
          if (machine[0].owner_uuid === userId || machine[0].access.includes(userId)) socket.emit(event, data);
        })
        .catch();
    });
  }

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
          socket.socket.close();
        }
      });

      socket.on("staticData", async (data) => {
        // Get the country flag from their IP
        const response = await axios.get<{}, { data: IGeolocation }>(`https://ipwhois.app/json/${data.public_ip}`).catch();
        response.data?.country_code && (data.country = response.data.country_code);
        updateStaticData(machineUUID!, data);
      });

      socket.on("dynamicData", (data) => {
        const computedData = {
          ...data,
          // Beta compatible
          network: data.network.map((e) => ({
            tx: e.tx,
            rx: e.rx,
            n: e.name,
            s: e.speed,
          })),
          uuid: machineUUID,
          cau: ~~(data.cpu.usage.reduce((a, b) => a + b, 0) / data.cpu.usage.length),
          cas: ~~(data.cpu.freq.reduce((a, b) => a + b, 0) / data.cpu.usage.length),
          td: data.network.reduce((a, b) => a + b.rx, 0) / 1000 / 1000,
          tu: data.network.reduce((a, b) => a + b.tx, 0) / 1000 / 1000,
        };

        this.broadcastDynamicDataToClients("machineData", computedData as any);
      });
    });
  }
}
