import express, { Express } from "express";
import http from "http";
import cors from "cors";
import { v1 } from "../routes/v1";
import mongoose from "mongoose";
import { BackendSettings } from "../types/backend";

const MONGO_DEFAULT_URI: string = "mongodb://localhost/xornet";

export class Backend implements BackendSettings {
  public express: Express = express().use(express.json()).use(v1);
  public server = http.createServer(this.express);
  public port: number;
  public verbose: boolean;

  private constructor(settings: BackendSettings) {
    this.port = settings.port || 8081;
    this.verbose = settings.verbose;
  }

  public static async create(settings: BackendSettings) {
    const server = new this(settings);
    await server.connectDatabase();
    server.listen();
    return server;
  }

  private async connectDatabase(mongoUrl: string = MONGO_DEFAULT_URI) {
    return mongoose
      .connect(mongoUrl, { appName: "Xornet Backend" })
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
