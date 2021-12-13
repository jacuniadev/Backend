import chalk from "chalk";

/**
 * Describe route
 */
export const d = (string: string): string => {
  if (string.includes("()")) return chalk.hex("#82AAFF")(string);

  return string
    .replace("GET", chalk.hex("#7D69CB")("GET"))
    .replace("POST", chalk.hex("#59A210")("POST"))
    .replace("PUT", chalk.hex("#D07502")("PUT"))
    .replace("PATCH", chalk.hex("#AE9602")("PATCH"))
    .replace("DELETE", chalk.hex("#D04444")("DELETE"));
};
