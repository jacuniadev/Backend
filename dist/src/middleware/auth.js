"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_service_1 = require("../services/user.service");
exports.default = async (req, res, next) => {
    if (req.headers.authorization) {
        try {
            const payloadUser = jsonwebtoken_1.default.verify(req.headers.authorization.replace("Bearer ", ""), process.env.JWT_SECRET);
            const user = await (0, user_service_1.getUser)({ _id: payloadUser._id });
            if (!user)
                return res.status(403).json({ message: "user not found" });
            req.user = user;
            return next();
        }
        catch (error) {
            return res.status(403).json({ message: "invalid authentication token" });
        }
    }
    return res.status(403).json({ message: "authorization header not set" });
};
