import express, { Router } from "express";
import { machines } from "./machines.route";
import { newUserBackend } from "./users.route";

export const v1: Router = express.Router();

v1.get("/", async (req, res) =>
  res.json({
    message: "Hello World",
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    cpu: process.cpuUsage(),
  })
);
v1.use("/users", newUserBackend());
v1.use("/machines", machines);
