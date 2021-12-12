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
});

userSchema.pre("save", async function (this: UserDocument, next) {
  if (!this.isModified) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(this.password, salt);
  this.password = hash;
  return next();
});

userSchema.methods.comparePassword = async function (comparisonPassword: string): Promise<boolean> {
  const user = this as UserDocument; // Cast for type safety
  return bcrypt.compare(comparisonPassword, user.password).catch(() => false);
};

export default mongoose.model<UserDocument>("User", userSchema);
