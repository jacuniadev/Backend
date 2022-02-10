import { Request } from "express";
import mongoose from "mongoose";
import { DatabaseObject } from ".";
import { MachineDocument } from "./machine";

export interface UserLoginInput {
  [key: string]: any;
  password: string;
  username: string;
}

export interface UserClientSettings {
  general: {
    opacity: number;
    theme: string;
    enable_bloom: boolean;
    enable_rounded_corners: boolean;
    enable_sound_effects: boolean;
    enable_status_bar: boolean;
    show_offline_machines: boolean;
    show_owned_machines_only: boolean;
  };
  columns: {
    [key: string]: boolean;
    hostname: boolean;
    cpu_average_usage: boolean;
    cpu_average_speed: boolean;
    ram_usage: boolean;
    gpu_usage: boolean;
    gpu_power_usage: boolean;
    network_switch: boolean;
    download: boolean;
    upload: boolean;
    temperature: boolean;
    country: boolean;
    public_ip: boolean;
    process_count: boolean;
    host_uptime: boolean;
    reporter_uptime: boolean;
    reporter_version: boolean;
    owner: boolean;
    action: boolean;
  };
}

/**
 * What the user signs up with
 */
export interface UserSignupInput extends UserLoginInput {
  [key: string]: any;
  email: string;
}

/**
 * This is the safe object that will be sent through the API endpoints
 */
export interface UserObject extends DatabaseObject {
  [key: string]: any;
  avatar?: string;
  biography?: string;
  email: string;
  client_settings: UserClientSettings;
  username: string;
}

/**
 * The object the login/signup database statics return
 */
export type UserLoginResult = { user: UserDocument; token: string };
export type UserSignupResult = UserLoginResult;

/**
 * The object the login/signup routes return
 */
export type UserLoginResultSafe = { user: UserObject; token: string };
export type UserSignupResultSafe = UserLoginResultSafe;

/**
 * Logged in requests that implement the user in the request
 */
export interface LoggedInRequest extends Request {
  params: any;
  user?: UserDocument;
}

/**
 * The backend user containing methods
 */
// prettier-ignore
export interface UserDocument extends UserSignupInput, UserObject, mongoose.Document {
  comparePassword:      (candidatePassword: string)    => Promise<boolean>;
  updateAvatar:         (newValue: string)             => Promise<UserDocument>;
  updatePassword:       (newValue: string)             => Promise<UserDocument>;
  updateEmail:          (newValue: string)             => Promise<UserDocument>;
  updateUsername:       (newValue: string)             => Promise<UserDocument>;
  updateBiography:      (newValue: string)             => Promise<UserDocument>;
  updateClientSettings: (newValue: string)             => Promise<UserDocument>;

  // Machine related stuff
  createAccessToken:    (hardwareUUID: string)         => Promise<string>;
  getMachines:          ()                             => Promise<MachineDocument[]>;
}
