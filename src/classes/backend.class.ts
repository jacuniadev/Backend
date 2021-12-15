import express, { Express } from "express";
import http from "http";
import ws from "ws";
import cors from "cors";
import { v1 } from "../routes/v1";
import mongoose from "mongoose";
import { BackendSettings } from "../types/backend";
import { DynamicData } from "../types/reporter";

export class Backend implements BackendSettings {
  public express: Express = express().use(express.json()).use(v1);
  public server = http.createServer(this.express);
  public ws = new ws.Server({ server: this.server });
  public port: number;
  public verbose: boolean;
  public mongoUrl: string;

  private constructor(settings: BackendSettings) {
    this.port = settings.port;
    this.verbose = settings.verbose;
    this.mongoUrl = settings.mongoUrl;

    this.ws.on("connection", (socket) => {
      console.log("Reporter Connected");
      let hostname = "Unknown";
      socket.on("message", (message) => {
        const data = JSON.parse(message.toString()) as DynamicData;
        // if (data?.statics?.hostname) hostname = data.statics.hostname;
        console.log(
          `${hostname}: ${message.toString().length} bytes CPU: ${
            data.cpu?.usage.reduce((a, b) => a + b, 0) / data.cpu?.usage.length
          }`
        );
        console.log(data);
      });
    });

    this.ws.on("close", () => {
      console.log("Reporter Disconnected");
    });
  }

  public static async create(settings: BackendSettings) {
    const server = new this(settings);
    await server.connectDatabase();
    server.listen();
    return server;
  }

  private async connectDatabase() {
    return mongoose
      .connect(this.mongoUrl, { appName: "Xornet Backend" })
      .then(() => this.verbose && console.log("MongoDB Connected"))
      .catch((reason) => {
        this.verbose && console.log("MongoDB failed to connect, reason: ", reason);
        process.exit(1);
      });
  }

  private listen() {
    this.server.listen(this.port, () => this.verbose && console.log(`[INDEX] Started on port ${this.port.toString()}`));
  }
}
