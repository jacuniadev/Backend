import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoServerError } from "mongodb";
import mongoose, { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { CreateMachineInput } from "../types/machine";
import { Logger } from "../utils/logger";
import { Validators } from "../validators";
import { IMachine, IStaticData, machineSchema } from "./schemas/machine";
import { IUser, UserAuthResult, UserPasswordUpdateInput, userSchema, UserSignupInput } from "./schemas/user";

export interface IBaseDocument {
  uuid: string; // The unique identifier of the document
  created_at: number; // The time the document was created
  updated_at: number; // The time the document was last updated
}

/**
 * This function updates the "updated_at" field automatically
 * whenever something changes on the database and it also will encrypt the
 * password of a user if it changes
 */
const preSaveMiddleware = async function <
  T extends IBaseDocument & {
    isNew: boolean;
    isModified: (a: string) => boolean;
    password?: string; // question mark hack to avoid conflict with machineSchema
  }
>(this: T, next: Function) {
  if (this.isNew) {
    this.created_at = Date.now();
    this.uuid = uuidv4();
  }

  // Intercept the password save and hash it
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(process.env.MODE === "testing" ? 1 : 10);
    const hash = await bcrypt.hash(this.password!, salt);
    this.password = hash;
  }

  this.updated_at = Date.now();

  return next();
};

/**
 * Database handler class
 * @class DatabaseManager
 */
export class DatabaseManager {
  private userSchema = userSchema;
  private machineSchema = machineSchema;
  public users: Model<IUser>;
  public machines: Model<IMachine>;

  constructor(public database_url: string, public app_name: string, public database_name: string) {
    this.register_database_middleware();
    this.register_methods();

    this.users = mongoose.model<IUser>("User", this.userSchema);
    this.machines = mongoose.model<IMachine>("Machine", this.machineSchema);
  }

  /**
   * Registers the presave middleware to all the schemas
   */
  private register_database_middleware() {
    this.userSchema.pre("save", preSaveMiddleware);
    this.machineSchema.pre("save", preSaveMiddleware);
  }

  /**
   * Assigns all the methods to every schema
   */
  private register_methods() {
    this.register_user_methods();
    this.register_machine_methods();
  }

  /**
   * Assigns all the user methods
   */
  private register_user_methods() {
    // Local reference so 'this' doesn't conflict
    const machines = this.machines;

    this.userSchema.methods.compare_password = async function (this: IUser, candidatePassword: string): Promise<boolean> {
      return bcrypt.compare(candidatePassword, this.password).catch(() => false);
    };

    this.userSchema.methods.update_avatar = async function (this: IUser, newAvatar: string): Promise<IUser> {
      this.avatar = newAvatar;
      return this.save();
    };

    this.userSchema.methods.get_machines = async function (this: IUser) {
      return machines.find({ owner_uuid: this.uuid });
    };

    this.userSchema.methods.update_password = async function (this: IUser, form: UserPasswordUpdateInput): Promise<IUser> {
      if (!Validators.validate_password(form.current_password)) return Promise.reject("current.password.invalid");
      if (!Validators.validate_password(form.new_password)) return Promise.reject("new.password.invalid");
      if (!Validators.validate_password(form.new_password_repeat)) return Promise.reject("repeat.password.invalid");
      if (!(await this.compare_password(form.current_password))) return Promise.reject("password.invalid");
      if (form.new_password !== form.new_password_repeat) return Promise.reject("passwords.mismatch");

      this.password = form.new_password;
      return this.save();
    };

    this.userSchema.set("toJSON", {
      virtuals: false,
      transform: (doc: any, ret: any, options: any) => {
        delete ret.__v;
        delete ret._id;
        delete ret.password;
        delete ret.email;
      },
    });
  }

  private register_machine_methods() {
    this.machineSchema.methods.update_static_data = async function (this: IMachine, staticData: IStaticData) {
      this.static_data = staticData;
      return this.save();
    };

    this.machineSchema.methods.delete = async function (this: IMachine) {
      return this.delete();
    };

    this.machineSchema.set("toJSON", {
      virtuals: false,
      transform: (doc: any, ret: any, options: any) => {
        delete ret.__v;
        delete ret._id;
        delete ret.static_data.public_ip;
        delete ret.static_data.city;
        delete ret.access_token;
      },
    });
  }

  /**
   * Creates a new database manager
   * @param database_url The database servers url to connect to
   * @param app_name the name of the app for the mongodb client
   * @param database_name The name of the database to connect to
   * @returns The new database manager
   */
  public static async new(database_url: string, app_name: string, database_name: string): Promise<DatabaseManager> {
    const self = new this(database_url, app_name, database_name);
    return self;
  }

  /**
   * Creates the URL string for the database
   * @returns The URL for the database
   */
  private construct_database_url() {
    const { DATABASE_PROTOCOL, DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_NAME } = process.env;
    return `${DATABASE_PROTOCOL}://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`;
  }

  /**
   * Connects to the MongoDB
   */
  public async connect_database() {
    const DATABASE_URL = this.construct_database_url();
    Logger.info(`Connecting to ${DATABASE_URL}`);
    return mongoose
      .connect(DATABASE_URL, { appName: this.app_name })
      .then(() => Logger.info("MongoDB Connected"))
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

  private find_one = async <T>(collection: string, filter?: mongoose.FilterQuery<T>) =>
    (await (this as any)[collection].findOne(filter)) ?? Promise.reject(`${collection}.notFound`);

  private find = async <T>(collection: string, filter?: mongoose.FilterQuery<T>) =>
    (await (this as any)[collection].find(filter)) ?? Promise.reject(`${collection}s.notFound`);

  public find_machine = (filter?: mongoose.FilterQuery<IMachine>) => this.find_one("machine", filter);
  public find_user = (filter?: mongoose.FilterQuery<IUser>) => this.find_one("user", filter);
  public find_machines = (filter?: mongoose.FilterQuery<IMachine>) => this.find("machine", filter);
  public find_users = (filter?: mongoose.FilterQuery<IUser>) => this.find("user", filter);
}
