require("dotenv").config();
import { Backend } from "./classes/backend.class";

async function main() {
  console.clear();
  const backend = await Backend.create({
    port: 8085,
    verbose: true,
    mongoUrl: process.env.MONGO_URL!,
  });
  // express().use(express.json()).use(v1).listen(8080);
}

main();
