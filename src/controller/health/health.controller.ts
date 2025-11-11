import { Request, Response } from "express";
import { AppDataSource } from "../../config/dataSource";
import env from "../../config/env";

export class HealthController {
  static async check(_req: Request, res: Response): Promise<void> {
    const startTime = Date.now();

    try {
      // Check database connection
      const isDbConnected = AppDataSource.isInitialized;
      let dbStatus = "disconnected";
      let dbResponseTime = 0;

      if (isDbConnected) {
        const dbStartTime = Date.now();
        try {
          await AppDataSource.query("SELECT 1");
          dbStatus = "healthy";
          dbResponseTime = Date.now() - dbStartTime;
        } catch (error) {
          dbStatus = "unhealthy";
        }
      }

      const responseTime = Date.now() - startTime;
      const status = dbStatus === "healthy" ? "healthy" : "degraded";

      res.status(status === "healthy" ? 200 : 503).json({
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        service: "social-media-api",
        checks: {
          database: {
            status: dbStatus,
            responseTime: `${dbResponseTime}ms`,
          },
          api: {
            status: "healthy",
            responseTime: `${responseTime}ms`,
          },
        },
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(
            process.memoryUsage().heapTotal / 1024 / 1024
          )}MB`,
        },
      });
    } catch (error) {
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      });
    }
  }
}
