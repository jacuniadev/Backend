// This is where all static functions for the database exist
// Instaed of defining them as a mongoose.static they are here
// for modularity

import jwt from "jsonwebtoken";
import { MongoServerError } from "mongodb";
import { FilterQuery } from "mongoose";
import { JWT_SECRET } from "../constants";
import User from "../models/user.model";
import { UserDocument, UserLoginResult, UserSignupInput, UserSignupResult } from "../types/user";
import { isEmailValid, isPasswordValid, isUsernameValid } from "../utils/validators";

/**
 * Creates a new user in the database
 */
export const createUser = async (input: UserSignupInput): Promise<UserSignupResult> => {
  if (!isEmailValid(input.email)) return Promise.reject("email doesn't meet complexity requirements");
  if (!isPasswordValid(input.password)) return Promise.reject("password doesn't meet complexity requirements");
  if (!isUsernameValid(input.username)) return Promise.reject("username doesn't meet complexity requirements");

  try {
    const user = await User.create<UserSignupInput>(input);
    const token = jwt.sign(user.toObject(), JWT_SECRET);
    return { user, token };
  } catch (error) {
    if (error instanceof MongoServerError) {
      switch (error.code) {
        case 11000:
          return Promise.reject(`a user with this ${Object.keys(error.keyValue)[0].toLowerCase()} already exists`);
      }
    }
    return Promise.reject(error);
  }
};

/**
 * Searches for a user in the database
 */
export const getUser = async (query: FilterQuery<UserDocument>) => {
  const user = await User.findOne(query);
  return user ? user : Promise.reject("user not found");
};

/**
 * Returns all the users in the database
 */
export const getUsers = (query: FilterQuery<UserDocument> = {}) => User.find(query);

/**
 * Attempts to login a user
 */
export const loginUser = async ({ username, password }: { username: string; password: string }): Promise<UserLoginResult> => {
  console.log({ username });
  if (!isPasswordValid(password)) return Promise.reject("password doesn't meet complexity requirements");
  if (!isUsernameValid(username)) return Promise.reject("username doesn't meet complexity requirements");

  const user = await getUser({ username });

  if (user && (await user.comparePassword(password))) {
    const token = jwt.sign(user.toObject(), JWT_SECRET);
    return { user, token };
  }

  return Promise.reject("invalid credentials");
};

/**
 * Deletes all the users in the database
 */
export const deleteAllUsers = () => User.deleteMany({});
