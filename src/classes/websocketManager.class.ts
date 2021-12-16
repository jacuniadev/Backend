import ws, { RawData } from "ws";

export class WebsocketConnection {
  constructor(public socket: ws) {
    console.log("Reporter Connected");
    let hostname = "Unknown";
    socket.on("message", (message) => {
      const data = this.parseData(message);
      // if (data?.statics?.hostname) hostname = data.statics.hostname;
      console.log(
        `${hostname}: ${message.toString().length} bytes CPU: ${
          data.cpu?.usage.reduce((a: any, b: any) => a + b, 0) / data.cpu?.usage.length
        }`
      );
      console.log(data);
    });
  }

  private parseData(data: RawData) {
    return JSON.parse(data.toString());
  }
}

export class WebsocketManager {
  constructor(public server: ws.Server) {
    this.server.on("connection", (socket) => new WebsocketConnection(socket));
  }
}
