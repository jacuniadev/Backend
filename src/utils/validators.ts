import Joi from "joi";

export const isEmailValid = (email: string) =>
  Joi.string().email().not().empty().required().validate(email).error ? false : true;

export const isPasswordValid = (password: string) =>
  Joi.string().required().min(4).max(64).not().empty().validate(password).error ? false : true;

export const isUsernameValid = (username: string) =>
  Joi.string().required().min(4).max(32).alphanum().not().empty().validate(username).error ? false : true;

export const isUUIDValid = (uuid: string) => (Joi.string().required().uuid().validate(uuid).error ? false : true);

export const isHostnameValid = (hostname: string) =>
  Joi.string()
    .required()
    .pattern(/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/)
    .max(253)
    .validate(hostname).error
    ? false
    : true;
