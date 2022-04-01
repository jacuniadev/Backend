import mongoose from "mongoose";
import { DatabaseObject } from ".";

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
