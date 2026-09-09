import mongoose from "mongoose";
import app from "./app";
import { config } from "./config";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { seedSuperAdmin } from "./seeds/superAdmin.seed";
import { seedDemoAccounts } from "./seeds/demoAccounts.seed";

async function fixIndexes() {
  try {
    const collection = mongoose.connection.collection("users");
    await collection.updateMany(
      { studentId: null },
      { $unset: { studentId: "" } }
    );
    await collection.dropIndex("studentId_1").catch(() => {});
    await collection.createIndex({ studentId: 1 }, { unique: true, sparse: true });
    console.log("[DB] studentId index is sparse+unique.");
  } catch {
    // Index may not exist yet, that's fine
  }
}

async function startServer() {
  try {
    await connectDatabase();

    await fixIndexes();
    await seedSuperAdmin();
    await seedDemoAccounts();

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
