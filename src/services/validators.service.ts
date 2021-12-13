import Joi from "joi";

export const isEmailValid = (email: string) =>
  Joi.string().email().not().empty().required().validate(email).error ? false : true;

export const isPasswordValid = (password: string) =>
  Joi.string().required().min(4).max(64).not().empty().validate(password).error ? false : true;

export const isUsernameValid = (username: string) =>
  Joi.string().required().min(4).max(32).alphanum().not().empty().validate(username).error ? false : true;
