import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config";
import { requestLogger } from "./middleware/logger.middleware";
import { errorHandler } from "./middleware/errorHandler.middleware";
import { notFoundHandler } from "./middleware/notFoundHandler.middleware";
import routes from "./routes";

const app = express();

app.use(cors({ origin: config.cors.origin, credentials: true }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(requestLogger);

app.use("/uploads", express.static(config.upload.dir));

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
