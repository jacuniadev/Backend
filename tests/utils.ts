import chalk from "chalk";
import { describe as desc } from "mocha";
import "ts-mocha";

/**
 * Describe route
 */
export const colorizeKeywords = (string: string): string => {
  if (string.includes("()")) return chalk.hex("#82AAFF")(string);

  return string
    .replace("GET", chalk.hex("#7D69CB")("GET"))
    .replace("POST", chalk.hex("#59A210")("POST"))
    .replace("PUT", chalk.hex("#D07502")("PUT"))
    .replace("PATCH", chalk.hex("#AE9602")("PATCH"))
    .replace("DELETE", chalk.hex("#D04444")("DELETE"));
};

/**
 * Custom describe that simply adds colors to the title
 */
export const describe = (title: string, fn: (this: Mocha.Suite) => void) => desc(colorizeKeywords(title), fn);
