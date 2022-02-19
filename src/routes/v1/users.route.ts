import express, { Router } from "express";
import auth from "../../middleware/auth";
import { createUser, getUser, getUsers, loginUser } from "../../services/user.service";
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
import { Validators } from "../../utils/validators";

function cleanUser(user: UserDocument | UserObject): UserObject {
  user = user.toObject();
  user.password = undefined;
  // @ts-ignore
  user.email = undefined;
  user.__v = undefined;
  user._id = undefined;
  return user;
}

function cleanMachine(machine: MachineDocument | MachineObject, userID: string): MachineObject {
  machine = machine.toObject();
  machine.access_token = undefined;
  machine.__v = undefined;
  machine._id = undefined;
  machine.static_data && machine.owner_uuid !== userID && (machine.static_data.public_ip = undefined);
  return machine;
}

export const users: Router = express.Router();

users.get<{}, UserObject>("/@me", auth, (req: LoggedInRequest, res) => res.json(cleanUser(req.user!)));

users.get<{}, string>("/@settings", auth, (req: LoggedInRequest, res) => res.send(JSON.stringify(req.user!.client_settings)));

users.patch<{}, {}, string>("/@settings", auth, async (req: LoggedInRequest, res) =>
  res.send((await req.user!.updateClientSettings(JSON.stringify(req.body))).client_settings)
);

users.get<{}, UserObject[]>("/@all", async (req, res) =>
  getUsers().then((users) => res.json(users.map((user) => cleanUser(user))))
);

users.get<{}, MachineObject[]>("/@me/machines", auth, (req: LoggedInRequest, res) =>
  req.user!.getMachines().then((machines) => res.json(machines.map((machine) => cleanMachine(machine, req.user!.uuid))))
);

users.get<{ uuid: string }, UserObject>("/:uuid", auth, async (req: LoggedInRequest, res) =>
  res.json(cleanUser(await getUser({ uuid: req.params.uuid })))
);

users.patch<{}, UserObject | { error: string }, { url: string }>("/@avatar", auth, (req: LoggedInRequest, res) =>
  Validators.validateAvatarUrl(req.body.url)
    ? req.user!.updateAvatar(req.body.url).then((user) => res.json(cleanUser(user)))
    : res.status(400).json({ error: "invalid url" })
);

users.post<{}, UserSignupResultSafe | { error: string }, UserSignupInput>("/@signup", async (req, res) =>
  createUser(req.body).then(
    ({ user, token }) => res.status(201).json({ user: cleanUser(user), token }),
    (reason) => res.status(400).json({ error: reason })
  )
);

users.post<{}, UserLoginResultSafe | { error: string }, UserLoginInput>("/@login", async (req, res) =>
  loginUser(req.body).then(
    ({ user, token }) => res.status(200).json({ user: cleanUser(user), token }),
    (reason) => res.status(400).json({ error: reason })
  )
);
