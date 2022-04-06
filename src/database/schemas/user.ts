import mongoose from "mongoose";
import { IBaseDocument } from "../DatabaseManager";
import { IMachine, machines } from "./machine";
import express from "express";
import { Validators } from "../../validators";
import bcrypt from "bcryptjs";
import { preSaveMiddleware } from "../middleware/preSave";

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

userSchema.set("toJSON", {
  virtuals: false,
  transform: (doc: any, ret: any, options: any) => {
    delete ret.__v;
    delete ret._id;
    delete ret.password;
    delete ret.email;
  },
});

userSchema.pre("save", preSaveMiddleware);

/// ------------------------------------------------------------------------------
/// ------- METHODS --------------------------------------------------------------
/// ------------------------------------------------------------------------------

export interface IUserMethods {
  compare_password: (a: string) => Promise<boolean>;
  update_avatar: (a: string) => Promise<IUser>;
  update_banner: (a: string) => Promise<IUser>;
  update_password: (a: UserPasswordUpdateInput) => Promise<IUser>;
  update_email: (a: string) => Promise<IUser>;
  update_username: (a: string) => Promise<IUser>;
  get_machines: () => Promise<IMachine[]>;
}

userSchema.methods = {
  compare_password: async function (this: IUser, candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password).catch(() => false);
  },

  update_avatar: async function (this: IUser, newAvatar: string): Promise<IUser> {
    this.avatar = newAvatar;
    return this.save();
  },

  update_banner: async function (this: IUser, newBanner: string): Promise<IUser> {
    this.banner = newBanner;
    return this.save();
  },

  get_machines: async function (this: IUser) {
    // return machines.find({ owner_uuid: this.uuid });
    // Temporary for now
    return machines.find({});
  },

  update_password: async function (this: IUser, form: UserPasswordUpdateInput): Promise<IUser> {
    if (!Validators.validate_password(form.current_password)) return Promise.reject("current.password.invalid");
    if (!Validators.validate_password(form.new_password)) return Promise.reject("new.password.invalid");
    if (!Validators.validate_password(form.new_password_repeat)) return Promise.reject("repeat.password.invalid");
    if (!(await this.compare_password(form.current_password))) return Promise.reject("password.invalid");
    if (form.new_password !== form.new_password_repeat) return Promise.reject("passwords.mismatch");

    this.password = form.new_password;
    return this.save();
  },
} as IUserMethods;

export const users = mongoose.model<IUser>("User", userSchema);

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

/**
 * Logged in requests that implement the user in the request
 */
export interface LoggedInRequest extends express.Request {
  params: any;
  user?: IUser;
}
