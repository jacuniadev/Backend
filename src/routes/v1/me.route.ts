import express, { Router } from "express";
import auth from "../../middleware/auth";
import { LoggedInRequest, UserObject } from "../../types/user";

export const me: Router = express.Router();

me.get<{}, UserObject>("/", auth, (req: LoggedInRequest, res) => res.json(req.me));
