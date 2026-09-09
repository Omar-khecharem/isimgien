import mongoose from "mongoose";
import app from "./app";
import { config } from "./config";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { seedSuperAdmin } from "./seeds/superAdmin.seed";
import { seedDemoAccounts } from "./seeds/demoAccounts.seed";

async function fixIndexes() {
  try {
    const collection = mongoose.connection.collection("users");
    const indexes = await collection.indexes();
    const studentIdIndex = indexes.find((i: any) => i.key?.studentId === 1);
    if (studentIdIndex && !studentIdIndex.sparse) {
      console.log("[DB] Dropping non-sparse studentId index to recreate with sparse...");
      await collection.dropIndex("studentId_1");
      console.log("[DB] Index dropped. It will be recreated on next operation.");
    }
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
