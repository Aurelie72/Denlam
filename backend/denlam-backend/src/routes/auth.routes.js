import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { loginLimiter } from "../middleware/rateLimiters.js";

const router = Router();
router.post("/login", loginLimiter, asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));
export default router;
