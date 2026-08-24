import { Router } from "express";
import {
  getCreationsSettings,
  updateCreationsSettings,
} from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/creations", asyncHandler(getCreationsSettings));
router.put("/creations", requireAuth, asyncHandler(updateCreationsSettings));

export default router;
