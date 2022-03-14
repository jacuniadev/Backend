import express, { Express } from "express";
import fs from "fs";
import http from "http";
import https from "https";
import mongoose from "mongoose";
import cors from "../middleware/cors";
import log from "../middleware/log";
import { v1 } from "../routes/v1";
import { BackendSettings } from "../types";
import { Logger } from "./logger";
import { WebsocketManager } from "./websocketManager.class";

export class Backend implements BackendSettings {
  public express: Express = express().use(cors).use(log).use(express.json()).use(v1);
  public port: number;
  public verbose: boolean;
  public secure: boolean;
  public mongoUrl: string;
  public server: http.Server | https.Server;
  public websocketManager: WebsocketManager;

  private constructor(settings: BackendSettings) {
    this.port = settings.port;
    this.verbose = settings.verbose;
    this.mongoUrl = settings.mongoUrl;
    this.secure = settings.secure;
    this.server = this.secure
      ? https.createServer(
          {
            key: fs.readFileSync("./key.pem"),
            cert: fs.readFileSync("./cert.pem"),
          },
          this.express
        )
      : http.createServer(this.express);
    this.websocketManager = new WebsocketManager(this.server);
  }

  public static async create(settings: BackendSettings) {
    const server = new this(settings);
    await server.connectDatabase();
    server.listen();
    return server;
  }

  private async connectDatabase() {
    Logger.info(`Connecting to MongoDB...`);
    return mongoose
      .connect(this.mongoUrl, { appName: "Xornet Backend" })
      .then(() => this.verbose && Logger.info("MongoDB Connected"))
      .catch((reason) => {
        this.verbose && Logger.info("MongoDB failed to connect, reason: ", reason);
        process.exit(1);
      });
  }

  private listen() {
    this.server.listen(this.port, () => this.verbose && Logger.info(`Started on port ${this.port.toString()}`));
  }
}
