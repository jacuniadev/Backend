// This is where all static functions for the database exist
// Instaed of defining them as a mongoose.static they are here
// for modularity

import User from "../models/user.model";
import { UserDocument, UserObject, UserSignupInput } from "../types/user";
import { FilterQuery } from "mongoose";
import { isEmailValid, isPasswordValid, isUsernameValid } from "./validators.service";
import jwt from "jsonwebtoken";

/**
 * Creates a new user in the database
 */
export const createUser = async (input: UserSignupInput): Promise<UserDocument> => {
  if (!isEmailValid(input.email)) return Promise.reject("email doesn't meet complexity requirements");
  if (!isPasswordValid(input.password)) return Promise.reject("password doesn't meet complexity requirements");
  if (!isUsernameValid(input.username)) return Promise.reject("username doesn't meet complexity requirements");

  return User.create<UserSignupInput>(input);
};

/**
 * Searches for a user in the database
 */
export const getUser = (query: FilterQuery<UserDocument>) => User.findOne(query);

/**
 * Returns all the users in the database
 */
export const getUsers = () => User.find();

/**
 * Attempts to login a user
 */
export const loginUser = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<{ user: UserObject; token: string }> => {
  const user = await getUser({ username });
  if (!user) return Promise.reject("user doesn't exist");

  if (!isPasswordValid(password)) return Promise.reject("password doesn't meet complexity requirements");
  if (!isUsernameValid(username)) return Promise.reject("username doesn't meet complexity requirements");

  if (await user.comparePassword(password)) {
    const token = jwt.sign(user.toObject(), "asscheeks26");
    return { user, token };
  }

  return Promise.reject("user doesn't exist");
};

/**
 * Deletes all the users in the database
 */
export const deleteAllUsers = () => User.deleteMany({});
