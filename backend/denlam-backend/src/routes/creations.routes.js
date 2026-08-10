import { Router } from "express";
import {
  listCreations,
  getCreation,
  createCreation,
  updateCreation,
  deleteCreation,
} from "../controllers/creations.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

// Lecture publique (galerie visible par tous les visiteurs)
router.get("/", asyncHandler(listCreations));
router.get("/:id", asyncHandler(getCreation));

// Écriture réservée à l'admin connecté — jusqu'à 10 photos par création
router.post(
  "/",
  requireAuth,
  upload.array("images", 10),
  asyncHandler(createCreation),
);
router.put(
  "/:id",
  requireAuth,
  upload.array("images", 10),
  asyncHandler(updateCreation),
);
router.delete("/:id", requireAuth, asyncHandler(deleteCreation));

export default router;
