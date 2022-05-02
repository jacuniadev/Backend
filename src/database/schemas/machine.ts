import mongoose from "mongoose";
import { IBaseDocument } from "../DatabaseManager";
import { preSaveMiddleware } from "../middleware/preSave";

export enum MachineStatus {
  Offline,
  Online,
  Updating,
}

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
  last_update: {
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
    type: Number,
    required: true,
    default: MachineStatus.Offline,
  },
  icon: {
    type: String,
    required: false,
  },
  labels: {
    type: [String],
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

machineSchema.set("toJSON", {
  virtuals: false,
  transform: (doc: any, ret: any, options: any) => {
    delete ret.__v;
    delete ret._id;
    delete ret.access_token;
    delete ret.access;
    ret.static_data?.public_ip && delete ret.static_data.public_ip;
    ret.static_data?.city && delete ret.static_data.city;
  },
});

machineSchema.pre("save", preSaveMiddleware);

/// ------------------------------------------------------------------------------
/// ------- METHODS --------------------------------------------------------------
/// ------------------------------------------------------------------------------

export interface IMachineMethods {
  update_static_data: (staticData: IStaticData) => Promise<IMachine>;
  add_label: (uuid: string) => Promise<IMachine>;
  remove_label: (uuid: string) => Promise<IMachine>;
}

machineSchema.methods = {
  update_static_data: async function (this: IMachine, staticData: IStaticData) {
    this.static_data = staticData;
    return this.save();
  },
  add_label: async function (this: IMachine, uuid: string) {
    this.labels.addToSet(uuid);
    return this.save();
  },
  remove_label: async function (this: IMachine, uuid: string) {
    this.labels.pull(uuid);
    return this.save();
  },
} as IMachineMethods;

export const machines = mongoose.model<IMachine>("Machine", machineSchema);

/// ------------------------------------------------------------------------------
/// ------- INTERFACES -----------------------------------------------------------
/// ------------------------------------------------------------------------------

/**
 * This is the safe object that will be sent through the API endpoints
 */
export interface ISafeMachine extends IBaseDocument {
  [key: string]: any;
  owner_uuid: string; // The uuid of the user that owns this machine
  hardware_uuid: string; // The generated uuid of the machine
  name: string; // The hostname of the machine
  labels: mongoose.Types.Array<string>; // The labels of the machine
  description?: string; // A description of the machine
  access: string[]; // The list of users that have access to this machine
  status: MachineStatus;
  last_update: number;
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

export interface IDynamicData {
  cpu: ICPU;
  ram: IRAM;
  swap: ISwap;
  gpu?: IGPU;
  disks: IDisk[];
  process_count: number;
  temps?: ITemp[];
  network: INetwork[];
  host_uptime: number;
  reporter_uptime: number;
}

export interface INetwork {
  [x: string]: any;
  n: string; // name
  tx: number;
  rx: number;
  s: number; // speed
}

export interface ICPU {
  usage: number[];
  freq: number[];
}

export interface IRAM {
  total: number;
  used: number;
}

export type ISwap = IRAM;

export interface IGPU {
  brand: string;
  gpu_usage: number;
  power_usage: number;
}

export interface IDisk {
  fs: string;
  mount: string;
  total: number;
  type: string;
  used: number;
}

export interface ITemp {
  label: string;
  value: number;
}

export interface MachineSignupInput {
  two_factor_key: string;
  hardware_uuid: string;
  hostname: string;
}

export interface CreateMachineInput {
  hardware_uuid: string;
  owner_uuid: string;
  hostname: string;
}
