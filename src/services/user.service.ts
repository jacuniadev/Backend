import User from "../models/user.model";
import { UserDocument, UserInput } from "../types/user";
import { FilterQuery } from "mongoose";

/**
 * Creates a new user in the database
 */
export const createUser = (input: UserInput): Promise<UserDocument> => User.create<UserInput>(input);

/**
 * Searches for a user in the database
 */
export const findUser = (query: FilterQuery<UserDocument>) => User.findOne(query);

/**
 * Attempts to login a user
 */
export const loginUser = async ({ email, password }: { email: string; password: string }) => {
  const user = await findUser({ email });
  return user ? user.comparePassword(password) : new Error("User doesn't exist");
};

/**
 * Deletes all the users in the database
 */
export const deleteAllUsers = () => User.deleteMany({});
