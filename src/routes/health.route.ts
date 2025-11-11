import { Router } from "express";
import { HealthController } from "../controller/health/health.controller";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy or degraded
 */
router.get("/", HealthController.check);

export default router;
