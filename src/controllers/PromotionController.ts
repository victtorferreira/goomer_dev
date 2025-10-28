import { Request, Response } from "express";
import PromotionService from "../services/PromotionService";
import { handleRequest } from "../utils/handleRequest";

class PromotionController {
  createPromotion = handleRequest(async (req: Request, res: Response) => {
    const promotion = await PromotionService.createPromotion(req.body);
    res.status(201).json({ status: "success", data: promotion });
  });

  findAllPromotions = handleRequest(async (req: Request, res: Response) => {
    const { product_id } = req.query;

    const promotions = await PromotionService.getAllPromotions(
      product_id as string | undefined
    );

    res.status(200).json({
      status: "success",
      data: promotions,
      count: promotions.length,
    });
  });

  findPromotionById = handleRequest(async (req: Request, res: Response) => {
    const { id } = req.params;
    const promotion = await PromotionService.getPromotionById(id);
    res.status(200).json({ status: "success", data: promotion });
  });

  updatePromotion = handleRequest(async (req: Request, res: Response) => {
    const { id } = req.params;
    const promotion = await PromotionService.updatePromotion(id, req.body);
    res.status(200).json({ status: "success", data: promotion });
  });

  removePromotion = handleRequest(async (req: Request, res: Response) => {
    const { id } = req.params;
    await PromotionService.deletePromotion(id);
    res.status(204).send();
  });
}

export default new PromotionController();
