import express, { Router } from "express";
import auth from "../../middleware/auth";
import { checkToken, createToken } from "../../services/machine.service";
import { getUser } from "../../services/user.service";
import { LoggedInRequest } from "../../types/user";

export const machines: Router = express.Router();

machines.get<{}, { token: number } | { error: string }>("/@create", auth, (req: LoggedInRequest, res) =>
  res.json(createToken(req.user!))
);

machines.post<{ token: string }, {}>("/@create/:token", async (req, res) => {
  const userUuid = checkToken(req.params.token);

  if (!userUuid) return Promise.reject("that token doesn't exist");

  const user = await getUser({ uuid: userUuid });

  console.log(user);

  res.send();
});
