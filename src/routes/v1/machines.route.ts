import express, { Router } from "express";
import auth from "../../middleware/auth";
import { checkToken, createToken } from "../../services/machine.service";
import { getUser } from "../../services/user.service";
import { LoggedInRequest, UserObject } from "../../types/user";

export const machines: Router = express.Router();

machines.get<{}, { token: number } | { error: string }>("/@create", auth, (req: LoggedInRequest, res) =>
  res.json(createToken(req.user!))
);

machines.post<{ token: string }>("/@create/:token", async (req, res) => {
  const userUuid = checkToken(req.params.token);
  if (!userUuid) return Promise.reject("that token doesn't exist");
  getUser({ uuid: userUuid })
    .then((user) => (user !== null ? res.json(user) : res.status(404).json({ error: "user not found" })))
    .catch((reason) => res.status(400).json({ error: reason }));
});
