import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

// Middlewares de segurança
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // em produção, configure domínios permitidos
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use("/api", routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Rota não encontrada",
  });
});

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export default app;
