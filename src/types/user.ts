import mongoose from "mongoose";

export interface UserInput {
  email: string;
  password: string;
  username: string;
}

export interface UserDocument extends UserInput, mongoose.Document {
  created_at: number;
  comparePassword: (comparisonPassword: string) => Promise<boolean>;
}
