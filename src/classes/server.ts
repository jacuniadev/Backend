import express, { Express, Router, Response, Request } from "express";
import http from "http";
import { v1 } from "../routes/v1";
import { getUsers } from "../services/user.service";

export class Server {
  public PORT: number = 8081;
  public express: Express = express().use(v1);
  public server = http
    .createServer(this.express)
    .listen(this.PORT, () => console.log(`[INDEX] Started on port ${this.PORT.toString()}`));
}
