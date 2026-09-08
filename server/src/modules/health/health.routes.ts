import { Router, Request, Response } from "express";
import { isDatabaseConnected } from "../../config/database";
import { config } from "../../config";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
      database: {
        connected: isDatabaseConnected(),
      },
    },
  });
});

export default router;
