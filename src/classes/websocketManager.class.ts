import ws, { RawData } from "ws";
import mitt from "mitt";
import { DynamicData, StaticData } from "../types/machine";
import { loginMachine } from "../services/machine.service";

export interface WebsocketMessage<T extends WebsocketEventType, D> {
  e: T;
  data: D;
}

export enum WebsocketEventType {
  reporterLogin = 0x01,
  staticData = 0x04,
  dynamicData = 0x05,
}

export interface WebsocketEvents {
  reporterLogin: WebsocketMessage<WebsocketEventType.reporterLogin, { access_token: string }>;
  staticData: WebsocketMessage<WebsocketEventType.staticData, StaticData>;
  dynamicData: WebsocketMessage<WebsocketEventType.staticData, DynamicData>;
}

export class WebsocketConnection {
  public mitt = mitt<{ [k in keyof WebsocketEvents]: WebsocketEvents[k]["data"] }>();
  public isAuthenticated = false;

  constructor(public socket: ws) {
    socket.on("message", (message) => {
      const { e, data } = this.parseData(message);
      const eventName = WebsocketEventType[e];

      if (!this.isAuthenticated && e !== WebsocketEventType.reporterLogin) return socket.close();

      this.mitt.emit(eventName as keyof typeof WebsocketEventType, data);
    });
  }

  private parseData(data: RawData) {
    return JSON.parse(data.toString()) as WebsocketMessage<WebsocketEventType, any>;
  }
}

export class WebsocketManager {
  public reporters: Record<string, WebsocketConnection> = {};
  public clients: Record<string, WebsocketConnection> = {};

  constructor(public server: ws.Server) {
    this.server.on("connection", (socket) => {
      const ws = new WebsocketConnection(socket);
      ws.mitt.on("reporterLogin", async (data) => {
        loginMachine(data.access_token)
          .then((machine) => {
            ws.isAuthenticated = true;
            this.reporters[machine.uuid] = ws;
          })
          .catch(() => {
            console.log("Failed to auth reporter");
            socket.close();
          });
      });
      ws.mitt.on("dynamicData", async (data) => {
        console.log(data);
      });
      ws.mitt.on("staticData", async (data) => {
        console.log(data);
      });
    });
  }
}
