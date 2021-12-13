import express, { Router } from "express";
import { me } from "./me.route";
import { users } from "./users.route";

export const v1: Router = express.Router();

v1.get("/", async (req, res) => res.json({ message: "Hello World" }));
v1.use("/@me", me);
v1.use("/users", users);
