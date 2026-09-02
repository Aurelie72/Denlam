import { Router } from "express";
import {
  createMessage,
  listMessages,
  toggleRead,
  deleteMessage,
} from "../controllers/messages.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { contactLimiter } from "../middleware/rateLimiters.js";

const router = Router();
router.post("/", contactLimiter, asyncHandler(createMessage));
router.get("/", requireAuth, asyncHandler(listMessages));
router.patch("/:id/read", requireAuth, asyncHandler(toggleRead));
router.delete("/:id", requireAuth, asyncHandler(deleteMessage));
export default router;
