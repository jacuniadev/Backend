// This is where all static functions for the database exist
// Instaed of defining them as a mongoose.static they are here
// for modularity

import User from "../models/user.model";
import { UserDocument, UserInput } from "../types/user";
import { FilterQuery } from "mongoose";
import Joi from "joi";

/**
 * Creates a new user in the database
 */
export const createUser = async (input: UserInput): Promise<UserDocument> => {
  if (Joi.string().email().not().empty().required().validate(input.email).error)
    return Promise.reject("invalid email provided");
  if (Joi.string().required().min(4).max(64).not().empty().validate(input.password).error)
    return Promise.reject("invalid password provided");
  if (Joi.string().required().min(4).max(32).alphanum().not().empty().validate(input.username).error)
    return Promise.reject("invalid username provided");

  return User.create<UserInput>(input);
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
export const loginUser = async ({ email, password }: { email: string; password: string }) => {
  const user = await getUser({ email });
  return user ? user.comparePassword(password) : new Error("User doesn't exist");
};

/**
 * Deletes all the users in the database
 */
export const deleteAllUsers = () => User.deleteMany({});
