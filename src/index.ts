require("dotenv").config();
import { Backend } from "./classes/backend.class";
import chalk from "chalk";
import { getMemoryUsage } from "./logic";
import os from "os";

async function main() {
  console.clear();

  const hostname = `${chalk.cyan("hostname")}  ${chalk.reset(os.hostname())}`;
  const arch = `${chalk.cyan("arch")}      ${chalk.reset(os.arch())}`;
  const pid = `${chalk.cyan("pid")}       ${chalk.reset(process.pid)}`;
  const secure = `${chalk.cyan("secure")}    ${chalk.reset(process.env.SECURE!)}`;
  const mode = `${chalk.cyan("mode")}      ${
    process.env.MODE! === "production" ? chalk.green("production") : chalk.blue("development")
  }`;

  const logo = chalk.blue(`
 
   _  ______  ___  _  ____________      ${hostname}
  | |/_/ __ \\/ _ \\/ |/ / __/_  __/      ${arch}
 _>  </ /_/ / , _/    / _/  / /         ${pid}
/_/|_|\\____/_/|_/_/|_/___/ /_/          ${secure}
    John Xina is behind you             ${mode}
`);

  console.log(logo);
  const backend = await Backend.create();
  process.on("uncaughtException", (err) => console.error("Uncaught Exception: ", err.message));
}

main();
