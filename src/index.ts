import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import env from "./config/env"; // Validate environment variables first
import { AppDataSource } from "./config/dataSource";
import apiRoute from "./api.route";
import errorHandler from "./middlewares/errorHandler";
import { specs, swaggerUi } from "./config/swagger";
import logger, { morganStream } from "./config/logger";

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use("/api", limiter);

// HTTP request logging
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined", { stream: morganStream }));
} else {
  app.use(morgan("dev", { stream: morganStream }));
}

app.use(express.static("uploads"));
app.use(express.json());
app.use(cors());
app.use("/files", express.static(path.join(process.cwd(), "/src/uploads")));
app.use(express.urlencoded({ extended: true }));

AppDataSource.initialize()
  .then(() => logger.info("✅ Database connected successfully"))
  .catch((error) => {
    logger.error("❌ Error connecting to database:", error);
    process.exit(1);
  });

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Social Media API Documentation",
  })
);

app.use("/api", apiRoute);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next({
    message: "Page not found",
    status: 404,
  });
});

app.use(errorHandler);

const PORT = Number(env.PORT);
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});
