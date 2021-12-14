import { Backend } from "./classes/backend";

async function main() {
  console.clear();
  const backend = Backend.create({ port: 8000, verbose: true });
}

main();
