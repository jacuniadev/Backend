require("dotenv").config();
import { Backend } from "./classes/backend.class";
import chalk from "chalk";
import { getMemoryUsage } from "./logic";

// get the hostname of the machine
const hostname = require("os").hostname();

async function main() {
  console.clear();

  const logo = chalk.blue(`
   _  ______  ___  _  ____________     
  | |/_/ __ \\/ _ \\/ |/ / __/_  __/    ${chalk.cyan("hostname")}  ${chalk.reset(hostname)}
 _>  </ /_/ / , _/    / _/  / /       ${chalk.cyan("memory")}    ${chalk.reset((await getMemoryUsage()).used.toFixed(2))} Mb
/_/|_|\\____/_/|_/_/|_/___/ /_/       
  `);

  console.log(logo);
  const backend = await Backend.create();
  process.on("uncaughtException", (err) => console.error("Uncaught Exception: ", err.message));
}

main();
