import mongoose from "mongoose";
import { DatabaseObject } from ".";

export interface StaticData {
  total_mem: number;
  cpu_cores: number;
  cpu_threads: number;
  cpu_model: string;
  hostname: string;
  public_ip: string;
  os_version: string;
  // hostname: string;
  // public_ip: string;
  // kernel_version: string;
  // os_name: string;
  // os_arch: string;
  // os_version: string;
  // cpu_model: string;
  // cpu_base_frequency: string;
  // cpu_cores: number;
  // cpu_threads: number;
  // total_memory: number;
  // last_sync: number;
}

export interface DynamicData {
  cpu: ICPU;
  ram: IRAM;
  gpu?: IGPU;
  disks: IDisk[];
  processes: string;
  temps?: ITemp[];
  network: INetwork[];
}

export interface INetwork {
  [x: string]: any;
  name: string;
  tx: number;
  rx: number;
}

export interface ICPU {
  usage: number[];
  freq: number[];
}

export interface IRAM {
  total: number;
  used: number;
}

export interface IGPU {
  brand: string;
  gpu_usage: number;
  mem_total: number;
  mem_used: number;
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

export const enum MachineStatus {
  Unknown,
  Offline,
  Online,
}

export type MachineStatusStrings = keyof typeof MachineStatus;

/**
 * This is the safe object that will be sent through the API endpoints
 */
export interface MachineObject extends DatabaseObject {
  [key: string]: any;
  uuid: string;
  owner_uuid: string;
  hardware_uuid: string;
  created_at: number;
  updated_at: number;
  name: string;
  description?: string;
  status: MachineStatus;
  icon?: string;
  access: string[];
  static_data: StaticData;
}

/**
 * The backend machine containing methods
 */
// prettier-ignore
export interface MachineDocument extends MachineObject, mongoose.Document {
  access_token: string;
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
