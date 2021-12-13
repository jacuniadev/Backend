import mongoose from "mongoose";

export interface UserLoginInput {
  [key: string]: any;
  password: string;
  username: string;
}

/**
 * What the user signs up with
 */
export interface UserSignupInput extends UserLoginInput {
  [key: string]: any;
  email: string;
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
 * The object the login/signup database statics return
 */
export type UserLoginResult = { user: UserDocument; token: string };
export type UserSignupResult = UserLoginResult;

/**
 * The object the login/signup routes return
 */
export type UserLoginResultSafe = { user: UserObject; token: string };
export type UserSignupResultSafe = UserLoginResultSafe;

/**
 * The backend user containing methods
 */
// prettier-ignore
export interface UserDocument extends UserSignupInput, UserObject, mongoose.Document {
  comparePassword: (candidatePassword: string) => Promise<boolean>;
  updateAvatar:    (newValue: string)          => Promise<UserDocument>;
  updatePassword:  (newValue: string)          => Promise<UserDocument>;
  updateEmail:     (newValue: string)          => Promise<UserDocument>;
  updateUsername:  (newValue: string)          => Promise<UserDocument>;
  updateBiography: (newValue: string)          => Promise<UserDocument>;
}
