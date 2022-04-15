import axios from "axios";
import chalk from "chalk";
import osu from "node-os-utils";
import { IGeolocation, IGeolocationExtras, INetwork } from "./database/schemas/machine";
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

export const getGeolocation = async (ip: string): Promise<IGeolocation> => {
  const { data } = await axios.get<IGeolocationExtras>(`https://ipwhois.app/json/${ip}`);
  if (!data.success) return Promise.reject("Failed to get geolocation");
  const { type, continent, continent_code, country, country_code, region, city, latitude, longitude, asn, org, isp } = data;
  const simplified = {
    ip,
    type,
    continent,
    continent_code,
    country,
    country_code,
    region,
    city,
    latitude,
    longitude,
    asn,
    org,
    isp,
  };
  return simplified;
};
