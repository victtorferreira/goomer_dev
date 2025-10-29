import { Request, Response, NextFunction } from "express";
import { ProductCategory } from "../models";

function isValidTimezone(tz: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function validateMenuQuery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { category, timezone } = req.query;

  if (
    category &&
    !Object.values(ProductCategory).includes(category as ProductCategory)
  ) {
    return res.status(400).json({ error: "Categoria inválida" });
  }

  if (timezone && typeof timezone === "string" && !isValidTimezone(timezone)) {
    return res.status(400).json({
      error: "Timezone inválido (use formato IANA, ex: America/Sao_Paulo)",
    });
  }

  return next();
}
