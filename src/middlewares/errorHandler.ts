import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  console.error("Erro inesperado:", err);

  if (process.env.NODE_ENV === "development") {
    return res.status(500).json({
      status: "error",
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(500).json({
    status: "error",
    message: "Erro interno do servidor",
  });
}
