import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { DatabaseManager } from "../database/DatabaseManager";
import { IUser, LoggedInRequest } from "../database/schemas/user";

/**
 * The middleware that checks if the user is logged in
 */
export const init_auth = (db: DatabaseManager) => {
  return async (req: LoggedInRequest, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      try {
        const { uuid, username, password } = jwt.verify(
          req.headers.authorization.replace("Bearer ", ""),
          process.env.JWT_SECRET!
        ) as IUser;
        const user = await db.users.findOne({ uuid, username, password });
        if (!user) return res.status(403).json({ message: "user not found" });
        req.user = user;
        return next();
      } catch (error) {
        return res.status(403).json({ message: "invalid authentication token" });
      }
    }
    return res.status(403).json({ message: "authorization header not set" });
  };
};
