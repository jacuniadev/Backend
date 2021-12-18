import ws, { RawData } from "ws";
import mitt, { Emitter } from "mitt";
import { DynamicData, StaticData } from "../types/machine";
import { loginMachine } from "../services/machine.service";

export interface WebsocketEvent<ID extends EventID, T> {
  e: ID;
  data: T;
}

export enum EventID {
  login = 0x01,
  statics = 0x04,
  dynamicData = 0x05,
}

export interface Events {
  login: WebsocketEvent<EventID.login, { access_token: string }>;
  statics: WebsocketEvent<EventID.statics, StaticData>;
  dynamicData: WebsocketEvent<EventID.statics, DynamicData>;
}

export class WebsocketConnection {
  public mitt = mitt<{
    [k in keyof Events]: Events[k]["data"];
  }>();
  public is_authenticated = false;

  constructor(public socket: ws) {
    console.log("Reporter Connected");
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
      ws.mitt.on("login", async (data) => {
        if (await loginMachine(data.access_token)) {
          ws.is_authenticated = true;
          console.log("the bitch is authed");
        }
      });
    });
  }
}
