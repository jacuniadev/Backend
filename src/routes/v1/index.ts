import express, { Router } from "express";
import { users } from "./users.route";

export const v1: Router = express.Router();

v1.use("/users", users);

v1.get("/", async (req, res) => {
  res.json({ message: "Hello World" });
});
