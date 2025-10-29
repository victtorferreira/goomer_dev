import { Request, Response, NextFunction } from "express";
import { ProductCategory } from "../models";
import { validate as isUUID } from "uuid";

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

export function validateCreateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { name, price, category, display_order } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Nome é obrigatório" });
    return;
  }

  if (typeof price !== "number" || price <= 0) {
    res.status(400).json({ error: "Preço deve ser positivo" });
    return;
  }

  if (!Object.values(ProductCategory).includes(category)) {
    res.status(400).json({ error: "Categoria inválida" });
    return;
  }

  if (
    display_order !== undefined &&
    (typeof display_order !== "number" || display_order <= 0)
  ) {
    res
      .status(400)
      .json({ error: "display_order deve ser um número positivo" });
    return;
  }

  next();
}

export function validateProductQuery(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { category, visible } = req.query;

  if (
    category &&
    !Object.values(ProductCategory).includes(category as ProductCategory)
  ) {
    res.status(400).json({ error: "Categoria inválida" });
    return;
  }

  if (visible && visible !== "true" && visible !== "false") {
    res
      .status(400)
      .json({ error: "Parâmetro 'visible' deve ser true ou false" });
    return;
  }

  next();
}

export function validateUpdateProduct(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (Object.keys(req.body).length === 0) {
    res.status(400).json({
      error: "Pelo menos um campo deve ser fornecido para atualização",
    });
    return;
  }

  validateCreateProduct(req, res, next);
}
