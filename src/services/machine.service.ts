import { TokenManager } from "../classes/tokenManager.class";
import Machine from "../models/machine.model";
import { UserDocument, UserObject } from "../types/user";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";

export interface CreateMachineInput {
  hardware_uuid: string;
  owner_uuid: string;
  hostname: string;
}

const tokenManager = new TokenManager();

export const createMachine = async (input: CreateMachineInput) => {
  const access_token = jwt.sign(input.hardware_uuid, JWT_SECRET);
  return Machine.create({
    access_token,
    hardware_uuid: input.hardware_uuid,
    owner_uuid: input.owner_uuid,
    name: input.hostname,
  });
};

export const create2FAToken = (user: UserObject): { token: number } => {
  const token = TokenManager.generateToken();
  tokenManager.add(user.uuid, token);
  return { token };
};

export const check2FAToken = (token: string | number) =>
  tokenManager.validate(typeof token === "string" ? parseFloat(token) : token);
