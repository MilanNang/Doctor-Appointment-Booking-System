import express from "express";
import {
  getUserNotifications,
  markAsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all user notifications
router.get("/", protect, getUserNotifications);

// Mark notification as read
router.put("/:id/read", protect, markAsRead);

export default router;
