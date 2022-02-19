import express, { Router } from "express";
import { MongoAPIError } from "mongodb";
import auth from "../../middleware/auth";
import { check2FAKey, create2FAKey, createMachine, deleteMachine, getMachine } from "../../services/machine.service";
import { getUser } from "../../services/user.service";
import { MachineSignupInput } from "../../types/machine";
import { LoggedInRequest } from "../../types/user";
import { Validators } from "../../utils/validators";

export const machines: Router = express.Router();

machines.get<{}, { key: string; expiration: number } | { error: string }>("/@newkey", auth, (req: LoggedInRequest, res) =>
  res.json(create2FAKey(req.user!))
);

machines.post<{}, {}, MachineSignupInput>("/@signup", async (req, res) => {
  const { two_factor_key, hardware_uuid, hostname } = req.body;
  const userUuid = check2FAKey(two_factor_key);

  if (!userUuid) return res.status(403).json({ error: "the 2FA token you provided has expired" });
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

machines.delete("/:uuid", auth, async (req: LoggedInRequest, res) => {
  if (!Validators.validateUUID(req.params.uuid)) return res.status(400).json({ error: "uuid is invalid" });
  const machine = await getMachine(req.params.uuid);
  if (!machine) return res.status(404).json({ error: "machine not found" });
  if (machine.owner_uuid !== req.user!.uuid) return res.status(403).json({ error: "you are not the owner of this machine" });
  deleteMachine(req.params.uuid)
    .then(() => res.json({ message: "gon" }))
    .catch((error) => res.status(500).json({ error }));
});
