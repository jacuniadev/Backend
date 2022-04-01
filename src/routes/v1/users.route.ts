import express, { Router } from "express";
import { DatabaseManager, ISafeMachine, ISafeUser } from "../../database/DatabaseManager";
import auth from "../../middleware/auth";
import { LoggedInRequest, UserLoginInput, UserLoginResultSafe, UserSignupInput, UserSignupResultSafe } from "../../types/user";
import { Validators } from "../../validators";

export const generate_users_route = (db: DatabaseManager): Router => {
  const router: Router = express.Router();

  router.get<{}, ISafeUser>("/@me", auth, (req: LoggedInRequest, res) => req.user!.toJSON());

  router.delete<{}, ISafeUser>("/@me", auth, (req: LoggedInRequest, res) =>
    req
      .user!.delete()
      .then(() => res.send())
      .catch(() => res.status(500).send())
  );

  router.get<{}, ISafeMachine[]>("/@me/machines", auth, (req: LoggedInRequest, res) =>
    req.user!.get_machines().then((machines) => res.send(machines.map((machine) => machine.toJSON())))
  );

  router.get<{ uuid: string }, ISafeUser>("/:uuid", auth, async (req: LoggedInRequest, res) =>
    (await db.find_user_by_uuid(req.params.uuid)).toJSON()
  );

  router.patch<{}, ISafeUser | { error: string }, { url: string }>("/@avatar", auth, (req: LoggedInRequest, res) =>
    Validators.validate_avatar_url(req.body.url)
      ? req.user!.update_avatar(req.body.url).then((user) => res.send(user.toJSON()))
      : res.status(400).json({ error: "invalid url" })
  );

  router.patch<{}, ISafeUser | { error: string }, { url: string }>("/@banner", auth, (req: LoggedInRequest, res) =>
    Validators.validate_avatar_url(req.body.url)
      ? req.user!.update_banner(req.body.url).then((user) => res.send(user.toJSON()))
      : res.status(400).json({ error: "invalid url" })
  );

  router.post<{}, UserSignupResultSafe | { error: string }, UserSignupInput>("/@signup", async (req, res) =>
    db.new_user(req.body).then(
      ({ user, token }) => res.status(201).json({ user: user.toJSON(), token }),
      (reason) => res.status(400).json({ error: reason })
    )
  );

  router.post<{}, UserLoginResultSafe | { error: string }, UserLoginInput>("/@login", async (req, res) =>
    db.login_user(req.body).then(
      ({ user, token }) => res.status(200).json({ user: user.toJSON(), token }),
      (reason) => res.status(400).json({ error: reason })
    )
  );

  return router;
};
