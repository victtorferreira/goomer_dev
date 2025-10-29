import { Request, Response, NextFunction } from "express";
import { validate as isUUID } from "uuid";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function validateUUID(
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  let { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "ID inválido" });
  }

  id = id.trim();

  if (!isUUID(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  req.params.id = id;
  return next();
}

export function validateCreatePromotion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    product_id,
    description,
    discount_percentage,
    days_of_week,
    start_time,
    end_time,
  } = req.body ?? {};

  if (!product_id || typeof product_id !== "string" || !isUUID(product_id)) {
    return res.status(400).json({ error: "ID do produto inválido" });
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    return res.status(400).json({ error: "Descrição é obrigatória" });
  }

  if (
    typeof discount_percentage !== "number" ||
    discount_percentage < 0 ||
    discount_percentage > 100
  ) {
    return res
      .status(400)
      .json({ error: "O desconto deve ser um número entre 0 e 100" });
  }

  if (
    !Array.isArray(days_of_week) ||
    days_of_week.some((d) => typeof d !== "number" || d < 0 || d > 6)
  ) {
    return res.status(400).json({ error: "Dias da semana inválidos" });
  }

  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return res
      .status(400)
      .json({ error: "Horários devem estar no formato HH:mm" });
  }

  const [sh, sm] = start_time.split(":").map((x: string) => parseInt(x, 10));
  const [eh, em] = end_time.split(":").map((x: string) => parseInt(x, 10));

  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;

  if (endMinutes <= startMinutes) {
    return res
      .status(400)
      .json({ error: "Horário de término deve ser posterior ao de início" });
  }

  if (endMinutes - startMinutes < 15) {
    return res.status(400).json({
      error: "O intervalo entre início e fim deve ser de pelo menos 15 minutos",
    });
  }

  return next();
}

export function validateUpdatePromotion(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Pelo menos um campo deve ser fornecido para atualização",
    });
  }

  const {
    description,
    discount_percentage,
    days_of_week,
    start_time,
    end_time,
  } = req.body;

  if (
    description !== undefined &&
    (typeof description !== "string" || description.trim().length === 0)
  ) {
    return res.status(400).json({ error: "Descrição inválida" });
  }

  if (
    discount_percentage !== undefined &&
    (typeof discount_percentage !== "number" ||
      discount_percentage < 0 ||
      discount_percentage > 100)
  ) {
    return res
      .status(400)
      .json({ error: "O desconto deve ser um número entre 0 e 100" });
  }

  if (
    days_of_week !== undefined &&
    (!Array.isArray(days_of_week) ||
      days_of_week.some((d) => typeof d !== "number" || d < 0 || d > 6))
  ) {
    return res.status(400).json({ error: "Dias da semana inválidos" });
  }

  if (
    (start_time !== undefined && !timeRegex.test(start_time)) ||
    (end_time !== undefined && !timeRegex.test(end_time))
  ) {
    return res
      .status(400)
      .json({ error: "Horários devem estar no formato HH:mm" });
  }

  return next();
}
