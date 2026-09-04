import { Router } from "express";
import { downloadBackup } from "../controllers/backup.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();
router.get("/", requireAuth, asyncHandler(downloadBackup));
export default router;
