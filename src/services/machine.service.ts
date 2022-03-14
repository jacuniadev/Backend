import jwt from "jsonwebtoken";
import { FilterQuery } from "mongoose";
import { KeyManager } from "../classes/keyManager.class";
import Machine from "../models/machine.model";
import { Time } from "../types";
import { CreateMachineInput, MachineDocument, StaticData } from "../types/machine";
import { UserObject } from "../types/user";
import { v4 as uuidv4 } from "uuid";
import { Validators } from "../utils/validators";

const keyManager = new KeyManager();

export const getMachines = (query: FilterQuery<MachineDocument> = {}) => Machine.find(query, { _id: 0 });

export const generateAccessToken = () => `${uuidv4()}${uuidv4()}${uuidv4()}${uuidv4()}`.replace(/-/g, "");

export const createMachine = async (input: CreateMachineInput) => {
  if (!Validators.validateUUID(input.hardware_uuid)) return Promise.reject("hardware_uuid is invalid");
  if (!Validators.validateUUID(input.owner_uuid)) return Promise.reject("owner_uuid is invalid");
  if (!Validators.validateHostname(input.hostname)) return Promise.reject("hostname is invalid");

  const access_token = generateAccessToken();

  return Machine.create({
    access_token,
    hardware_uuid: input.hardware_uuid,
    owner_uuid: input.owner_uuid,
    name: input.hostname,
  });
};

export const updateStaticData = async (uuid: string, staticData: StaticData) => {
  const machine = await Machine.findOne({ uuid });
  if (!machine) return;
  machine.static_data = staticData;
  machine.save();
};

/**
 * Attempts to login a machine
 */
export const loginMachine = async (access_token: string) => {
  try {
    const machine = await Machine.findOne({ access_token });
    if (!machine) return Promise.reject("Invalid access token");
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

export const deleteMachine = async (uuid: string) => {
  const machine = await Machine.findOne({ uuid });
  if (!machine) return;
  await Machine.deleteOne({ uuid });
};

export const getMachine = (uuid: string) => Machine.findOne({ uuid });
