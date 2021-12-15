import { TokenManager } from "../classes/tokenManager.class";
import Machine from "../models/machine.model";
import { UserDocument, UserObject } from "../types/user";

const tokenManager = new TokenManager();

export const createMachine = async () => {
  // const user = await Machine.create<MachineInput>(input);
};

export const createToken = (user: UserObject): { token: number } => {
  const token = TokenManager.generateToken();
  tokenManager.add(user.uuid, token);
  return { token };
};

export const checkToken = (token: string | number) =>
  tokenManager.validate(typeof token === "string" ? parseFloat(token) : token);
