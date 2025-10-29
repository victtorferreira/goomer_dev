import { Router } from "express";
import PromotionController from "../controllers/PromotionController";
import { validateUUID } from "../validators/promotionValidator";

const router = Router();

router.post("/", PromotionController.createPromotion);

router.get("/", PromotionController.findAllPromotions);

router.get("/:id", validateUUID, PromotionController.findPromotionById);

router.put("/:id", validateUUID, PromotionController.updatePromotion);

router.delete("/:id", validateUUID, PromotionController.removePromotion);

export default router;
