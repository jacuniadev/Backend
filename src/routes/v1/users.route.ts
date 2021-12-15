import express, { Router } from "express";
import { createUser, deleteAllUsers, getUser, getUsers, loginUser } from "../../services/user.service";
import {
  LoggedInRequest,
  UserSignupInput,
  UserObject,
  UserLoginInput,
  UserLoginResultSafe,
  UserSignupResultSafe,
} from "../../types/user";
import auth from "../../middleware/auth";

export const users: Router = express.Router();

users.get<{}, UserObject>("/@me", auth, (req: LoggedInRequest, res) => res.json(req.user));

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
  getUser({ [req.params.by]: req.params.query }).then((user) =>
    user !== null ? res.json(user) : res.status(404).json({ error: "user not found" })
  )
);
