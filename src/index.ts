import { Backend } from "./classes/backend.class";
import { MONGO_URL } from "./constants";

async function main() {
  console.clear();
  const backend = await Backend.create({ port: 8086, verbose: true, mongoUrl: MONGO_URL });
}

main();
