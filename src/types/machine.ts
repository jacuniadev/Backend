import mongoose from "mongoose";
import { Request } from "express";
import { DatabaseObject } from "./database";

export interface MachineStaticData {
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
  created_at: number;
  updated_at: number;
  name: string;
  description?: string;
  status: MachineStatus;
  icon?: string;
  access: string[];
  static_data: MachineStaticData;
}

/**
 * The backend machine containing methods
 */
// prettier-ignore
export interface MachineDocument extends MachineObject, mongoose.Document {
  
}
