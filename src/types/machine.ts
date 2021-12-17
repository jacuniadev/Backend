import mongoose from "mongoose";
import { Request } from "express";
import { DatabaseObject } from "./database";

export interface StaticData {
  hostname: string;
  public_ip: string;
  kernel_version: string;
  os_name: string;
  os_arch: string;
  os_version: string;
  cpu_model: string;
  cpu_base_frequency: string;
  cpu_cores: number;
  cpu_threads: number;
  total_memory: number;
  last_sync: number;
}

export interface DynamicData {
  cpu: {
    usage: number[];
    freq: number[];
  };
  disks: Disk[];
  gpu?: GPU;
  processes: string;
  ram: { total: number; used: number };
}
export interface Disk {
  fs: string;
  mount: string;
  total: number;
  type: string;
  used: number;
}

export interface GPU {
  brand: string;
  gpu_usage: number;
  mem_total: number;
  mem_used: number;
  power_usage: number;
}

/**
 * Actual stonks 🥵
 */
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
