import morgan from "morgan";
import { config } from "../config";

export const requestLogger = morgan(
  config.isDevelopment ? "dev" : "combined",
  {
    skip: (req) => req.url === "/api/v1/health",
  }
);
