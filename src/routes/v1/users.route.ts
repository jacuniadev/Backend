import express, { Router } from "express";
import { createUser, deleteAllUsers, getUser, getUsers, loginUser } from "../../services/user.service";
import {
  UserSignupInput,
  LoggedInRequest,
  UserObject,
  UserLoginInput,
  UserLoginResultSafe,
  UserSignupResultSafe,
} from "../../types/user";
import auth from "../../middleware/auth";

export const users: Router = express.Router();

users.get<{}, UserObject>("/@me", auth, (req: LoggedInRequest, res) => res.json(req.me));

users.get<{}, UserObject[]>("/@all", async (req, res) => getUsers().then((users) => res.json(users)));

users.delete<{}, { message: string }>("/@all", async (req, res) =>
  deleteAllUsers().then(() => res.json({ message: "success" }))
);

users.post<{}, UserSignupResultSafe | { message: string }, UserSignupInput>("/@signup", async (req, res) =>
  createUser(req.body).then(
    (data) => res.status(201).json(data),
    (reason) => res.status(400).json({ message: reason })
  )
);

users.post<{}, UserLoginResultSafe | { message: string }, UserLoginInput>("/@login", async (req, res) =>
  loginUser(req.body).then(
    (data) => res.status(200).json(data),
    (reason) => res.status(400).json({ message: reason })
  )
);

users.get("/@search/:by/:query", async (req, res) =>
  getUser({ [req.params.by]: req.params.query }).then((user) =>
    user !== null ? res.json(user) : res.status(404).json({ message: "user not found" })
  )
);
