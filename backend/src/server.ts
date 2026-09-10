import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./db/prisma";

const app = createApp();
const port = env.PORT;

app.listen(port, () => {
  console.log(`🗄️  Tuhin Watch House API running → http://localhost:${port}`);
  console.log(`   Env: ${env.NODE_ENV} | DB: ${env.DATABASE_URL.split(":")[0]}`);
});

// Graceful shutdown
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    console.log(`\n${sig} received — shutting down…`);
    await prisma.$disconnect();
    process.exit(0);
  });
}