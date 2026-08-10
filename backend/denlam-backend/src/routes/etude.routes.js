import { Router } from "express";
import {
  getSettings,
  updateSettings,
  listPhotos,
  addPhotos,
  deletePhoto,
} from "../controllers/etude.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/settings", asyncHandler(getSettings));
router.put("/settings", requireAuth, asyncHandler(updateSettings));

router.get("/photos", asyncHandler(listPhotos));
router.post(
  "/photos",
  requireAuth,
  upload.array("images", 20),
  asyncHandler(addPhotos),
);
router.delete("/photos/:id", requireAuth, asyncHandler(deletePhoto));

export default router;
