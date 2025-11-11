import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: process.env.NODE_ENV !== "production", // Only sync in development
  logging: process.env.NODE_ENV === "development", // Only log in development
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  migrationsRun: process.env.NODE_ENV === "production", // Auto-run migrations in production
});
