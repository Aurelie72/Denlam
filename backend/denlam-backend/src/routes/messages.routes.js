import { Router } from "express";
import {
  createMessage,
  listMessages,
  toggleRead,
  deleteMessage,
} from "../controllers/messages.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.post("/", asyncHandler(createMessage)); // public : envoi du formulaire
router.get("/", requireAuth, asyncHandler(listMessages));
router.patch("/:id/read", requireAuth, asyncHandler(toggleRead));
router.delete("/:id", requireAuth, asyncHandler(deleteMessage));

export default router;
