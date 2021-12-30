// This is where all static functions for the database exist
// Instaed of defining them as a mongoose.static they are here
// for modularity

import jwt from "jsonwebtoken";
import { MongoServerError } from "mongodb";
import { FilterQuery } from "mongoose";
import User from "../models/user.model";
import { UserDocument, UserLoginResult, UserObject, UserSignupInput, UserSignupResult } from "../types/user";
import { isValidEmail, isValidPassword, isValidUsername } from "../utils/validators";

/**
 * Creates a new user in the database
 */
export const createUser = async (input: UserSignupInput): Promise<UserSignupResult> => {
  if (!isValidEmail(input.email)) return Promise.reject("email doesn't meet complexity requirements");
  if (!isValidPassword(input.password)) return Promise.reject("password doesn't meet complexity requirements");
  if (!isValidUsername(input.username)) return Promise.reject("username doesn't meet complexity requirements");

  try {
    const user = await User.create<UserSignupInput>(input);
    const token = jwt.sign(user.toObject(), process.env.JWT_SECRET!);
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

export const loginWebsocketUser = async (access_token: string) => {
  return jwt.verify(access_token, process.env.JWT_SECRET!) as UserObject;
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
export const getUsers = (query: FilterQuery<UserDocument> = {}) => User.find(query, { _id: 0 });

/**
 * Attempts to login a user
 */
export const loginUser = async ({ username, password }: { username: string; password: string }): Promise<UserLoginResult> => {
  if (!isValidPassword(password)) return Promise.reject("password doesn't meet complexity requirements");
  if (!isValidUsername(username)) return Promise.reject("username doesn't meet complexity requirements");

  const user = await getUser({ username });

  if (user && (await user.comparePassword(password))) {
    const token = jwt.sign(user.toObject(), process.env.JWT_SECRET!);
    return { user, token };
  }

  return Promise.reject("invalid credentials");
};

/**
 * Deletes all the users in the database
 */
export const deleteAllUsers = () => User.deleteMany({});
