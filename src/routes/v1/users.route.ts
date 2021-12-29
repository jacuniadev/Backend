import express, { Router } from "express";
import auth from "../../middleware/auth";
import { createUser, deleteAllUsers, getUser, getUsers, loginUser } from "../../services/user.service";
import { MachineObject } from "../../types/machine";
import {
  LoggedInRequest,
  UserLoginInput,
  UserLoginResultSafe,
  UserObject,
  UserSignupInput,
  UserSignupResultSafe,
} from "../../types/user";

export function newUserBackend(): Router {
  const users: Router = express.Router();

  users.get<{}, UserObject>("/@me", auth, (req: LoggedInRequest, res) => res.json(req.user));

  users.get<{}, MachineObject[]>("/@me/machines", auth, (req: LoggedInRequest, res) =>
    req.user!.getMachines().then((machines) => res.json(machines))
  );

  users.get<{}, UserObject[]>("/@all", async (req, res) => getUsers().then((users) => res.json(users)));

  users.delete<{}, { message: string }>("/@all", async (req, res) =>
    deleteAllUsers().then(() => res.json({ message: "success" }))
  );

  users.post<{}, UserSignupResultSafe | { error: string }, UserSignupInput>("/@signup", async (req, res) =>
    createUser(req.body).then(
      (data) => res.status(201).json(data),
      (reason) => res.status(400).json({ error: reason })
    )
  );

  users.post<{}, UserLoginResultSafe | { error: string }, UserLoginInput>("/@login", async (req, res) =>
    loginUser(req.body).then(
      (data) => res.status(200).json(data),
      (reason) => res.status(400).json({ error: reason })
    )
  );

  users.get("/@search/:by/:query", async (req, res) =>
    getUser({ [req.params.by]: req.params.query }).then(
      (user) => res.json(user),
      (reason) => res.status(404).json({ error: "user not found" })
    )
  );

  return users;
}
