import express, { Router } from "express";
import { MongoAPIError } from "mongodb";
import auth from "../../middleware/auth";
import { check2FAKey, create2FAKey, createMachine } from "../../services/machine.service";
import { getUser } from "../../services/user.service";
import { MachineSignupInput } from "../../types/machine";
import { LoggedInRequest } from "../../types/user";

export const machines: Router = express.Router();

machines.get<{}, { key: string } | { error: string }>("/@newkey", auth, (req: LoggedInRequest, res) =>
  res.json(create2FAKey(req.user!))
);

machines.post<{}, {}, MachineSignupInput>("/@signup", async (req, res) => {
  const { two_factor_key, hardware_uuid, hostname } = req.body;
  const userUuid = check2FAKey(two_factor_key);
  if (!userUuid) return res.status(404).json({ error: "the 2fa token you provided has expired" });
  getUser({ uuid: userUuid })
    .then((user) => {
      createMachine({ owner_uuid: user.uuid, hardware_uuid, hostname })
        .then((machine) => res.json({ access_token: machine.access_token }))
        .catch((error: MongoAPIError) => {
          switch (error.code) {
            case 11000:
              res.status(400).json({ error: "this machine is already registered in the database" });
              break;
            default:
              res.status(500).json({ error });
              break;
          }
        });
    })
    .catch((error) => res.status(404).json({ error }));
});
