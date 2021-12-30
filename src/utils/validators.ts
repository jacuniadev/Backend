import Joi from "joi";

export const isValidEmail = (email: string) =>
  Joi.string().email().not().empty().required().validate(email).error ? false : true;

export const isValidPassword = (password: string) =>
  Joi.string().required().min(4).max(64).not().empty().validate(password).error ? false : true;

export const isValidUsername = (username: string) =>
  Joi.string().required().min(4).max(32).alphanum().not().empty().validate(username).error ? false : true;

export const isValidAvatarUrl = (url: string) => {
  const TRUSTED_HOSTERS = ["https://cdn.discordapp.com", "https://i.imgur.com"];
  const ALLOWED_EXTENSIONS = ["png", "gif", "jpg", "jpeg", "webp"];
  if (!TRUSTED_HOSTERS.some((hoster) => url.startsWith(hoster))) return false;
  if (!ALLOWED_EXTENSIONS.some((ext) => (url.includes("?") ? url.substring(0, url.lastIndexOf("?")) : url).endsWith(ext)))
    return false;
  return Joi.string().uri().validate(url).error ? false : true;
};

export const isValidUUID = (uuid: string) => (Joi.string().required().uuid().validate(uuid).error ? false : true);

export const isValidHostname = (hostname: string) =>
  Joi.string()
    .required()
    .pattern(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/)
    .max(253)
    .validate(hostname).error
    ? false
    : true;
