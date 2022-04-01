import chalk from "chalk";
import express, { NextFunction } from "express";
import { Logger } from "../utils/logger";

export default async function (req: express.Request, res: express.Response, next: NextFunction) {
  const startedAt = process.hrtime();
  next();
  const elapsed = process.hrtime(startedAt);
  const ms = elapsed[0] * 1e3 + elapsed[1] * 1e-6;

  Logger.info(
    `${req.method} ${req.originalUrl || req.url} ${ms.toFixed(2)}ms ${chalk.gray(
      `-- ${req.headers["cf-connecting-ip"] || "0.0.0.0"}`
    )}`
  );
}
