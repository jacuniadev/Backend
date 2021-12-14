import { Backend } from "./classes/backend";
import { MONGO_URL } from "./constants";

async function main() {
  console.clear();
  const backend = Backend.create({ port: 8000, verbose: true, mongoUrl: MONGO_URL });
}

main();
