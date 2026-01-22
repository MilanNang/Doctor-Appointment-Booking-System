import express from "express";
import { registerUser, loginUser, verifyEmail, verifyAuth, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-email", verifyEmail);

// Verify authentication from cookie
router.get("/verify", protect, verifyAuth);

// Update profile
router.put("/profile", protect, updateProfile);

// Logout endpoint
router.post("/logout", (req, res) => {
	res.clearCookie("token");
	res.json({ message: "Logged out successfully" });
});

export default router;
