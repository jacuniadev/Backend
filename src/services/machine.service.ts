import { TokenManager } from "../classes/tokenManager";
import { UserDocument, UserObject } from "../types/user";

const tokenManager = new TokenManager();

export const createToken = (user: UserObject): { token: number } => {
  const token = TokenManager.generateToken();
  tokenManager.add(user.uuid, token);
  return { token };
};

export const checkToken = (token: string | number) =>
  tokenManager.validate(typeof token === "string" ? parseFloat(token) : token);
