import mongoose from "mongoose";
import { IBaseDocument } from "../DatabaseManager";

export const machineSchema = new mongoose.Schema<IMachine, mongoose.Model<IMachine>, IMachineMethods>({
  uuid: {
    type: String,
    unique: true,
    index: true,
  },
  owner_uuid: {
    type: String,
    required: true,
    index: true,
  },
  access_token: {
    index: true,
    unique: true,
    required: true,
    type: String,
  },
  hardware_uuid: {
    index: true,
    unique: true,
    required: true,
    type: String,
  },
  created_at: {
    type: Number,
  },
  updated_at: {
    type: Number,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    required: true,
    default: MachineStatus.Offline,
  },
  icon: {
    type: String,
    required: false,
  },
  access: [String],
  static_data: {
    hostname: String,
    os_version: String,
    os_name: String,
    country: String,
    city: String,
    isp: String,
    timezone: Number,
    cpu_cores: Number,
    public_ip: String,
    cpu_model: String,
    cpu_threads: Number,
    total_mem: Number,
    reporter_version: String,
  },
});

/// ------------------------------------------------------------------------------
/// ------- INTERFACES -----------------------------------------------------------
/// ------------------------------------------------------------------------------

export const enum MachineStatus {
  Offline,
  Online,
}

/**
 * This is the safe object that will be sent through the API endpoints
 */
export interface ISafeMachine extends IBaseDocument {
  [key: string]: any;
  owner_uuid: string; // The uuid of the user that owns this machine
  hardware_uuid: string; // The generated uuid of the machine
  name: string; // The hostname of the machine
  description?: string; // A description of the machine
  status: MachineStatus; // Online offline etc.
  access: string[]; // The list of users that have access to this machine
  static_data: ISafeStaticData; // The static data of the machine
}

export interface IStaticData extends ISafeStaticData {
  city?: string; // The city of the machine (from the IP)
  public_ip?: string; // The public IP of the machine
}

export interface ISafeStaticData {
  hostname?: string; // The hostname of the machine
  os_version?: string; // The version number of the os
  os_name?: string; // Windows, Arch Linux, MacOS etc
  cpu_cores?: number; // The number of cores
  country?: string; // The country of the machine (from the IP)
  isp?: string; // The ISP of the machine (from the IP)
  timezone?: number; // The timezone of the machine (from the IP)
  cpu_model: string; // The CPU model of the machine
  cpu_threads: number; // The number of threads the CPU has
  total_mem: number; // The total memory of the machine
  reporter_version: string; // The version of the reporter
}

/**
 * The backend machine containing methods
 */
// prettier-ignore
export interface IMachine extends ISafeMachine, IMachineMethods, mongoose.Document {
  access_token: string;	// The access token (password) of the machine (used for authentication)
  static_data: IStaticData; // This overrides the static data from the extended interface with the non-safe verison
}

/**
 * A machines's methods
 */
export interface IMachineMethods {
  update_static_data: (A: IStaticData) => Promise<IMachine>;
}
