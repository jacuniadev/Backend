import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoServerError } from "mongodb";
import mongoose, { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { KeyManager } from "../classes/keyManager.class";
import { CreateMachineInput } from "../types/machine";
import { Logger } from "../utils/logger";
import { Validators } from "../validators";
import { machineSchema, userSchema } from "./schemas";

export const enum MachineStatus {
  Offline,
  Online,
}

export interface UserLoginInput {
  [key: string]: any;
  password: string; // The password of the user
  username: string; // The username of the user
}

export interface UserPasswordUpdateInput {
  [key: string]: any;
  current_password: string; // The current password of the user
  new_password: string; // The new password of the user
  new_password_repeat: string; // The new password of the user
}

/**
 * What the user signs up with
 */
export interface UserSignupInput extends UserLoginInput {
  [key: string]: any;
  email: string; // The email of the user
}

/**
 * The object the login/signup database statics return
 */
export type UserAuthResult = { user: IUser; token: string };

export interface IBaseDocument {
  uuid: string; // The unique identifier of the document
  created_at: number; // The time the document was created
  updated_at: number; // The time the document was last updated
}

/**
 * A user in the database with methods etc.
 */
export interface IUser extends ISafeUser, IUserMethods, mongoose.Document {
  password: string; // The user's hashed password
  email: string; // The email of the user
}

/**
 * The user object that will be sent through the internet
 * not containing the passwords and emails
 */
export interface ISafeUser extends IBaseDocument {
  avatar: string; // The avatar url of the user
  banner: string; // The avatar url of the user
  username: string; // The username of the user
}

/**
 * This is the safe object that will be sent through the API endpoints
 */
export interface ISafeMachine extends IBaseDocument {
  [key: string]: any;
  owner_uuid: string; // The uuid of the user that owns this machine
  hardware_uuid: string; // The generated uuid of the machine
  name: string; // The hostname of the machine
  description?: string; // A description of the machine
  status: MachineStatus; // Online offline etc.
  access: string[]; // The list of users that have access to this machine
  static_data: ISafeStaticData; // The static data of the machine
}

export interface IStaticData extends ISafeStaticData {
  city?: string; // The city of the machine (from the IP)
  public_ip?: string; // The public IP of the machine
}

export interface ISafeStaticData {
  hostname?: string; // The hostname of the machine
  os_version?: string; // The version number of the os
  os_name?: string; // Windows, Arch Linux, MacOS etc
  cpu_cores?: number; // The number of cores
  country?: string; // The country of the machine (from the IP)
  isp?: string; // The ISP of the machine (from the IP)
  timezone?: number; // The timezone of the machine (from the IP)
  cpu_model: string; // The CPU model of the machine
  cpu_threads: number; // The number of threads the CPU has
  total_mem: number; // The total memory of the machine
  reporter_version: string; // The version of the reporter
}

/**
 * The backend machine containing methods
 */
// prettier-ignore
export interface IMachine extends ISafeMachine, mongoose.Document {
  access_token: string;	// The access token (password) of the machine (used for authentication)
  static_data: IStaticData; // This overrides the static data from the extended interface with the non-safe verison
}

/**
 * A user's methods
 */
export interface IUserMethods {
  compare_password: (a: string) => Promise<boolean>;
  update_avatar: (a: string) => Promise<IUser>;
  update_banner: (a: string) => Promise<IUser>;
  update_password: (a: UserPasswordUpdateInput) => Promise<IUser>;
  update_email: (a: string) => Promise<IUser>;
  update_username: (a: string) => Promise<IUser>;
  get_machines: () => Promise<IMachine[]>;
}

/**
 * A machines's methods
 */
export interface IMachineMethods {
  update_static_data: (A: IStaticData) => Promise<IMachine>;
  delete: () => Promise<void>;
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
    this.register_schema_methods();

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
  private register_schema_methods() {
    this.register_user_schema_methods();
    this.register_machine_schema_methods();
  }

  /**
   * Assigns all the user methods
   */
  private register_user_schema_methods() {
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

  private register_machine_schema_methods() {
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

    const user = await this.find_user_by_username(username);

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

    const user = await this.find_user_by_username(username);

    if (user && (await user.compare_password(password))) {
      return this.users.deleteOne({ username: username });
    }
  }

  private async find_machine_by_field(field: string, value: string) {
    return (await this.machines.findOne({ [field]: value })) ?? Promise.reject("machine.notFound");
  }

  public async find_machine_by_uuid(uuid: string) {
    return this.find_machine_by_field("uuid", uuid);
  }

  public async find_machine_by_owner_uuid(owner_uuid: string) {
    return this.find_machine_by_field("owner_uuid", owner_uuid);
  }
  /**
   * Finds a user by the specified field name and value
   * @param field_name The field name to search by
   * @param field_value The value to search for
   * @returns The user object if found, null otherwise
   */
  private async find_user_by_field(field_name: string, field_value: string): Promise<IUser> {
    return (await this.users.findOne({ [field_name]: field_value })) ?? Promise.reject("user.notFound");
  }

  /**
   * Finds a user by the specified user UUID
   * @param uuid The user UUID to search for
   * @returns The user object if found, null otherwise
   */
  public async find_user_by_uuid(uuid: string): Promise<IUser> {
    return this.find_user_by_field("uuid", uuid);
  }

  /**
   * Finds a user by the specified username
   * @param username The username to search for
   * @returns The user object if found, null otherwise
   */
  public async find_user_by_username(username: string): Promise<IUser> {
    return this.find_user_by_field("username", username);
  }

  /**
   * Finds a user by the specified email
   * @param email The email to search for
   * @returns The user object if found, null otherwise
   */
  public async find_user_by_email(email: string): Promise<IUser> {
    return this.find_user_by_field("email", email);
  }
}
