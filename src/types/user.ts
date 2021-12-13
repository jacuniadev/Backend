import mongoose from "mongoose";

/**
 * What the user signs up with
 */
export interface UserInput {
  [key: string]: any;
  password: string;
  email: string;
  username: string;
}

/**
 * This is the safe object that will be sent through the API endpoints
 */
export interface UserObject {
  [key: string]: any;
  created_at: number;
  updated_at: number;
  avatar?: string;
  biography?: string;
  email: string;
  username: string;
}

/**
 * The backend user containing methods
 */
// prettier-ignore
export interface UserDocument extends UserInput, UserObject, mongoose.Document {
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  updateAvatar:    (newValue: string)          => Promise<UserDocument>;
  updatePassword:  (newValue: string)          => Promise<UserDocument>;
  updateEmail:     (newValue: string)          => Promise<UserDocument>;
  updateUsername:  (newValue: string)          => Promise<UserDocument>;
  updateBiography: (newValue: string)          => Promise<UserDocument>;
}
