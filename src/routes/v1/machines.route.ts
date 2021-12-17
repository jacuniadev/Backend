import express, { Router } from "express";
import { MongoAPIError } from "mongodb";
import auth from "../../middleware/auth";
import { check2FAToken, create2FAToken, createMachine } from "../../services/machine.service";
import { getUser } from "../../services/user.service";
import { LoggedInRequest, UserObject } from "../../types/user";

export const machines: Router = express.Router();

machines.get<{}, { token: number } | { error: string }>("/@create", auth, (req: LoggedInRequest, res) =>
  res.json(create2FAToken(req.user!))
);

machines.post<{}, {}, { two_factor_key: string; hardware_uuid: string; hostname: string }>("/@create", async (req, res) => {
  const { two_factor_key, hardware_uuid, hostname } = req.body;
  const userUuid = check2FAToken(two_factor_key);
  if (!userUuid) return res.status(404).json({ error: "the 2fa token you provided has expired" });
  getUser({ uuid: userUuid })
    .then(
      (user) => {
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
      },
      (noUser) => res.status(404).json({ error: noUser })
    )
    .catch((reason) => res.status(400).json({ error: reason }));
});
