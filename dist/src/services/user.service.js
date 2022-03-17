"use strict";
// This is where all static functions for the database exist
// Instaed of defining them as a mongoose.static they are here
// for modularity
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.deleteAllUsers = exports.loginUser = exports.getUsers = exports.getUser = exports.loginWebsocketUser = exports.createUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongodb_1 = require("mongodb");
const machine_model_1 = __importDefault(require("../models/machine.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const validators_1 = require("../utils/validators");
/**
 * Creates a new user in the database
 */
const createUser = async (input) => {
    if (!validators_1.Validators.validateEmail(input.email))
        return Promise.reject("email doesn't meet complexity requirements");
    if (!validators_1.Validators.validatePassword(input.password))
        return Promise.reject("password doesn't meet complexity requirements");
    if (!validators_1.Validators.validateUsername(input.username))
        return Promise.reject("username doesn't meet complexity requirements");
    try {
        const user = await user_model_1.default.create(input);
        const token = jsonwebtoken_1.default.sign(user.toObject(), process.env.JWT_SECRET);
        return { user, token };
    }
    catch (error) {
        if (error instanceof mongodb_1.MongoServerError) {
            switch (error.code) {
                case 11000:
                    return Promise.reject(`a user with this ${Object.keys(error.keyValue)[0].toLowerCase()} already exists`);
            }
        }
        return Promise.reject(error);
    }
};
exports.createUser = createUser;
const loginWebsocketUser = async (access_token) => {
    return jsonwebtoken_1.default.verify(access_token, process.env.JWT_SECRET);
};
exports.loginWebsocketUser = loginWebsocketUser;
/**
 * Searches for a user in the database
 */
const getUser = async (query) => {
    const user = await user_model_1.default.findOne(query);
    return user ? user : Promise.reject("user not found");
};
exports.getUser = getUser;
/**
 * Returns all the users in the database
 */
const getUsers = (query = {}) => user_model_1.default.find(query, { _id: 0 });
exports.getUsers = getUsers;
/**
 * Attempts to login a user
 */
const loginUser = async ({ username, password }) => {
    if (!validators_1.Validators.validatePassword(password))
        return Promise.reject("password doesn't meet complexity requirements");
    if (!validators_1.Validators.validateUsername(username))
        return Promise.reject("username doesn't meet complexity requirements");
    const user = await (0, exports.getUser)({ username });
    if (user && (await user.comparePassword(password))) {
        const token = jsonwebtoken_1.default.sign(user.toObject(), process.env.JWT_SECRET);
        return { user, token };
    }
    return Promise.reject("invalid credentials");
};
exports.loginUser = loginUser;
/**
 * Deletes all the users in the database
 */
const deleteAllUsers = () => user_model_1.default.deleteMany({});
exports.deleteAllUsers = deleteAllUsers;
const deleteUser = async (uuid) => {
    await user_model_1.default.deleteOne({ uuid: uuid });
    await machine_model_1.default.deleteMany({ owner_uuid: uuid });
};
exports.deleteUser = deleteUser;
