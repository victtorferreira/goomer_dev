import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Rota não encontrada",
  });
});

app.use(errorHandler);

export default app;
