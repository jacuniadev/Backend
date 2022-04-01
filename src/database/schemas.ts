import mongoose from "mongoose";
import { IMachine, IMachineMethods, IUser, IUserMethods, MachineStatus } from "./DatabaseManager";

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
