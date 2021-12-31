import jwt from "jsonwebtoken";
import { FilterQuery } from "mongoose";
import { KeyManager } from "../classes/keyManager.class";
import Machine from "../models/machine.model";
import { Time } from "../types";
import { CreateMachineInput, MachineDocument } from "../types/machine";
import { UserObject } from "../types/user";
import { Validators } from "../utils/validators";

const keyManager = new KeyManager();

export const getMachines = (query: FilterQuery<MachineDocument> = {}) => Machine.find(query, { _id: 0 });

export const createMachine = async (input: CreateMachineInput) => {
  if (!Validators.validateUUID(input.hardware_uuid)) return Promise.reject("hardware_uuid is invalid");
  if (!Validators.validateUUID(input.owner_uuid)) return Promise.reject("owner_uuid is invalid");
  if (!Validators.validateHostname(input.hostname)) return Promise.reject("hostname is invalid");

  const access_token = jwt.sign(input, process.env.JWT_SECRET!, { expiresIn: "30d" });

  return Machine.create({
    access_token,
    hardware_uuid: input.hardware_uuid,
    owner_uuid: input.owner_uuid,
    name: input.hostname,
  });
};

/**
 * Attempts to login a machine
 */
export const loginMachine = async (access_token: string) => {
  try {
    const { hardware_uuid, owner_uuid } = jwt.verify(access_token, process.env.JWT_SECRET!) as CreateMachineInput;
    const machine = await Machine.findOne({ hardware_uuid, owner_uuid });
    if (!machine) return Promise.reject("invalid credentials");
    return machine;
  } catch (error) {
    return Promise.reject("invalid credentials");
  }
};

export const create2FAKey = (user: UserObject): { key: string; expiration: number } => {
  const key = keyManager.generateKey();
  keyManager.add(user.uuid, key);
  return { key, expiration: Date.now() + Time.Minute };
};

export const check2FAKey = (key: string) => keyManager.validate(key);

export const deleteAllMachines = () => Machine.deleteMany({});
