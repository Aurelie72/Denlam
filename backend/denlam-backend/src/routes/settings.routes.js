import { Router } from "express";
import { getAbout, updateAbout } from "../controllers/settings.controller.js";
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

export default router;
