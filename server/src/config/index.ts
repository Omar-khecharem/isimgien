import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),

  MONGODB_URI: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  CORS_ORIGIN: z.string().url(),

  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_AVATAR_SIZE: z.coerce.number().default(2097152),
  MAX_POSTER_SIZE: z.coerce.number().default(5242880),
  MAX_FORM_FILE_SIZE: z.coerce.number().default(10485760),
  MAX_RECEIPT_SIZE: z.coerce.number().default(3145728),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment configuration:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const env = parsed.data;

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",

  mongodb: {
    uri: env.MONGODB_URI,
  },

  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },

  cors: {
    origin: env.CORS_ORIGIN,
  },

  upload: {
    dir: path.resolve(env.UPLOAD_DIR),
    maxSizes: {
      avatar: env.MAX_AVATAR_SIZE,
      poster: env.MAX_POSTER_SIZE,
      formFile: env.MAX_FORM_FILE_SIZE,
      receipt: env.MAX_RECEIPT_SIZE,
    },
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"] as const,
    allowedFileTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ] as const,
  },
} as const;

export type AppConfig = typeof config;
