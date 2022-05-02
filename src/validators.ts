import Joi from "joi";
import { ICreateLabelInput, LabelIcon, LABEL_ICONS } from "./database/schemas/label";
import { randomHexColor } from "./logic";

export class Validators {
  public static TRUSTED_IMAGE_HOSTERS = [
    "cdn.discordapp.com",
    "media.discordapp.net",
    "i.imgur.com",
    "i.redd.it",
    "i.gyazo.com",
    "i.reddituploads.com",
  ];
  public static ALLOWED_IMAGE_EXTENSIONS = ["png", "gif", "jpg", "jpeg", "webp"];

  public static validate_label = (input: ICreateLabelInput) => {
    const color = input.color || randomHexColor();
    const name = input.name.toLowerCase().replace(/\s/g, "-");
    let error = undefined;

    if (!Validators.validate_uuid(input.owner_uuid)) error = "invalid.owner_uuid";
    if (input.name && !Validators.validate_label_name(name)) error = "invalid.label.name";
    if (color && !Validators.validate_hex_color(color)) error = "invalid.hex.color";
    if (input.icon && !Validators.validate_label_icon(input.icon)) error = "invalid.label.icon";
    if (input.description && !Validators.validate_label_description(input.description)) error = "invalid.label.description";

    return { color, name, error };
  };

  public static validate_url = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * @tested
   */
  public static validate_hex_color = (color: string) => {
    if (color === "") return true;
    const hex_regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hex_regex.test(color);
  };

  /**
   * @tested
   */
  public static validate_email = (email: string) =>
    Joi.string().email().not().empty().required().validate(email).error ? false : true;

  public static validate_password = (password: string) =>
    Joi.string().required().min(4).max(64).not().empty().validate(password).error ? false : true;

  public static validate_username = (username: string) =>
    Joi.string().required().min(4).max(32).alphanum().not().empty().validate(username).error ? false : true;

  public static validate_label_name = (label_name: string) =>
    Joi.string()
      .required()
      .min(3)
      .max(16)
      .pattern(/^[a-z0-9-_]+$/)
      .validate(label_name).error
      ? false
      : true;

  public static validate_label_icon = (label_icon: LabelIcon) => LABEL_ICONS.includes(label_icon);

  public static validate_label_description = (label_description: string) =>
    Joi.string().required().max(300).validate(label_description).error ? false : true;

  /**
   * @tested
   */
  public static validate_avatar_url = (url: string) => {
    // Check if the url is parsable
    if (!this.validate_url(url)) return false;
    const { protocol, hostname, pathname } = new URL(url);

    if (protocol !== "https:") return false;
    if (!this.TRUSTED_IMAGE_HOSTERS.some((hoster) => hostname === hoster)) return false;
    if (!this.ALLOWED_IMAGE_EXTENSIONS.some((ext) => pathname.endsWith(ext))) return false;
    return true;
  };

  /**
   * @tested
   */
  public static validate_uuid = (uuid: string) => (Joi.string().required().uuid().validate(uuid).error ? false : true);

  /**
   * @tested
   */
  public static validate_hostname = (hostname: string) =>
    Joi.string()
      .required()
      .pattern(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/)
      .max(253)
      .validate(hostname).error
      ? false
      : true;
}
