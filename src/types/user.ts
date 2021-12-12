import mongoose from "mongoose";

export interface UserInput {
  email: string;
  password: string;
  username: string;
}

// prettier-ignore
export interface UserDocument extends UserInput, mongoose.Document {
  created_at: number;
  avatar?: string;
  biography?: string;
  comparePassword: (newPassword: string) =>  Promise<boolean>;
  updateAvatar:    (url: string)         =>  Promise<UserDocument>;
  updatePassword:  (newPassword: string) =>  Promise<UserDocument>;
  updateEmail:     (newEmail: string)    =>  Promise<UserDocument>;
  updateUsername:  (newUsername: string) =>  Promise<UserDocument>;
  updateBiography: (newBiography: string) => Promise<UserDocument>;
}
