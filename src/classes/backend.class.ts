import express, { Express } from "express";
import fs from "fs";
import http from "http";
import https from "https";
import mongoose from "mongoose";
import morgan from "morgan";
import { v1 } from "../routes/v1";
import { BackendSettings } from "../types";
import { WebsocketManager } from "./websocketManager.class";

export class Backend implements BackendSettings {
  public express: Express = express()
    .use(function (req, res, next) {
      // Website you wish to allow to connect
      res.setHeader("Access-Control-Allow-Origin", "https://beta.xornet.cloud");

      console.log("we did some trolling");

      // Request methods you wish to allow
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

      // Request headers you wish to allow
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type,Authorization");

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader("Access-Control-Allow-Credentials", "true");

      // Pass to next layer of middleware
      next();
    })
    .use(morgan("dev"))
    .use(express.json())
    .use(v1);
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
    console.log(`Connecting to MongoDB...`);
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
