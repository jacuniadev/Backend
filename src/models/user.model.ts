import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { getMachines } from "../services/machine.service";
import { MachineDocument } from "../types/machine";
import { UserDocument } from "../types/user";

const userSchema = new mongoose.Schema({
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

userSchema.pre("save", async function (this: UserDocument, next) {
  if (this.isNew) {
    this.created_at = Date.now();
    this.uuid = uuidv4();
  }

  // Intercept the password save and hash it
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(process.env.MODE === "testing" ? 1 : 10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
  }

  this.updated_at = Date.now();

  return next();
});

userSchema.methods.comparePassword = async function (this: UserDocument, candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password).catch(() => false);
};

userSchema.methods.updateAvatar = async function (this: UserDocument, newValue: string): Promise<UserDocument> {
  this.avatar = newValue;
  return this.save();
};

userSchema.methods.updateBanner = async function (this: UserDocument, newValue: string): Promise<UserDocument> {
  this.banner = newValue;
  return this.save();
};

userSchema.methods.updatePassword = async function (this: UserDocument, newValue: string): Promise<UserDocument> {
  this.password = newValue;
  return this.save();
};

userSchema.methods.updateEmail = async function (this: UserDocument, newValue: string): Promise<UserDocument> {
  this.email = newValue;
  return this.save();
};

userSchema.methods.updateUsername = async function (this: UserDocument, newValue: string): Promise<UserDocument> {
  this.username = newValue;
  return this.save();
};

userSchema.methods.updateBiography = async function (this: UserDocument, newValue: string): Promise<UserDocument> {
  this.biography = newValue;
  return this.save();
};

userSchema.methods.updateClientSettings = async function (this: UserDocument, newValue: string): Promise<UserDocument> {
  this.client_settings = newValue;
  return this.save();
};

userSchema.methods.getMachines = async function (this: UserDocument): Promise<MachineDocument[]> {
  // return getMachines({ $or: [{ owner_uuid: this.uuid }, { access: this.uuid }] });
  return getMachines({});
};

export default mongoose.model<UserDocument>("User", userSchema);
