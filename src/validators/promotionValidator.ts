import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction,
} from "express";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

export function validateUUID(
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction
) {
  const { id } = req.params;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  return next();
}

export function validateCreatePromotion(
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction
) {
  const {
    product_id,
    description,
    promotional_price,
    days_of_week,
    start_time,
    end_time,
  } = req.body ?? {};

  if (!product_id || typeof product_id !== "string") {
    return res.status(400).json({ error: "ID do produto inválido" });
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    return res.status(400).json({ error: "Descrição é obrigatória" });
  }

  if (typeof promotional_price !== "number" || promotional_price <= 0) {
    return res
      .status(400)
      .json({ error: "Preço promocional deve ser positivo" });
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

  const [sh, sm] = start_time
    .split(":")
    .map((x: string) => Number.parseInt(x, 10));
  const [eh, em] = end_time
    .split(":")
    .map((x: string) => Number.parseInt(x, 10));

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
  req: ExpressRequest,
  res: ExpressResponse,
  next: NextFunction
) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Pelo menos um campo deve ser fornecido para atualização",
    });
  }
  return validateCreatePromotion(req, res, next);
}
