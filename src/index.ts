require("dotenv").config();
import { Backend } from "./classes/backend.class";

async function main() {
  console.clear();

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception: ", err.message);
  });

  const backend = await Backend.create({
    port: 8085,
    secure: true,
    verbose: true,
    mongoUrl: process.env.MONGO_URL!,
  });
}

main();
