import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

console.log("All imports successful");
console.log("PrismaNeon:", typeof PrismaNeon);
console.log("neonConfig:", typeof neonConfig);
console.log("ws:", typeof ws);

// Try to configure neonConfig
neonConfig.webSocketConstructor = ws;
console.log("neonConfig configured");

// Try to create an adapter
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL || "postgresql://user:password@localhost/db",
  directUrl: process.env.DIRECT_URL,
});
console.log("Adapter created successfully");
