import app from "./app";
import { config } from "./config";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { seedSuperAdmin } from "./seeds/superAdmin.seed";

async function startServer() {
  try {
    await connectDatabase();

    await seedSuperAdmin();

    const server = app.listen(config.port, () => {
      console.log(
        `[SERVER] Running on http://localhost:${config.port} (${config.env})`
      );
    });

    const shutdown = async (signal: string) => {
      console.log(`\n[SERVER] ${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDatabase();
        console.log("[SERVER] Closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

    process.on("unhandledRejection", (reason) => {
      console.error("[SERVER] Unhandled rejection:", reason);
    });

    process.on("uncaughtException", (err) => {
      console.error("[SERVER] Uncaught exception:", err);
      shutdown("uncaughtException");
    });
  } catch (err) {
    console.error("[SERVER] Failed to start:", err);
    process.exit(1);
  }
}

startServer();
