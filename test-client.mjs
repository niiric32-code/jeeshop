import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

console.log("1. All imports successful");

neonConfig.webSocketConstructor = ws;
console.log("2. neonConfig configured");

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL || "postgresql://user:password@localhost/db",
  directUrl: process.env.DIRECT_URL,
});
console.log("3. Adapter created");

console.log("4. Creating PrismaClient with adapter...");
const prisma = new PrismaClient({ adapter });
console.log("5. PrismaClient created successfully");
console.log("6. Client object keys:", Object.keys(prisma).slice(0, 5));

process.exit(0);
