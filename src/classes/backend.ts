import express, { Express } from "express";
import http from "http";
import cors from "cors";
import { v1 } from "../routes/v1";
import mongoose from "mongoose";

const MONGO_DEFAULT_URI: string = "mongodb://localhost/xornet";

export class Backend {
  public express: Express = express().use(express.json()).use(v1);
  public server = http.createServer(this.express);

  private constructor(public PORT: number = 8081) {}

  public static async create(PORT: number = 8081) {
    const server = new this(PORT);
    await server.connectDatabase();
    server.listen();
    return server;
  }

  private async connectDatabase(mongoUrl: string = MONGO_DEFAULT_URI) {
    return mongoose
      .connect(mongoUrl, { appName: "Xornet Backend" })
      .then(() => console.log("MongoDB Connected"))
      .catch((reason) => {
        console.log("MongoDB failed to connect, reason: ", reason);
        process.exit(1);
      });
  }

  private listen() {
    this.server.listen(this.PORT, () => console.log(`[INDEX] Started on port ${this.PORT.toString()}`));
  }
}
