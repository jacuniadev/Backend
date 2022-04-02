import { Request } from "express";
import { IUser, ISafeUser } from "../database/schemas/user";

export interface UserLoginInput {
  [key: string]: any;
  password: string;
  username: string;
}

/**
 * What the user signs up with
 */
export interface UserSignupInput extends UserLoginInput {
  [key: string]: any;
  email: string;
}

/**
 * The object the login/signup database statics return
 */
export type UserLoginResult = { user: IUser; token: string };
export type UserSignupResult = UserLoginResult;

/**
 * The object the login/signup routes return
 */
export type UserLoginResultSafe = { user: ISafeUser; token: string };
export type UserSignupResultSafe = UserLoginResultSafe;

/**
 * Logged in requests that implement the user in the request
 */
export interface LoggedInRequest extends Request {
  params: any;
  user?: IUser;
}
