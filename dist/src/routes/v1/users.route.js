"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const user_service_1 = require("../../services/user.service");
const validators_1 = require("../../utils/validators");
function cleanUser(user) {
    user = user.toObject();
    user.password = undefined;
    // @ts-ignore
    user.email = undefined;
    user.__v = undefined;
    user._id = undefined;
    return user;
}
function cleanMachine(machine, userID) {
    machine = machine.toObject();
    machine.access_token = undefined;
    machine.__v = undefined;
    machine._id = undefined;
    machine.static_data && machine.owner_uuid !== userID && (machine.static_data.public_ip = undefined);
    return machine;
}
exports.users = express_1.default.Router();
exports.users.get("/@me", auth_1.default, (req, res) => res.json(cleanUser(req.user)));
exports.users.delete("/@me", auth_1.default, (req, res) => (0, user_service_1.deleteUser)(req.user.uuid)
    .then(() => res.send())
    .catch(() => res.status(500).send()));
exports.users.get("/@settings", auth_1.default, (req, res) => res.send(JSON.stringify(req.user.client_settings)));
exports.users.patch("/@settings", auth_1.default, async (req, res) => res.send((await req.user.updateClientSettings(JSON.stringify(req.body))).client_settings));
exports.users.get("/@all", async (req, res) => (0, user_service_1.getUsers)().then((users) => res.json(users.map((user) => cleanUser(user)))));
exports.users.get("/@me/machines", auth_1.default, (req, res) => req.user.getMachines().then((machines) => res.json(machines.map((machine) => cleanMachine(machine, req.user.uuid)))));
exports.users.get("/:uuid", auth_1.default, async (req, res) => res.json(cleanUser(await (0, user_service_1.getUser)({ uuid: req.params.uuid }))));
exports.users.patch("/@avatar", auth_1.default, (req, res) => validators_1.Validators.validateAvatarUrl(req.body.url)
    ? req.user.updateAvatar(req.body.url).then((user) => res.json(cleanUser(user)))
    : res.status(400).json({ error: "invalid url" }));
exports.users.patch("/@banner", auth_1.default, (req, res) => validators_1.Validators.validateAvatarUrl(req.body.url)
    ? req.user.updateBanner(req.body.url).then((user) => res.json(cleanUser(user)))
    : res.status(400).json({ error: "invalid url" }));
exports.users.post("/@signup", async (req, res) => (0, user_service_1.createUser)(req.body).then(({ user, token }) => res.status(201).json({ user: cleanUser(user), token }), (reason) => res.status(400).json({ error: reason })));
exports.users.post("/@login", async (req, res) => (0, user_service_1.loginUser)(req.body).then(({ user, token }) => res.status(200).json({ user: cleanUser(user), token }), (reason) => res.status(400).json({ error: reason })));
