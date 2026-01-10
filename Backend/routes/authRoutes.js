import express from "express";
import { registerUser, loginUser, verifyEmail } from "../controllers/authController.js";
import { verifyAuth } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);

// Verify authentication from cookie
router.get("/verify", protect, verifyAuth);

// Logout endpoint
router.post("/logout", (req, res) => {
	res.clearCookie("token");
	res.json({ message: "Logged out successfully" });
});

export default router;
