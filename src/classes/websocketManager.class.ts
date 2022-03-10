import axios from "axios";
import http from "http";
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

export interface BackendToReporterEvents extends MittEvent {}

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

  /**
   * Sends an event to all the clients or to a specified list of clients by their uuid
   * @param event The name of the event
   * @param data The data to send
   * @param specificClients The list of specific clients to emit to
   */
  public broadcastClients(event: keyof BackendToClientEvents, data?: any, specificClients?: string[]) {
    // If they defined specific client uuids then just emit to those
    // if (specificClients) {
    //   return Object.entries(this.userConnections).forEach(
    //     ([userUuid, user]) => specificClients.includes(userUuid) && user.emit(event, data)
    //   );
    // }

    // Otherwise emit to all the clients
    Object.values(this.userConnections).forEach((user) => user.emit(event, data));
  }

  constructor(server: http.Server) {
    // I will trollcrazy you :trollface:
    const [_userSocketServer, userSocket] = newWebSocketHandler<ClientToBackendEvents>(server, "/client");

    userSocket.on("connection", (socket) => {
      socket.on("login", async (data) => {
        const user = await loginWebsocketUser(data.auth_token);
        this.userConnections[`${user.uuid}-${Date.now()}`] = socket;
      });
    });

    // I will trollcrazy you again :trollface:
    const [_reporterSocketServer, reporterSocket] = newWebSocketHandler<ReporterToBackendEvents>(server, "/reporter");

    reporterSocket.on("connection", async (socket) => {
      let machineUUID: string | undefined = undefined;
      // let usersThatHaveAccess: string[] = [];

      socket.on("login", async (data) => {
        try {
          const machine = await loginMachine(data.auth_token);
          this.reporterConnections[machine.uuid] = socket;
          machineUUID = machine.uuid;
          // // Find the machine in the database
          // const machineInDatabase = await machines.findOne({ uuid: machineUUID }).catch();
          // // TODO: Make this disconnect the socket
          // if (!machineInDatabase) return;
          // usersThatHaveAccess = [machineInDatabase.owner_uuid, ...machineInDatabase.access];
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

      socket.on("dynamicData", async (data) => {
        const computedData = {
          ...data,
          uuid: machineUUID,
          // Computed values
          cau: ~~(data.cpu.usage.reduce((a, b) => a + b, 0) / data.cpu.usage.length),
          cas: ~~(data.cpu.freq.reduce((a, b) => a + b, 0) / data.cpu.usage.length),
          td: data.network.reduce((a, b) => a + b.rx, 0) / 1000 / 1000,
          tu: data.network.reduce((a, b) => a + b.tx, 0) / 1000 / 1000,
        };

        // this.broadcastClients("machineData", computedData, usersThatHaveAccess);
        this.broadcastClients("machineData", computedData);
      });
    });
  }
}
