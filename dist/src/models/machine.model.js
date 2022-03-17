"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const machineSchema = new mongoose_1.default.Schema({
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
        default: 0 /* Unknown */,
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
        cpu_cores: Number,
        public_ip: String,
        cpu_model: String,
        cpu_threads: Number,
        total_mem: Number,
        reporter_version: String,
        country: String,
    },
});
machineSchema.pre("save", async function (next) {
    if (this.isNew) {
        this.created_at = Date.now();
        this.uuid = (0, uuid_1.v4)();
    }
    // Other middleware functions go here
    this.updated_at = Date.now();
    return next();
});
machineSchema.methods.setStatus = async function (status) {
    this.status = status;
    return this.save();
};
// machineSchema.methods.updateStaticData = async function (this: MachineDocument, newValues: string): Promise<MachineDocument> {
//   this.password = newValue;
//   return this.save();
// };
exports.default = mongoose_1.default.model("Machine", machineSchema);
