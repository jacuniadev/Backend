import express, { Router } from "express";
import { machines } from "./machines.route";
import { users } from "./users.route";

export const v1: Router = express.Router();

const HELLO_WORLD = JSON.stringify({
  message: "Hello World",
});

v1.get("/", async (req, res) => res.send(HELLO_WORLD));
v1.use("/users", users);
v1.use("/machines", machines);
