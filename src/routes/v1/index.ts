import express, { Router } from "express";
import { users } from "./users.route";
import { machines } from "./machines.route";

export const v1: Router = express.Router();

v1.get("/", async (req, res) => res.json({ message: "Hello World" }));
v1.use("/users", users);
v1.use("/machines", machines);
