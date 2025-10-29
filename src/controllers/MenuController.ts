import { Request, Response } from "express";
import { MenuService } from "../services/MenuService";
import { ProductCategory } from "../models";

class MenuController {
  private menuService = new MenuService();

  getMenu = async (req: Request, res: Response) => {
    try {
      const { category, timezone } = req.query;

      let categoryEnum: ProductCategory | undefined;
      if (
        typeof category === "string" &&
        Object.values(ProductCategory).includes(category as ProductCategory)
      ) {
        categoryEnum = category as ProductCategory;
      }

      const menu = await this.menuService.getMenuItems(
        categoryEnum,
        timezone as string | undefined
      );

      res.json({ status: "success", data: menu });
    } catch (error) {
      console.error("Erro em getMenu:", error);
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Erro interno no servidor",
      });
    }
  };
}

export default new MenuController();
