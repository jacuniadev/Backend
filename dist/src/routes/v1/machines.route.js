"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.machines = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const machine_service_1 = require("../../services/machine.service");
const user_service_1 = require("../../services/user.service");
const validators_1 = require("../../utils/validators");
exports.machines = express_1.default.Router();
exports.machines.get("/@newkey", auth_1.default, (req, res) => res.json((0, machine_service_1.create2FAKey)(req.user)));
exports.machines.post("/@signup", async (req, res) => {
    const { two_factor_key, hardware_uuid, hostname } = req.body;
    const userUuid = (0, machine_service_1.check2FAKey)(two_factor_key);
    if (!userUuid)
        return res.status(403).json({ error: "the 2FA token you provided has expired" });
    (0, user_service_1.getUser)({ uuid: userUuid })
        .then((user) => {
        (0, machine_service_1.createMachine)({ owner_uuid: user.uuid, hardware_uuid, hostname })
            .then((machine) => res.json({ access_token: machine.access_token }))
            .catch((error) => {
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
exports.machines.delete("/:uuid", auth_1.default, async (req, res) => {
    if (!validators_1.Validators.validateUUID(req.params.uuid))
        return res.status(400).json({ error: "uuid is invalid" });
    const machine = await (0, machine_service_1.getMachine)(req.params.uuid);
    if (!machine)
        return res.status(404).json({ error: "machine not found" });
    if (machine.owner_uuid !== req.user.uuid)
        return res.status(403).json({ error: "you are not the owner of this machine" });
    (0, machine_service_1.deleteMachine)(req.params.uuid)
        .then(() => res.json({ message: "gon" }))
        .catch((error) => res.status(500).json({ error }));
});
