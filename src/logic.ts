import chalk from "chalk";
import osu from "node-os-utils";
import { Logger } from "./utils/logger";

/**
 * Gets the used/total heap in ram used
 */
export const getMemoryUsage = async () => {
  const mem = process.memoryUsage();
  return {
    used: mem.heapUsed / 1024 / 1024,
    total: mem.heapTotal / 1024 / 1024,
  };
};

export const getProcessorUsage = async () => {
  return osu.cpu.usage();
};

export const getServerMetrics = async () => {
  return {
    memory: await getMemoryUsage(),
    processor: await getProcessorUsage(),
    uptime: process.uptime(),
  };
};

export const checkEnvironmentVariables = (variables: string[]) => {
  for (let i = 0; i < variables.length; i++) {
    const variableName = variables[i];
    const variableValue = process.env[variableName];

    if (variableValue) {
      Logger.info(`Process variable ${chalk.cyan(variableName)}: ${variableValue}`);
    } else {
      Logger.error(`Process variable ${variableName} is undefined, please fix the .env`);
      process.exit(1);
    }
  }
};
