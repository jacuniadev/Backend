import express, { Router } from "express";
import auth from "../../middleware/auth";
import { createUser, deleteAllUsers, getUser, getUsers, loginUser } from "../../services/user.service";
import { MachineDocument, MachineObject } from "../../types/machine";
import {
  LoggedInRequest,
  UserDocument,
  UserLoginInput,
  UserLoginResultSafe,
  UserObject,
  UserSignupInput,
  UserSignupResultSafe,
} from "../../types/user";

function cleanUser(user: UserDocument | UserObject): UserObject {
  user = user.toObject();
  user.password = undefined;
  // @ts-ignore
  user.email = undefined;
  user.__v = undefined;
  user._id = undefined;
  return user;
}

function cleanMachine(machine: MachineDocument | MachineObject): MachineObject {
  machine = machine.toObject();
  machine.access_token = undefined;
  machine.__v = undefined;
  machine._id = undefined;
  return machine;
}

export function newUserBackend(): Router {
  const users: Router = express.Router();

  users.get<{}, UserObject>("/@me", auth, (req: LoggedInRequest, res) => res.json(cleanUser(req.user!)));

  users.get<{ uuid: string }, UserObject>("/:uuid", auth, async (req: LoggedInRequest, res) =>
    res.json(cleanUser(await getUser({ uuid: req.params.uuid })))
  );

  users.get<{}, MachineObject[]>("/@me/machines", auth, (req: LoggedInRequest, res) =>
    req.user!.getMachines().then((machines) => res.json(machines.map((machine) => cleanMachine(machine))))
  );

  users.get<{}, UserObject[]>("/@all", async (req, res) =>
    getUsers().then((users) => res.json(users.map((user) => cleanUser(user))))
  );

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
      ({ user, token }) => res.status(200).json({ user: cleanUser(user), token }),
      (reason) => res.status(400).json({ error: reason })
    )
  );

  users.get("/@search/:by/:query", async (req, res) =>
    getUser({ [req.params.by]: req.params.query }).then(
      (user) => res.json(cleanUser(user)),
      (reason) => res.status(404).json({ error: "user not found" })
    )
  );

  return users;
}
