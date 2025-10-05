// routes/doctorRoutes.js
import express from "express";
import {
  createOrUpdateDoctor,
  getAllDoctors,
  getDoctorById,
  updateAvailability,
  getDoctorDashboard

} from "../controllers/doctorController.js";
import { protect, doctorOnly } from "../middleware/authMiddleware.js";
import { upload } from "../utils/multer.js";
import Doctor from "../models/Doctor.js";

const router = express.Router();

// Doctor profile
router.post(
  "/profile",
  protect,
  doctorOnly,
  upload.single("profileImage"),
  createOrUpdateDoctor
);

// Get all approved doctors
router.get("/", getAllDoctors);

router.get("/me", protect, doctorOnly, async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found yet" });
    res.json(doctor);
  } catch (err) {
    console.error("Error fetching /doctors/me:", err);
    res.status(500).json({ message: err.message });
  }
});

// must come after /me
router.get("/:id", getDoctorById);
// GET /doctors/dashboard
router.get("/dashboard", protect, doctorOnly, getDoctorDashboard);







// Update availability
router.put("/availability", protect, doctorOnly, updateAvailability);

export default router;
