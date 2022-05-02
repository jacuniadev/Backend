import http from "http";
import { DatabaseManager } from "../database/DatabaseManager";
import { ISafeMachine, IStaticData, IMachine, IDynamicData, INetwork, MachineStatus } from "../database/schemas/machine";
import { isVirtualInterface } from "../logic";
import { redisSubscriber, redisPublisher } from "../redis";
import { MittEvent } from "../utils/mitt";
import { newWebSocketHandler, WebsocketConnection } from "../utils/ws";

export interface ClientToBackendEvents extends MittEvent {
  login: { auth_token: string };
  close: {};
}

export interface BackendToClientEvents extends MittEvent {
  heartbeat: {};
  "dynamic-data": { machines: ISafeMachine[] };
  "machine-added": { machine: ISafeMachine };
  "machine-disconnected": { machine: ISafeMachine };
}

export interface ReporterToBackendEvents extends MittEvent {
  close: {};
  login: { auth_token: string };
  "static-data": IStaticData;
  "dynamic-data": IDynamicData;
  pong: { timestamp: number };
}

export interface BackendToReporterEvents extends MittEvent {
  ping: {};
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

  public heartbeat = setInterval(() => {
    this.broadcastClients("heartbeat");
    // this.pingReporters();
  }, 1000);

  /**
   * Sends an event to all the clients or to a specified list of clients by their uuid
   * @param event The name of the event
   * @param data The data to send
   * @param specificClients The list of specific clients to emit to
   */
  public broadcastClients(event: keyof BackendToClientEvents, data?: string | object, specificClients?: string[]) {
    // If they defined specific client uuids then just emit to those
    if (specificClients) {
      return Object.entries(this.userConnections).forEach(
        async ([userUuid, user]) => specificClients.includes(userUuid) && user.emit(event, data)
      );
    }

    // Otherwise emit to all the clients
    Object.values(this.userConnections).forEach(async (user) => user.emit(event, data));
  }

  public pingReporters() {
    Object.values(this.reporterConnections).forEach((reporter) => reporter.emit("ping", { timestamp: Date.now() }));
  }

  constructor(server: http.Server, public db: DatabaseManager) {
    // Whenever we get dynamic data from any other server pass it to the rest of the servers
    // Broadcast to all clients of this shard
    redisSubscriber.subscribe("dynamic-data", (message) => this.broadcastClients("dynamic-data", JSON.parse(message)));
    redisSubscriber.subscribe("machine-added", (message) => this.broadcastClients("machine-added", JSON.parse(message)));

    const userSockets = newWebSocketHandler<ClientToBackendEvents>(server, "/client");

    userSockets.on("connection", (socket) => {
      let session_uuid = "";

      socket.on("login", async (data) => {
        const user = await this.db.login_user_websocket(data.auth_token);
        if (!user) return socket.socket.close();
        session_uuid = `${user.uuid}-${Date.now()}`;
        this.userConnections[session_uuid] = socket;
      });

      socket.on("close", () => delete this.userConnections[session_uuid]);
    });

    const reporterSockets = newWebSocketHandler<ReporterToBackendEvents>(server, "/reporter");

    reporterSockets.on("connection", async (socket) => {
      let machine: IMachine | undefined = undefined;
      let ping: number = 0;
      // let usersThatHaveAccess: string[] = [];

      socket.on("close", async () => {
        if (machine) {
          machine.status = MachineStatus.Offline;
          const updatedMachine = await machine.save();

          // Tell the clients that this machine is offline :trollcrazy:
          for (const user_uuid of [updatedMachine.owner_uuid, ...updatedMachine.access]) {
            console.log(Object.keys(this.userConnections));
            console.log(`trying to emit to user: `, user_uuid);

            Object.entries(this.userConnections).forEach(([session_uuid, user]) => {
              // we check if it startswith the id because after the uuid they have the timestamp
              // that tells the clients apart, that way we emit to all the clients that have the same user uuid
              session_uuid.startsWith(user_uuid) && user.emit("machine-disconnected", updatedMachine);
            });
          }
        }
      });

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

      socket.on("pong", ({ timestamp }) => (ping = Date.now() - timestamp));

      socket.on("static-data", (data) => machine?.update_static_data(data));

      socket.on("dynamic-data", (data) => {
        const computedData = {
          ...data,
          ping,
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
        process.env.SHARD_ID
          ? redisPublisher.publish("dynamic-data", JSON.stringify(computedData))
          : this.broadcastClients("dynamic-data", computedData);
      });
    });
  }
}
