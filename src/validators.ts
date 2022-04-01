import Joi from "joi";

export class Validators {
  public static TRUSTED_IMAGE_HOSTERS = ["https://cdn.discordapp.com", "https://i.imgur.com"];
  public static ALLOWED_IMAGE_EXTENSIONS = ["png", "gif", "jpg", "jpeg", "webp"];

  public static validate_email = (email: string) =>
    Joi.string().email().not().empty().required().validate(email).error ? false : true;

  public static validate_password = (password: string) =>
    Joi.string().required().min(4).max(64).not().empty().validate(password).error ? false : true;

  public static validate_username = (username: string) =>
    Joi.string().required().min(4).max(32).alphanum().not().empty().validate(username).error ? false : true;

  public static validate_avatar_url = (url: string) => {
    if (!this.TRUSTED_IMAGE_HOSTERS.some((hoster) => url.startsWith(hoster))) return false;
    if (
      !this.ALLOWED_IMAGE_EXTENSIONS.some((ext) =>
        (url.includes("?") ? url.substring(0, url.lastIndexOf("?")) : url).endsWith(ext)
      )
    )
      return false;
    return Joi.string().uri().validate(url).error ? false : true;
  };

  public static validate_uuid = (uuid: string) => (Joi.string().required().uuid().validate(uuid).error ? false : true);

  public static validate_hostname = (hostname: string) =>
    Joi.string()
      .required()
      .pattern(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/)
      .max(253)
      .validate(hostname).error
      ? false
      : true;
}
