"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMachine = exports.deleteMachine = exports.deleteAllMachines = exports.check2FAKey = exports.create2FAKey = exports.loginMachine = exports.updateStaticData = exports.createMachine = exports.generateAccessToken = exports.getMachines = void 0;
const keyManager_class_1 = require("../classes/keyManager.class");
const machine_model_1 = __importDefault(require("../models/machine.model"));
const uuid_1 = require("uuid");
const validators_1 = require("../utils/validators");
const keyManager = new keyManager_class_1.KeyManager();
const getMachines = (query = {}) => machine_model_1.default.find(query, { _id: 0 });
exports.getMachines = getMachines;
const generateAccessToken = () => `${(0, uuid_1.v4)()}${(0, uuid_1.v4)()}${(0, uuid_1.v4)()}${(0, uuid_1.v4)()}`.replace(/-/g, "");
exports.generateAccessToken = generateAccessToken;
const createMachine = async (input) => {
    if (!validators_1.Validators.validateUUID(input.hardware_uuid))
        return Promise.reject("hardware_uuid is invalid");
    if (!validators_1.Validators.validateUUID(input.owner_uuid))
        return Promise.reject("owner_uuid is invalid");
    if (!validators_1.Validators.validateHostname(input.hostname))
        return Promise.reject("hostname is invalid");
    const access_token = (0, exports.generateAccessToken)();
    return machine_model_1.default.create({
        access_token,
        hardware_uuid: input.hardware_uuid,
        owner_uuid: input.owner_uuid,
        name: input.hostname,
    });
};
exports.createMachine = createMachine;
const updateStaticData = async (uuid, staticData) => {
    const machine = await machine_model_1.default.findOne({ uuid });
    if (!machine)
        return;
    machine.static_data = staticData;
    machine.save();
};
exports.updateStaticData = updateStaticData;
/**
 * Attempts to login a machine
 */
const loginMachine = async (access_token) => {
    try {
        const machine = await machine_model_1.default.findOne({ access_token });
        if (!machine)
            return Promise.reject("Invalid access token");
        return machine;
    }
    catch (error) {
        return Promise.reject("invalid credentials");
    }
};
exports.loginMachine = loginMachine;
const create2FAKey = (user) => {
    const key = keyManager.generateKey();
    keyManager.add(user.uuid, key);
    return { key, expiration: Date.now() + 60000 /* Minute */ };
};
exports.create2FAKey = create2FAKey;
const check2FAKey = (key) => keyManager.validate(key);
exports.check2FAKey = check2FAKey;
const deleteAllMachines = () => machine_model_1.default.deleteMany({});
exports.deleteAllMachines = deleteAllMachines;
const deleteMachine = async (uuid) => {
    const machine = await machine_model_1.default.findOne({ uuid });
    if (!machine)
        return;
    await machine_model_1.default.deleteOne({ uuid });
};
exports.deleteMachine = deleteMachine;
const getMachine = (uuid) => machine_model_1.default.findOne({ uuid });
exports.getMachine = getMachine;
