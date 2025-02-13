import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv"; // Load environment variables
import { AppDataSource } from "./config/dataSource";
import apiRoute from "./api.route";
import errorHandler from "./middlewares/errorHandler";

dotenv.config(); // Load .env variables

const app = express();

app.use(express.static("uploads"));
app.use(express.json());
app.use(cors());
app.use("/files", express.static(path.join(process.cwd(), "/src/uploads")));
app.use(express.urlencoded({ extended: true }));

AppDataSource.initialize()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((error) => console.error(" Error connecting to database:", error));

app.use("/api", apiRoute);

app.use((req: Request, res: Response, next: NextFunction) => {
  next({
    message: "Page not found",
    status: 404,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
