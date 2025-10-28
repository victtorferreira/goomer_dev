import { Router } from "express";
import productRoutes from "./productRoutes";
import promotionRoutes from "./promotionsRoutes";
import menuRoutes from "./menuRoutes";

const router = Router();

router.use("/products", productRoutes);
router.use("/promotions", promotionRoutes);
router.use("/menu", menuRoutes);

export default router;
