import { seedData } from './api/v1/controller/seed';

async function main() {
  await seedData();
}

main();

