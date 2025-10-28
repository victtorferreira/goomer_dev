import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Se for um AppError (erro de negócio ou esperado)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Se for um erro inesperado
  console.error("Erro inesperado:", err);

  // Em desenvolvimento, podemos expor mais detalhes
  if (process.env.NODE_ENV === "development") {
    return res.status(500).json({
      status: "error",
      message: err.message,
      stack: err.stack,
    });
  }

  // Em produção, resposta genérica
  return res.status(500).json({
    status: "error",
    message: "Erro interno do servidor",
  });
}
