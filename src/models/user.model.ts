import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { UserDocument } from "../types/user";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    index: true,
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
});

userSchema.pre("save", async function (this: UserDocument, next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  return next();
});

userSchema.methods.comparePassword = async function (this: UserDocument, newPassword: string): Promise<boolean> {
  return bcrypt.compare(newPassword, this.password).catch(() => false);
};

userSchema.methods.updateAvatar = async function (this: UserDocument, url: string): Promise<UserDocument> {
  this.avatar = url;
  return this.save();
};

userSchema.methods.updatePassword = async function (this: UserDocument, newPassword: string): Promise<UserDocument> {
  this.password = newPassword;
  return this.save();
};

userSchema.methods.updateEmail = async function (this: UserDocument, newEmail: string): Promise<UserDocument> {
  this.email = newEmail;
  return this.save();
};

userSchema.methods.updateUsername = async function (this: UserDocument, newUsername: string): Promise<UserDocument> {
  this.username = newUsername;
  return this.save();
};

export default mongoose.model<UserDocument>("User", userSchema);
