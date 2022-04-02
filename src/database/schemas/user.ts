import mongoose from "mongoose";
import { IBaseDocument } from "../DatabaseManager";
import { IMachine } from "./machine";

export const userSchema = new mongoose.Schema<IUser, mongoose.Model<IUser>, IUserMethods>({
  uuid: {
    type: String,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  created_at: {
    type: Number,
  },
  updated_at: {
    type: Number,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  banner: {
    type: String,
  },
});

/// ------------------------------------------------------------------------------
/// ------- INTERFACES -----------------------------------------------------------
/// ------------------------------------------------------------------------------

/**
 * A user in the database with methods etc.
 */
export interface IUser extends ISafeUser, IUserMethods, mongoose.Document {
  password: string; // The user's hashed password
  email: string; // The email of the user
}

/**
 * A user's methods
 */
export interface IUserMethods {
  compare_password: (a: string) => Promise<boolean>;
  update_avatar: (a: string) => Promise<IUser>;
  update_banner: (a: string) => Promise<IUser>;
  update_password: (a: UserPasswordUpdateInput) => Promise<IUser>;
  update_email: (a: string) => Promise<IUser>;
  update_username: (a: string) => Promise<IUser>;
  get_machines: () => Promise<IMachine[]>;
}

/**
 * The user object that will be sent through the internet
 * not containing the passwords and emails
 */
export interface ISafeUser extends IBaseDocument {
  avatar: string; // The avatar url of the user
  banner: string; // The avatar url of the user
  username: string; // The username of the user
}

export interface UserLoginInput {
  [key: string]: any;
  password: string; // The password of the user
  username: string; // The username of the user
}

export interface UserPasswordUpdateInput {
  [key: string]: any;
  current_password: string; // The current password of the user
  new_password: string; // The new password of the user
  new_password_repeat: string; // The new password of the user
}

/**
 * What the user signs up with
 */
export interface UserSignupInput extends UserLoginInput {
  [key: string]: any;
  email: string; // The email of the user
}

/**
 * The object the login/signup database statics return
 */
export type UserAuthResult = { user: IUser; token: string };
