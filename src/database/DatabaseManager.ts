import bcrypt from "bcryptjs";
import chalk from "chalk";
import jwt from "jsonwebtoken";
import { MongoServerError } from "mongodb";
import mongoose, { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { checkEnvironmentVariables } from "../logic";
import { Logger } from "../utils/logger";
import { Validators } from "../validators";
import { CreateMachineInput, IMachine, IStaticData, machines, machineSchema } from "./schemas/machine";
import { IUser, UserAuthResult, UserPasswordUpdateInput, users, userSchema, UserSignupInput } from "./schemas/user";

export interface IBaseDocument {
  uuid: string; // The unique identifier of the document
  created_at: number; // The time the document was created
  updated_at: number; // The time the document was last updated
}

/**
 * Database handler class
 * @class DatabaseManager
 */
export class DatabaseManager {
  private userSchema = userSchema;
  private machineSchema = machineSchema;
  public users: Model<IUser> = users;
  public machines: Model<IMachine> = machines;
  private app_name = process.env.APP_NAME!;

  private constructor() {
    this.check_process_variables();
    this.connect_database();
  }

  private check_process_variables() {
    checkEnvironmentVariables(["DB_PROTOCOL", "DB_HOST", "DB_NAME", "APP_NAME", "MODE"]);
  }

  /**
   * Creates a new database manager
   * @returns The new database manager
   */
  public static async new(): Promise<DatabaseManager> {
    const self = new this();
    return self;
  }

  /**
   * Creates the URL string for the database
   * @returns The URL for the database
   */
  private construct_database_url() {
    const { DB_PROTOCOL, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_NAME } = process.env;
    return `${DB_PROTOCOL}://${DB_USERNAME ? `${DB_USERNAME}:${DB_PASSWORD}@` : ""}${DB_HOST}/${DB_NAME}`;
  }

  /**
   * Connects to the MongoDB
   */
  public connect_database() {
    const DB_URL = this.construct_database_url();
    Logger.info(`Connecting to ${chalk.blue(DB_URL)}`);
    return mongoose
      .connect(DB_URL, { appName: this.app_name })
      .then(() => Logger.info(chalk.green("MongoDB Connected")))
      .catch((reason) => {
        Logger.error("MongoDB failed to connect, reason: ", reason);
        process.exit(1);
      });
  }

  private generate_access_token = () => `${uuidv4()}${uuidv4()}${uuidv4()}${uuidv4()}`.replace(/-/g, "");

  public async new_machine(input: CreateMachineInput) {
    if (!Validators.validate_uuid(input.hardware_uuid)) return Promise.reject("hardware_uuid is invalid");
    if (!Validators.validate_uuid(input.owner_uuid)) return Promise.reject("owner_uuid is invalid");
    if (!Validators.validate_hostname(input.hostname)) return Promise.reject("hostname is invalid");

    const access_token = this.generate_access_token();

    return this.machines.create({
      access_token,
      hardware_uuid: input.hardware_uuid,
      owner_uuid: input.owner_uuid,
      name: input.hostname,
    });
  }

  /**
   * Creates a new user in the database
   */
  public async new_user(form: UserSignupInput) {
    if (!Validators.validate_email(form.email)) return Promise.reject("email.invalid");
    if (!Validators.validate_password(form.password)) return Promise.reject("password.invalid");
    if (!Validators.validate_username(form.username)) return Promise.reject("username.invalid");

    try {
      const user = await this.users.create<UserSignupInput>(form);
      const token = jwt.sign(user.toObject(), process.env.JWT_SECRET!);
      return { user, token };
    } catch (error) {
      if (error instanceof MongoServerError) {
        switch (error.code) {
          case 11000:
            return Promise.reject("user.exists");
        }
      }
      return Promise.reject(error);
    }
  }

  /**
   * Attempts to login a user
   */
  public async login_user({ username, password }: { username: string; password: string }): Promise<UserAuthResult> {
    if (!Validators.validate_password(password)) return Promise.reject("password.invalid");
    if (!Validators.validate_username(username)) return Promise.reject("username.invalid");

    const user = await this.find_user({ username });

    if (user && (await user.compare_password(password))) {
      const token = jwt.sign(user.toObject(), process.env.JWT_SECRET!);
      return { user, token };
    }

    return Promise.reject("invalid credentials");
  }

  public async login_user_websocket(access_token: string) {
    return jwt.verify(access_token, process.env.JWT_SECRET!) as IUser;
  }

  public async login_machine(access_token: string) {
    const machine = await this.machines.findOne({ access_token });
    if (!machine) return Promise.reject("Invalid access token");
    return machine;
  }

  /**
   * Deletes a user by the specified username and password
   * @param username The username to search by
   * @param password The password for validation
   * @returns The deleted user
   */
  public async delete_user({ username, password }: { username: string; password: string }) {
    if (!Validators.validate_password(password)) return Promise.reject("password.invalid");
    if (!Validators.validate_username(username)) return Promise.reject("username.invalid");

    const user = await this.find_user({ username });
    if (user && (await user.compare_password(password))) this.users.deleteOne({ username: username });
  }

  private find_one = async <T>(collection: "machine" | "user", filter?: mongoose.FilterQuery<T>): Promise<T> => {
    switch (collection) {
      case "user":
        return (await this.users.findOne(filter)) ?? Promise.reject(`${collection}.notFound`);
      case "machine":
        return (await this.machines.findOne(filter)) ?? Promise.reject(`${collection}.notFound`);
    }
  };

  private find = async <T>(collection: "machine" | "user", filter: mongoose.FilterQuery<T>): Promise<T[]> => {
    switch (collection) {
      case "user":
        return (await this.users.find(filter)) ?? Promise.reject(`${collection}s.notFound`);
      case "machine":
        return (await this.machines.find(filter)) ?? Promise.reject(`${collection}s.notFound`);
    }
  };

  public find_machine = (filter?: mongoose.FilterQuery<IMachine>) => this.find_one<IMachine>("machine", filter);
  public find_user = (filter?: mongoose.FilterQuery<IUser>) => this.find_one<IUser>("user", filter);
  public find_machines = (filter: mongoose.FilterQuery<IMachine>) => this.find<IMachine>("machine", filter);
  public find_users = (filter: mongoose.FilterQuery<IUser>) => this.find<IUser>("user", filter);
}
