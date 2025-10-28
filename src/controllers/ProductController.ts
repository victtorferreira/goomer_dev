import { Request, Response } from "express";
import ProductService from "../services/ProductService";
import { handleRequest } from "../utils/handleRequest";
import { ProductCategory } from "models";

class ProductController {
  createProduct = handleRequest(async (req: Request, res: Response) => {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({ status: "success", data: product });
  });

  findAllProducts = handleRequest(async (req: Request, res: Response) => {
    const { category, visible } = req.query;

    const products = await ProductService.getAllProducts({
      category: category as ProductCategory | undefined,
      visible: visible !== undefined ? visible === "true" : undefined,
    });

    res.status(200).json({
      status: "success",
      data: products,
      count: products.length,
    });
  });

  findProductById = handleRequest(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    res.status(200).json({ status: "success", data: product });
  });

  updateProduct = handleRequest(async (req: Request, res: Response) => {
    const { id } = req.params;
    const product = await ProductService.updateProduct(id, req.body);
    res.status(200).json({ status: "success", data: product });
  });

  removeProduct = handleRequest(async (req: Request, res: Response) => {
    const { id } = req.params;
    await ProductService.deleteProduct(id);
    res.status(204).send();
  });
}

export default new ProductController();
