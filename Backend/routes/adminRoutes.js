import express from "express";
import { getAllDoctors, deleteDoctor, getAllPatients, deletePatient } from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Doctor management
router.get("/doctors", protect,adminOnly, getAllDoctors);
router.delete("/doctors/:id", protect, adminOnly, deleteDoctor);

// Patient management
router.get("/patients", protect, adminOnly, getAllPatients);
router.delete("/patients/:id", protect, adminOnly, deletePatient);

export default router;
