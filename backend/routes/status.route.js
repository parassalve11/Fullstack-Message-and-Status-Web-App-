import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware.js";
import { multerMiddleware } from "../lib/cloudinary.js";

import {
  createStatus,
  deleteStatus,
  getStatuses,
  viewStatus,
} from "../controllers/status.controller.js";

const router = Router();

router.post("/", authenticateToken, multerMiddleware, createStatus);
router.get("/", authenticateToken, getStatuses);

router.put("/:statusId/view", authenticateToken, viewStatus);

router.delete("/:statusId", authenticateToken, deleteStatus);



export default router;