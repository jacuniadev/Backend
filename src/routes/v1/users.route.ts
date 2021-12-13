import express, { Router } from "express";
import { createUser, deleteAllUsers, getUsers } from "../../services/user.service";
import { UserInput, UserObject } from "../../types/user";

export const users: Router = express.Router();

users.get<{}, UserObject[]>("/@all", async (req, res) => {
  getUsers()
    .then((users) => res.json(users))
    .catch(() => res.status(500).send());
});

users.delete<{}, { message: string }>("/@all", async (req, res) => {
  deleteAllUsers()
    .then(() => res.json({ message: "success" }))
    .catch(() => res.status(500).send());
});

users.post<{}, UserObject, UserInput>("/signup", async (req, res) => {
  createUser(req.body)
    .then((user) => res.json(user))
    .catch(() => res.status(500).send());
});
