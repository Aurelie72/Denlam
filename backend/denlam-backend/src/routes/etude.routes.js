import { Router } from "express";
import {
  getSettings,
  updateSettings,
  listPlans,
  createPlan,
  updatePlan,
  deletePlan,
  reorderPlans,
} from "../controllers/etude.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { processImages } from "../middleware/processImages.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/settings", asyncHandler(getSettings));
router.put("/settings", requireAuth, asyncHandler(updateSettings));

router.get("/plans", asyncHandler(listPlans));

// Avant "/plans/:id" pour la même raison que côté créations.
router.put("/plans/reorder", requireAuth, asyncHandler(reorderPlans));

router.post(
  "/plans",
  requireAuth,
  upload.array("images", 20),
  asyncHandler(processImages),
  asyncHandler(createPlan),
);
router.put(
  "/plans/:id",
  requireAuth,
  upload.array("images", 20),
  asyncHandler(processImages),
  asyncHandler(updatePlan),
);
router.delete("/plans/:id", requireAuth, asyncHandler(deletePlan));

export default router;
