import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const isDev = process.env.NODE_ENV === "development";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [isDev ? "src/models/**/*.{ts,js}" : "dist/models/**/*.{js,ts}"],
  migrations: [
    isDev ? "src/migrations/**/*.{ts,js}" : "dist/migrations/**/*.{js,ts}",
  ],
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default AppDataSource;
