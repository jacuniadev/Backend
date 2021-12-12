import mongoose from "mongoose";

export interface UserInput {
  email: string;
  password: string;
  username: string;
}

// prettier-ignore
export interface UserDocument extends UserInput, mongoose.Document {
  created_at: number;
  updated_at: number;
  avatar?:    string;
  biography?: string;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  updateAvatar:    (newValue: string)          => Promise<UserDocument>;
  updatePassword:  (newValue: string)          => Promise<UserDocument>;
  updateEmail:     (newValue: string)          => Promise<UserDocument>;
  updateUsername:  (newValue: string)          => Promise<UserDocument>;
  updateBiography: (newValue: string)          => Promise<UserDocument>;
}
