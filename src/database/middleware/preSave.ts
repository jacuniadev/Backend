import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { randomHexColor } from "../../logic";
import { Validators } from "../../validators";
import { IBaseDocument } from "../DatabaseManager";
import { ILabel } from "../schemas/label";
import { IUser } from "../schemas/user";

export type PreSaveProps = {
  isNew: boolean;
  isModified: (a: string) => boolean;
};

export const preSaveMiddleware = async function <T extends IBaseDocument & PreSaveProps>(this: T, next: Function) {
  if (this.isNew) {
    this.created_at = Date.now();
    this.uuid = uuidv4();
  }
  this.updated_at = Date.now();
  return next();
};

export const userPreSaveMiddleware = async function <T extends IUser & PreSaveProps>(this: T, next: Function) {
  if (this.isNew) {
    if (!Validators.validate_email(this.email)) return next(new Error("invalid.email"));
    if (!Validators.validate_password(this.password)) return next(new Error("invalid.password"));
    if (!Validators.validate_username(this.username)) return next(new Error("invalid.username"));
  }

  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(process.env.MODE === "development" ? 1 : 10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
  }
  return next();
};

export const labelPreSaveMiddleware = async function <T extends ILabel & PreSaveProps>(this: T, next: Function) {
  if (this.isNew) {
    if (!this.color) this.color = randomHexColor();
  }

  if (this.isModified("color") && !Validators.validate_hex_color(this.color)) return next(new Error("Invalid color"));
  if (this.isModified("name") && !Validators.validate_label_name(this.name)) return next(new Error("Invalid name"));
  if (this.isModified("owner_uuid")) return next(new Error("Cannot change owner_uuid"));
  if (this.isModified("icon") && !Validators.validate_label_icon(this.icon)) return next(new Error("invalid.label.icon"));
  if (this.isModified("description") && !Validators.validate_label_description(this.description))
    return next(new Error("invalid.label.description"));

  this.name = this.name.toLowerCase().replace(/\s/g, "-");
  return next();
};
