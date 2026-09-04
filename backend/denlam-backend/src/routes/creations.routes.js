import { Router } from "express";
import {
  listCreations,
  getCreation,
  createCreation,
  updateCreation,
  deleteCreation,
  reorderCreations,
} from "../controllers/creations.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { processImages } from "../middleware/processImages.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listCreations));

// Doit être déclarée avant "/:id" — sinon Express interprète "reorder"
// comme un identifiant de création et route vers getCreation par erreur.
router.put("/reorder", requireAuth, asyncHandler(reorderCreations));

router.get("/:id", asyncHandler(getCreation));

router.post(
  "/",
  requireAuth,
  upload.array("images", 10),
  asyncHandler(processImages),
  asyncHandler(createCreation),
);
router.put(
  "/:id",
  requireAuth,
  upload.array("images", 10),
  asyncHandler(processImages),
  asyncHandler(updateCreation),
);
router.delete("/:id", requireAuth, asyncHandler(deleteCreation));

export default router;
