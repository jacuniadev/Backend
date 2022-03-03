import chalk from "chalk";
import { describe as desc } from "mocha";
import "ts-mocha";

/**
 * Describe route
 */
export const colorizeKeywords = (string: string): string => {
  if (string.includes("()")) return chalk.cyan(string) + chalk.gray(" (function)");

  return string
    .replace("GET", chalk.hex("#7D69CB")("GET"))
    .replace("POST", chalk.hex("#7D69CB")("POST"))
    .replace("PUT", chalk.hex("#7D69CB")("PUT"))
    .replace("PATCH", chalk.hex("#7D69CB")("PATCH"))
    .replace("DELETE", chalk.hex("#7D69CB")("DELETE"));
};

/**
 * Custom describe that simply adds colors to the title
 */
export const describe = (title: string, fn: (this: Mocha.Suite) => void) => desc(colorizeKeywords(title), fn);
