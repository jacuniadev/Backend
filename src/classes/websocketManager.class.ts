import http from "http";
import { DatabaseManager } from "../database/DatabaseManager";
import { ISafeMachine, IStaticData, IMachine, IDynamicData, INetwork } from "../database/schemas/machine";
import { isVirtualInterface } from "../logic";
import { MittEvent } from "../utils/mitt";
import { newWebSocketHandler, WebsocketConnection } from "../utils/ws";
import { createClient } from "redis";
import { Logger } from "../utils/logger";

export interface ClientToBackendEvents extends MittEvent {
  login: { auth_token: string };
}

export interface BackendToClientEvents extends MittEvent {
  machineData: { machines: ISafeMachine[] };
}

export interface ReporterToBackendEvents extends MittEvent {
  login: { auth_token: string };
  staticData: IStaticData;
  dynamicData: IDynamicData;
}

export interface BackendToReporterEvents extends MittEvent {}

/**
 * Welcome to the troll-zone :trollface:
 */
export class WebsocketManager {
  public redisSubscriber = createClient({
    url: "redis://xornet-redis:6379",
  });

  public redisPublisher = createClient({
    url: "redis://xornet-redis:6379",
  });

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
    if (specificClients) {
      return Object.entries(this.userConnections).forEach(
        async ([userUuid, user]) => specificClients.includes(userUuid) && user.emit(event, data)
      );
    }

    // Otherwise emit to all the clients
    Object.values(this.userConnections).forEach(async (user) => user.emit(event, data));
  }

  constructor(server: http.Server, public db: DatabaseManager) {
    this.redisSubscriber.connect().then(() => Logger.info("Redis Subscriber connected "));
    this.redisPublisher.connect().then(() => Logger.info("Redis Publisher connected "));

    // Whenever we get dynamic data from any other server pass it to the rest of the servers
    this.redisSubscriber.subscribe("dynamicData", (message, channel) => {
      try {
        console.log(`Server ${process.env.SHARD} received dynamicData message in channel ${channel}`);
        // Broadcast to all clients of this shard
        this.broadcastClients("machineData", JSON.parse(message));
      } catch (ex) {
        console.log("ERR::" + ex);
      }
    });

    const userSockets = newWebSocketHandler<ClientToBackendEvents>(server, "/client");

    userSockets.on("connection", (socket) => {
      socket.on("login", async (data) => {
        const user = await this.db.login_user_websocket(data.auth_token);
        this.userConnections[`${user.uuid}-${Date.now()}`] = socket;
      });
    });

    const reporterSockets = newWebSocketHandler<ReporterToBackendEvents>(server, "/reporter");

    reporterSockets.on("connection", async (socket) => {
      let machine: IMachine | undefined = undefined;
      // let usersThatHaveAccess: string[] = [];

      socket.on("login", async (data) => {
        try {
          machine = await this.db.login_machine(data.auth_token);
          this.reporterConnections[machine.uuid] = socket;
          // // Find the machine in the database
          // const machineInDatabase = await machines.findOne({ uuid: machineUUID }).catch();
          // // TODO: Make this disconnect the socket
          // if (!machineInDatabase) return;
          // usersThatHaveAccess = [machineInDatabase.owner_uuid, ...machineInDatabase.access];
        } catch (error) {
          socket.socket.close();
        }
      });

      socket.on("staticData", (data) => machine?.update_static_data(data));

      socket.on("dynamicData", (data) => {
        const computedData = {
          ...data,
          uuid: machine!.uuid,
          // Computed values
          cau: ~~(data.cpu.usage.reduce((a, b) => a + b, 0) / data.cpu.usage.length),
          cas: ~~(data.cpu.freq.reduce((a, b) => a + b, 0) / data.cpu.usage.length),
          td: data.network.reduce((a, b) => (!isVirtualInterface(b) ? a + b.rx : a), 0) / 1000 / 1000,
          tu: data.network.reduce((a, b) => (!isVirtualInterface(b) ? a + b.tx : a), 0) / 1000 / 1000,
          tvd: data.network.reduce((a, b) => (isVirtualInterface(b) ? a + b.rx : a), 0) / 1000 / 1000,
          tvu: data.network.reduce((a, b) => (isVirtualInterface(b) ? a + b.tx : a), 0) / 1000 / 1000,
        };

        // Pass to redis to all the other servers in the network
        this.redisPublisher.publish("dynamicData", JSON.stringify(computedData));
        // this.broadcastClients("machineData", computedData, usersThatHaveAccess);
      });
    });
  }
}
