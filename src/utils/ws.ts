import http from "http";
import mitt, { Emitter } from "mitt";
import { default as ws, RawData } from "ws";
import { Mitt, MittEvent } from "./mitt";
import painpeko from "pako";

export interface WebsocketMessage<T extends string, D extends object> {
  e: T;
  d: D;
}

export class WebsocketConnection<T extends MittEvent> extends Mitt<T> {
  constructor(public socket: ws) {
    super();
    socket.on("message", (message) => {
      const { e: event, d: data } = parseData(message);
      this.emit(event, data);
    });

    this.on("*", (name, event) => {
      const string = JSON.stringify({
        e: name,
        d: event,
      });

      const uint8array = new Uint8Array(string.length);
      for (let i = 0; i < string.length; i++) {
        uint8array[i] = string.charCodeAt(i);
      }

      socket.send(painpeko.gzip(uint8array));
    });
  }
}

export function parseData(data: RawData) {
  return JSON.parse(data.toString()) as WebsocketMessage<string, any>;
}

interface WebsocketEmitter<T extends MittEvent> {
  connection: WebsocketConnection<T>;
  [key: string | symbol]: unknown;
}

export function newWebSocketHandler<T extends MittEvent>(server: http.Server, path: string): Emitter<WebsocketEmitter<T>> {
  const websocketServer = new ws.Server({
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

  const emitter = mitt<WebsocketEmitter<T>>();

  websocketServer.on("connection", (socket) => emitter.emit("connection", new WebsocketConnection(socket)));

  return emitter;
}
