import { Router } from "express";
import ProductController from "../controllers/ProductController"; // <-- corrigido
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateUUID,
} from "../validators/productValidator";

const router = Router();

router.post("/", validateCreateProduct, ProductController.createProduct);

router.get("/", ProductController.findAllProducts);

router.get("/:id", validateUUID, ProductController.findProductById);

router.put(
  "/:id",
  validateUUID,
  validateUpdateProduct,
  ProductController.updateProduct
);

router.delete("/:id", validateUUID, ProductController.removeProduct);

export default router;
