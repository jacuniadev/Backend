import osu from "node-os-utils";

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
