import express from "express";
import { createOrUpdateDoctor, getAllDoctors, getDoctorById, updateAvailability } from "../controllers/doctorController.js";
import { protect, doctorOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Doctor creates/updates profile
router.post("/profile", protect, doctorOnly, createOrUpdateDoctor);

// Get all approved doctors
router.get("/", getAllDoctors);

// Get doctor by ID
router.get("/:id", getDoctorById);

// Update doctor availability
router.put("/availability", protect, doctorOnly, updateAvailability);

export default router;
