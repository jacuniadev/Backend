import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../constants";
import { getUser } from "../services/user.service";
import { LoggedInRequest, UserObject } from "../types/user";

export default async (req: LoggedInRequest, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    try {
      const payloadUser = jwt.verify(req.headers.authorization.replace("Bearer ", ""), JWT_SECRET) as UserObject;
      const user = await getUser({ _id: payloadUser._id });

      if (!user) return res.status(403).json({ message: "user not found" });
      req.user = user;
      return next();
    } catch (error) {
      return res.status(403).json({ message: "invalid authentication token" });
    }
  }
  return res.status(403).json({ message: "authorization header not set" });
};
