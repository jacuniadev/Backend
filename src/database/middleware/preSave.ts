import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { IBaseDocument } from "../DatabaseManager";

/**
 * This function updates the "updated_at" field automatically
 * whenever something changes on the database and it also will encrypt the
 * password of a user if it changes
 */
export const preSaveMiddleware = async function <
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
    const salt = await bcrypt.genSalt(process.env.MODE === "development" ? 1 : 10);
    const hash = await bcrypt.hash(this.password!, salt);
    this.password = hash;
  }

  this.updated_at = Date.now();

  return next();
};
