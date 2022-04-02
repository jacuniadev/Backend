import express, { Express } from "express";
import fs from "fs";
import http from "http";
import https from "https";
import { DatabaseManager } from "../database/DatabaseManager";
import { checkEnvironmentVariables } from "../logic";
import cors from "../middleware/cors";
import log from "../middleware/log";
import { V1 } from "../routes/v1/v1";
import { Logger } from "../utils/logger";
import { WebsocketManager } from "./websocketManager.class";

export class Backend {
  public express: Express = express().use(cors).use(log).use(express.json()).use("/v1", new V1(this.db).router);
  public port = process.env.PORT!;
  public verbose = process.env.VERBOSE!;
  public secure = process.env.SECURE!;
  public server: http.Server | https.Server;
  public websocketManager: WebsocketManager;

  private constructor(public db: DatabaseManager) {
    checkEnvironmentVariables(["JWT_SECRET", "PORT", "SECURE", "VERBOSE"]);
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

  public static async create() {
    const server = new this(await DatabaseManager.new());
    server.listen();
    return server;
  }

  private listen() {
    this.server.listen(this.port, () => this.verbose && Logger.info(`Started on port ${this.port.toString()}`));
  }
}
