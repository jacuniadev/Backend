import { Response, NextFunction } from "express";
import { LoggedInRequest } from "../database/schemas/user";

/**
 * The middleware that checks if the user is logged in
 */
export const adminMiddleware = async (req: LoggedInRequest, res: Response, next: NextFunction) => {
  req.user!.is_admin ? next() : res.status(403).send({ message: "you do not have permission to access this route" });
};
