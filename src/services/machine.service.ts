import { KeyManager } from "../classes/keyManager.class";
import Machine from "../models/machine.model";
import { UserObject } from "../types/user";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";
import { FilterQuery } from "mongoose";
import { CreateMachineInput, MachineDocument } from "../types/machine";
import { isHostnameValid, isUUIDValid } from "../utils/validators";

const keyManager = new KeyManager();

export const getMachines = (query: FilterQuery<MachineDocument> = {}) => Machine.find(query);

export const createMachine = async (input: CreateMachineInput) => {
  if (!isUUIDValid(input.hardware_uuid)) return Promise.reject("hardware_uuid is invalid");
  if (!isUUIDValid(input.owner_uuid)) return Promise.reject("owner_uuid is invalid");
  if (!isHostnameValid(input.hostname)) return Promise.reject("hostname is invalid");

  const access_token = jwt.sign(input.hardware_uuid, JWT_SECRET);
  return Machine.create({
    access_token,
    hardware_uuid: input.hardware_uuid,
    owner_uuid: input.owner_uuid,
    name: input.hostname,
  });
};

export const create2FAKey = (user: UserObject): { key: string } => {
  const key = keyManager.generateKey();
  keyManager.add(user.uuid, key);
  return { key };
};

export const check2FAKey = (key: string) => keyManager.validate(key);

export const deleteAllMachines = () => Machine.deleteMany({});
