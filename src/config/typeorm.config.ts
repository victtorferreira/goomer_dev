import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "goomer_menu",
  synchronize: false, // nunca use true em produção
  logging: false,
  entities: ["src/models/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
});

export default AppDataSource;
