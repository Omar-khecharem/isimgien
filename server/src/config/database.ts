import mongoose from "mongoose";
import { config } from "./index";

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  if (isConnected) return;

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    isConnected = true;
    console.log("[DB] MongoDB connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("[DB] MongoDB connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    console.log("[DB] MongoDB disconnected");
  });

  await mongoose.connect(config.mongodb.uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  console.log("[DB] MongoDB connection closed");
}

export function isDatabaseConnected(): boolean {
  return isConnected;
}
