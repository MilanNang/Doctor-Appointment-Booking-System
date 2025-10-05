import express from "express";
import {
  bookAppointment,
  getPatientAppointments,
  cancelAppointment,
  rescheduleAppointment,
  getDoctorAppointments,
  getAllAppointments
} from "../controllers/appointmentController.js";

import { protect, patientOnly, doctorOnly, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Patient actions
router.post("/book", protect, patientOnly, bookAppointment);
router.get("/my", protect, patientOnly, getPatientAppointments);
router.put("/:id/cancel", protect, patientOnly, cancelAppointment);
router.put("/:id/reschedule", protect, patientOnly, rescheduleAppointment);

// Doctor actions
router.get("/doctor", protect, doctorOnly, getDoctorAppointments);

// Admin actions
router.get("/all", protect, adminOnly, getAllAppointments);

export default router;
