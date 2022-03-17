"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const machine_service_1 = require("../services/machine.service");
const userSchema = new mongoose_1.default.Schema({
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
    biography: {
        type: String,
    },
    client_settings: {
        type: String,
    },
});
userSchema.pre("save", async function (next) {
    if (this.isNew) {
        this.created_at = Date.now();
        this.uuid = (0, uuid_1.v4)();
    }
    // Intercept the password save and hash it
    if (this.isModified("password")) {
        const salt = await bcrypt_1.default.genSalt(process.env.MODE === "testing" ? 1 : 10);
        const hash = await bcrypt_1.default.hash(this.password, salt);
        this.password = hash;
    }
    this.updated_at = Date.now();
    return next();
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt_1.default.compare(candidatePassword, this.password).catch(() => false);
};
userSchema.methods.updateAvatar = async function (newValue) {
    this.avatar = newValue;
    return this.save();
};
userSchema.methods.updateBanner = async function (newValue) {
    this.banner = newValue;
    return this.save();
};
userSchema.methods.updatePassword = async function (newValue) {
    this.password = newValue;
    return this.save();
};
userSchema.methods.updateEmail = async function (newValue) {
    this.email = newValue;
    return this.save();
};
userSchema.methods.updateUsername = async function (newValue) {
    this.username = newValue;
    return this.save();
};
userSchema.methods.updateBiography = async function (newValue) {
    this.biography = newValue;
    return this.save();
};
userSchema.methods.updateClientSettings = async function (newValue) {
    this.client_settings = newValue;
    return this.save();
};
userSchema.methods.getMachines = async function () {
    // return getMachines({ $or: [{ owner_uuid: this.uuid }, { access: this.uuid }] });
    return (0, machine_service_1.getMachines)({});
};
exports.default = mongoose_1.default.model("User", userSchema);
