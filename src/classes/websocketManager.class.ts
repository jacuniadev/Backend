import ws, { RawData } from "ws";
import mitt, { Emitter } from "mitt";
import { DynamicData, StaticData } from "../types/machine";
import { loginMachine } from "../services/machine.service";

export interface WebsocketEvent<ID extends EventID, T> {
  e: ID;
  data: T;
}

export enum EventID {
  reporterLogin = 0x01,
  clientLogin = 0x02,
  staticData = 0x04,
  dynamicData = 0x05,
}

export interface Events {
  reporterLogin: WebsocketEvent<EventID.reporterLogin, { access_token: string }>;
  clientLogin: WebsocketEvent<EventID.clientLogin, { access_token: string }>;
  staticData: WebsocketEvent<EventID.staticData, StaticData>;
  dynamicData: WebsocketEvent<EventID.staticData, DynamicData>;
}

export class WebsocketConnection {
  public mitt = mitt<{ [k in keyof Events]: Events[k]["data"] }>();
  public is_authenticated = false;

  constructor(public socket: ws) {
    console.log("Websocket Connected");
    socket.on("message", (message) => {
      const { e, data } = this.parseData(message);
      const id = EventID[e];

      if (!this.is_authenticated && id !== "login") return socket.close();

      this.mitt.emit(id as keyof typeof EventID, data);
    });
  }

  private parseData(data: RawData) {
    return JSON.parse(data.toString()) as WebsocketEvent<EventID, any>;
  }
}

export class WebsocketManager {
  constructor(public server: ws.Server) {
    this.server.on("connection", (socket) => {
      const ws = new WebsocketConnection(socket);
      ws.mitt.on("clientLogin", async (data) => {
        console.log(data);
      });
      ws.mitt.on("reporterLogin", async (data) => {
        loginMachine(data.access_token)
          .then(() => {
            ws.is_authenticated = true;
            console.log("the bitch is authed");
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
