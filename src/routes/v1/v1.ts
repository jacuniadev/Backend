import express, { Router } from "express";
import { MongoAPIError } from "mongodb";
import { KeyManager } from "../../classes/keyManager.class";
import { DatabaseManager } from "../../database/DatabaseManager";
import { ICreateLabelInput, ICreateLabelInput, ILabel, labels } from "../../database/schemas/label";
import { LoggedInRequest } from "../../database/schemas/user";
import { getServerMetrics } from "../../logic";
import { adminMiddleware } from "../../middleware/admin";
import { init_auth } from "../../middleware/auth";
import { redisPublisher } from "../../redis";
import { Validators } from "../../validators";

export class V1 {
  private static HELLO_WORLD = JSON.stringify({ message: "Hello World" });
  private auth = init_auth(this.db);
  public router: Router = express.Router();
  public keyManager = new KeyManager();

  public constructor(public db: DatabaseManager) {
    this.router.get("/", (_, res) => res.send(V1.HELLO_WORLD));
    this.router.get("/ping", (_, res) => res.send());
    this.router.get("/status", async (_, res) => res.json(await getServerMetrics()));
    this.router.use("/users", this.generate_user_routes());
    this.router.use("/labels", this.generate_label_routes());
    this.router.use("/machines", this.generate_machine_routes());
  }

  private generate_user_routes() {
    return express
      .Router()
      .get("/@me", this.auth, (req: LoggedInRequest, res) => res.send(req.user!))
      .get("/@me/logins", this.auth, (req: LoggedInRequest, res) => res.json(req.user!.login_history))
      .delete("/@me", this.auth, async (req: LoggedInRequest, res) => {
        try {
          const machines = await this.db.find_machines({ owner_uuid: req.user!.uuid });
          const labels = await this.db.find_labels({ owner_uuid: req.user!.uuid });

          await req.user!.delete();
          await Promise.all(machines.map((machine) => machine.delete()));
          await Promise.all(labels.map((label) => label.delete()));

          res.send({ message: "deleted user" });
        } catch (error) {
          res.status(500).json(error);
        }
      })
      .get("/@me/machines", this.auth, (req: LoggedInRequest, res) => {
        req.user!.get_machines().then((machines) => res.send(machines));
      })
      .get("/all", this.auth, adminMiddleware, (req, res) => {
        this.db
          .find_users({})
          .then((users) => res.send(users.map((user) => user.toJSON({ transform: false }))))
          .catch((error) => res.status(500).send(error));
      })
      .delete("/:uuid", this.auth, adminMiddleware, async (req: LoggedInRequest, res) => {
        try {
          const user = await this.db.find_user({ uuid: req.params.uuid });
          const machines = await this.db.find_machines({ owner_uuid: user.uuid });
          const labels = await this.db.find_labels({ owner_uuid: user.uuid });

          await user.delete();
          await Promise.all(machines.map((machine) => machine.delete()));
          await Promise.all(labels.map((label) => label.delete()));

          res.send({ message: "deleted user" });
        } catch (error) {
          res.status(500).json(error);
        }
      })
      .get("/:uuid", this.auth, async (req: LoggedInRequest, res) =>
        this.db
          .find_user({ uuid: req.params.uuid })
          .then((user) => res.send(user))
          .catch((error) => res.status(404).json({ error }))
      )
      .get("/:uuid/machines", this.auth, (req: LoggedInRequest, res) => {
        this.db
          .find_user({ uuid: req.params.uuid })
          .then((user) => user.get_machines(true))
          .then((machines) => res.send(machines))
          .catch((error) => res.status(500).json(error));
      })
      .patch("/@avatar", this.auth, (req: LoggedInRequest, res) => {
        Validators.validate_avatar_url(req.body.url)
          ? req.user!.update_avatar(req.body.url).then((user) => res.send(user))
          : res.status(400).json({ error: "invalid url" });
      })
      .patch("/@banner", this.auth, (req: LoggedInRequest, res) =>
        Validators.validate_avatar_url(req.body.url)
          ? req.user!.update_banner(req.body.url).then((user) => res.send(user))
          : res.status(400).json({ error: "invalid url" })
      )
      .post("/@signup", async (req, res) =>
        this.db.new_user(req.body, req.headers).then(
          ({ user, token }) => res.status(201).json({ user: user, token }),
          (reason) => res.status(400).json({ error: reason })
        )
      )
      .post("/@login", async (req, res) =>
        this.db.login_user(req.body, req.headers).then(
          ({ user, token }) => res.status(200).json({ user: user, token }),
          (reason) => res.status(400).json({ error: reason })
        )
      );
  }

  private generate_label_routes() {
    return express
      .Router()
      .get("/all", this.auth, async (req: LoggedInRequest, res) =>
        this.db
          .find_labels({ owner_uuid: req.user!.uuid })
          .then((labels) => res.send(labels))
          .catch((error) => res.status(404).json(error))
      )
      .get("/admin/all", this.auth, adminMiddleware, async (req: LoggedInRequest, res) =>
        this.db
          .find_labels({})
          .then((labels) => res.send(labels))
          .catch((error) => res.status(404).json(error))
      )
      .get("/:uuid", this.auth, async (req: LoggedInRequest, res) =>
        this.db
          .find_label({ uuid: req.params.uuid })
          .then((label) => res.send(label))
          .catch((error) => res.status(404).json(error))
      )
      .delete("/:uuid", this.auth, async (req: LoggedInRequest, res) =>
        this.db
          .find_label({ uuid: req.params.uuid, owner_uuid: req.user!.uuid })
          .then(async (label) => {
            const machines = await this.db.find_machines({ labels: label.uuid });
            await Promise.all(machines.map((machine) => machine.remove_label(label.uuid)));
            return label.delete();
          })
          .then(() => res.send({ message: "deleted label" }))
          .catch((error) => res.status(403).json(error))
      )
      .patch<{}, {}, ICreateLabelInput>("/:uuid", this.auth, async (req: LoggedInRequest, res) =>
        this.db
          .find_label({ uuid: req.params.uuid, owner_uuid: req.user!.uuid })
          .then((label) => label.update(req.body))
          .catch((error) => res.status(403).json(error))
          .then((label) => res.json(label))
      )
      .post("/new", this.auth, (req: LoggedInRequest, res) => {
        this.db
          .new_label({ ...req.body, owner_uuid: req.user!.uuid })
          .then((label) => res.status(201).json(label))
          .catch((error) => res.status(400).json(error));
      });
  }

  private generate_machine_routes() {
    return express
      .Router()
      .get("/@newkey", this.auth, (req: LoggedInRequest, res) => res.json(this.keyManager.createNewKey(req.user!.uuid)))
      .post("/@signup", async (req, res) => {
        const { two_factor_key, hardware_uuid, hostname } = req.body;
        const userUuid = this.keyManager.validate(two_factor_key);

        if (!userUuid) return res.status(403).json({ error: "the 2FA token you provided has expired" });
        this.db
          .find_user({ uuid: userUuid })
          .then((user) => {
            this.db
              .new_machine({ owner_uuid: user.uuid, hardware_uuid, hostname })
              .then((machine) => {
                // broadcast to everyone
                // TODO: probably move this redis line somewhere else
                redisPublisher.publish("machine-added", JSON.stringify(machine));
                res.json({ access_token: machine.access_token });
              })
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
      })
      .post("/label/:machine_uuid/:label_uuid", this.auth, (req: LoggedInRequest, res) => {
        this.db
          .find_machine({ uuid: req.params.machine_uuid })
          .then((machine) => {
            this.db
              .find_label({ uuid: req.params.label_uuid })
              .then((label) => {
                if (machine.owner_uuid !== label.owner_uuid)
                  return Promise.reject({ error: "you are not allowed to add this label to this machine" });
                return machine.add_label(label.uuid);
              })
              .catch((e) => res.status(403).json(e))
              .then(() => res.send({ message: "label added" }))
              .catch((error) => res.status(404).json(error));
          })
          .catch((error) => res.status(404).json(error));
      })
      .delete("/label/:machine_uuid/:label_uuid", this.auth, (req: LoggedInRequest, res) => {
        this.db
          .find_machine({ uuid: req.params.machine_uuid })
          .then((machine) => {
            this.db
              .find_label({ uuid: req.params.label_uuid })
              .then((label) => {
                if (machine.owner_uuid !== label.owner_uuid)
                  return Promise.reject({ error: "you are not allowed to remove this label from this machine" });
                return machine.remove_label(label.uuid);
              })
              .catch((e) => res.status(403).json(e))
              .then(() => res.send({ message: "label removed" }))
              .catch((error) => res.status(404).json(error));
          })
          .catch((error) => res.status(404).json(error));
      })
      .delete("/:uuid", this.auth, async (req: LoggedInRequest, res) => {
        if (!Validators.validate_uuid(req.params.uuid)) return res.status(400).json({ error: "uuid is invalid" });
        const machine = await this.db.find_machine({ uuid: req.params.uuid });
        if (!machine) return res.status(404).json({ error: "machine not found" });
        if (machine.owner_uuid !== req.user!.uuid)
          return res.status(403).json({ error: "you are not the owner of this machine" });
        machine
          .delete()
          .then(() => res.json({ message: "gon" }))
          .catch((error: any) => res.status(500).json({ error }));
      });
  }
}
