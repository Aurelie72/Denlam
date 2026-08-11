import { Router } from "express";
import {
  getAbout,
  updateAbout,
  getCreationsSettings,
  updateCreationsSettings,
} from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/about", asyncHandler(getAbout));
router.put(
  "/about",
  requireAuth,
  upload.single("portrait"),
  asyncHandler(updateAbout),
);

router.get("/creations", asyncHandler(getCreationsSettings));
router.put("/creations", requireAuth, asyncHandler(updateCreationsSettings));

export default router;
