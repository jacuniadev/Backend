import express, { Express } from "express";
import fs from "fs";
import http from "http";
import https from "https";
import { DatabaseManager } from "../database/DatabaseManager";
import cors from "../middleware/cors";
import log from "../middleware/log";
import { V1 } from "../routes/v1/v1";
import { BackendSettings } from "../types";
import { Logger } from "../utils/logger";
import { WebsocketManager } from "./websocketManager.class";

export class Backend implements BackendSettings {
  public express: Express = express().use(cors).use(log).use(express.json()).use(new V1(this.db).router);
  public port: number;
  public verbose: boolean;
  public secure: boolean;
  public mongoUrl: string;
  public server: http.Server | https.Server;
  public websocketManager: WebsocketManager;

  private constructor(settings: BackendSettings, public db: DatabaseManager) {
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
    this.websocketManager = new WebsocketManager(this.server, this.db);
  }

  public static async create(settings: BackendSettings) {
    const server = new this(settings, await DatabaseManager.new(settings.mongoUrl, "Xornet Backend", "xornet"));
    server.listen();
    return server;
  }

  private listen() {
    this.server.listen(this.port, () => this.verbose && Logger.info(`Started on port ${this.port.toString()}`));
  }
}
