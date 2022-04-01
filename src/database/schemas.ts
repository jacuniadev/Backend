import mongoose from "mongoose";
import { IUser, IUserMethods } from "./DatabaseManager";

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
