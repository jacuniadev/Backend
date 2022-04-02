import chalk from "chalk";

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

export class Logger {
  /**
   * Puts the log together and prints it
   * @param color the color for the prefix
   * @param prefix the prefix text
   * @param args the arguments to be logged.
   * @author Geoxor
   */
  private static log(color: string, prefix: string, ...args: any[]) {
    console.log(`${this.getCurrentMemoryHeap()} ${this.time()} ${color}[${prefix.toUpperCase()}]${RESET}`, ...args);
  }

  /**
   * @returns return a string of the total memory allocated
   * @author Geoxor
   */
  public static getCurrentMemoryHeap() {
    const mem = process.memoryUsage();
    const total = mem.heapTotal / 1000 / 1000;
    return chalk.gray(`${total.toFixed(2)}MB`);
  }

  /**
   * Get current time in format of "HH:mm:ss AM/PM" with colors.
   * @returns {string} The formatted time.
   * @author azur1s
   */
  static time(): string {
    let time = new Date().toLocaleTimeString();
    return chalk.bgWhite(chalk.black(`${DIM}${time}${RESET}`));
  }

  /**
   * Log a message with level of normal information.
   * Should be used on normal log messages and etc.
   * @example Logger.info("Got connection from", connection.ip);
   * @param args the arguments to be logged.
   * @author azur1s
   */
  static info = (...args: any[]): void => {
    this.log(GREEN, "Info", ...args);
  };

  /**
   * Log a message with level of warning.
   * Should be used on warnings (e.g. no config file found).
   * @example Logger.warn("No config file found, using default config");
   * @param args the arguments to be logged.
   * @author azur1s
   */
  static warn = (...args: any[]): void => {
    this.log(YELLOW, "Warn", ...args);
  };

  /**
   * Log a message with level of error.
   * Should be used on important errors (e.g. database connection failed).
   * @example Logger.error("Database connection failed", error);
   * @param args the arguments to be logged.
   * @author azur1s
   */
  static error = (...args: any[]): void => {
    this.log(RED, "Error", ...args);
  };
}
