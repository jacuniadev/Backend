import mongoose from "mongoose";
import { IBaseDocument } from "../DatabaseManager";
import { labelPreSaveMiddleware, preSaveMiddleware } from "../middleware/preSave";

export const labelSchema = new mongoose.Schema<ILabel, mongoose.Model<ILabel>, ILabelMethods>({
  uuid: {
    type: String,
    unique: true,
    index: true,
  },
  created_at: {
    type: Number,
  },
  updated_at: {
    type: Number,
  },
  name: {
    type: String,
    required: false,
    default: "label",
  },
  owner_uuid: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: false,
    default: "tag",
  },
  color: {
    type: String,
    required: false,
    default: "#00aaff",
  },
  description: {
    type: String,
    required: false,
  },
});

labelSchema.set("toJSON", {
  virtuals: false,
  transform: (doc: any, ret: any, options: any) => {
    delete ret.__v;
    delete ret._id;
  },
});

labelSchema.pre("save", preSaveMiddleware);
labelSchema.pre("save", labelPreSaveMiddleware);

export const labels = mongoose.model<ILabel>("Label", labelSchema);

/// ------------------------------------------------------------------------------
/// ------- METHODS --------------------------------------------------------------
/// ------------------------------------------------------------------------------

labelSchema.methods = {} as ILabelMethods;

/// ------------------------------------------------------------------------------
/// ------- INTERFACES -----------------------------------------------------------
/// ------------------------------------------------------------------------------

export interface ILabelMethods {}

export interface ILabel extends mongoose.Document {
  [key: string]: any;
  uuid: string;
  owner_uuid: string;
  name: string;
  color: string;
  icon: LabelIcon;
  description: string;
  created_at: number;
  updated_at: number;
}

export interface ICreateLabelInput {
  name: string;
  owner_uuid: string;
  color?: string;
  description?: string;
  icon?: LabelIcon;
}

export const LABEL_ICONS: LabelIcon[] = [
  "active-state",
  "admin",
  "area-chart",
  "at-sign",
  "back",
  "clock",
  "flask",
  "close",
  "color-palette",
  "command-palette",
  "computer",
  "country",
  "cube",
  "discord",
  "docker",
  "done",
  "down",
  "edit",
  "github",
  "happy-skull",
  "hdd",
  "home",
  "ipv6",
  "key",
  "lightning-bolt",
  "loading",
  "location",
  "logs",
  "maximize",
  "memory",
  "minimize",
  "name",
  "nas",
  "notes",
  "palette",
  "ping",
  "pirate-bay",
  "plus",
  "processes",
  "processor",
  "restart",
  "select-column",
  "services",
  "settings",
  "skull",
  "sound",
  "speedometer",
  "ssd",
  "status",
  "switch",
  "synchronize",
  "tag",
  "tasks",
  "temperature",
  "terminal",
  "thor-hammer",
  "trash",
  "unmaximize",
  "up",
  "upgrade",
  "flask",
  "user",
  "video-card",
  "zap",
];

export type LabelIcon =
  | "active-state"
  | "admin"
  | "area-chart"
  | "at-sign"
  | "back"
  | "flask"
  | "clock"
  | "close"
  | "color-palette"
  | "command-palette"
  | "computer"
  | "country"
  | "cube"
  | "discord"
  | "docker"
  | "done"
  | "down"
  | "edit"
  | "github"
  | "happy-skull"
  | "hdd"
  | "home"
  | "flask"
  | "ipv6"
  | "key"
  | "lightning-bolt"
  | "loading"
  | "location"
  | "logs"
  | "maximize"
  | "memory"
  | "minimize"
  | "name"
  | "nas"
  | "notes"
  | "palette"
  | "ping"
  | "pirate-bay"
  | "plus"
  | "processes"
  | "processor"
  | "restart"
  | "select-column"
  | "services"
  | "settings"
  | "skull"
  | "sound"
  | "speedometer"
  | "ssd"
  | "status"
  | "switch"
  | "synchronize"
  | "tag"
  | "tasks"
  | "temperature"
  | "terminal"
  | "thor-hammer"
  | "trash"
  | "unmaximize"
  | "up"
  | "upgrade"
  | "user"
  | "video-card"
  | "zap";
