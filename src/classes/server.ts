import express, { Express, Router, Response, Request } from "express";
import http from "http";
import { v1 } from "../routes/v1";

export class Server {
  public express: Express = express().use(express.json()).use(v1);
  public server = http
    .createServer(this.express)
    .listen(this.PORT, () => console.log(`[INDEX] Started on port ${this.PORT.toString()}`));

  constructor(public PORT: number = 8081) {}
}
