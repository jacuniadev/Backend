import chalk from "chalk";
import osu from "node-os-utils";
import { INetwork } from "./database/schemas/machine";
import { Logger } from "./utils/logger";

export const VIRTUAL_INTERFACES = ["veth", "vcan", "vxlan", "docker0", "lo"];

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
    shard: process.env.SHARD_ID! || "solo",
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

export const isVirtualInterface = (iface: INetwork): Boolean => {
  for (let i = 0; i < VIRTUAL_INTERFACES.length; i++) {
    const prefixName = VIRTUAL_INTERFACES[i];
    return iface.n.startsWith(prefixName);
  }
  return false;
};

export const randomHexColor = () => {
  let color = "#";
  for (let i = 0; i < 3; i++) {
    color += ("0" + Math.round(((1 + Math.random()) * Math.pow(16, 2)) / 2).toString(16)).slice(-2);
  }
  return color;
};
