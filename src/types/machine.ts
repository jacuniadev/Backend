import mongoose from "mongoose";
import { DatabaseObject } from ".";

export interface StaticData {
  hostname?: string;
  os_version?: string;
  os_name?: string;
  cpu_cores?: number;
  public_ip?: string;
  cpu_model: string;
  cpu_threads: number;
  total_mem: number;
  reporter_version: string;
  country?: string;
}

export interface DynamicData {
  cpu: ICPU;
  ram: IRAM;
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
  name: string;
  tx: number;
  rx: number;
  speed: number;
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
