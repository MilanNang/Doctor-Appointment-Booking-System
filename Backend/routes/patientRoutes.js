import express from "express";
import {
  getAllDoctors,
  getDoctorById,
  getMyAppointments
} from "../controllers/patientController.js";

import { bookAppointment } from "../controllers/appointmentController.js"; // ✅ FIXED

import { protect, patientOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Browse/search doctors
router.get("/doctors", protect, patientOnly, getAllDoctors);

// Get doctor details
router.get("/doctor/:id", protect, patientOnly, getDoctorById);

// ✅ Book appointment (correct controller)
router.post("/book", protect, patientOnly, bookAppointment);

// Get logged-in patient’s appointments
router.get("/appointments", protect, patientOnly, getMyAppointments);

export default router;
