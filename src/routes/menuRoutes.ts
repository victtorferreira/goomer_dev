import { Router } from "express";
import MenuController from "../controllers/MenuController";
import { validateMenuQuery } from "../validators/menuValidator";

const router = Router();

router.get("/", validateMenuQuery, MenuController.getMenu);

export default router;
