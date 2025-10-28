import { Request, Response, NextFunction } from "express";
import { ProductCategory } from "../models";

export function validateUUID(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }
  return next();
}

export function validateCreateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { name, price, category, display_order } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  if (typeof price !== "number" || price <= 0) {
    return res.status(400).json({ error: "Preço deve ser positivo" });
  }

  if (!Object.values(ProductCategory).includes(category)) {
    return res.status(400).json({ error: "Categoria inválida" });
  }

  if (
    display_order !== undefined &&
    (typeof display_order !== "number" || display_order <= 0)
  ) {
    return res
      .status(400)
      .json({ error: "display_order deve ser um número positivo" });
  }

  return next();
}

export function validateProductQuery(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { category, visible } = req.query;

  if (
    category &&
    !Object.values(ProductCategory).includes(category as ProductCategory)
  ) {
    return res.status(400).json({ error: "Categoria inválida" });
  }

  if (visible && visible !== "true" && visible !== "false") {
    return res
      .status(400)
      .json({ error: "Parâmetro 'visible' deve ser true ou false" });
  }

  return next();
}

export function validateUpdateProduct(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Pelo menos um campo deve ser fornecido para atualização",
    });
  }
  return validateCreateProduct(req, res, next);
}
