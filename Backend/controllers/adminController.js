import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

// @desc   Get all doctors (approved + pending)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("user", "name email role");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Approve doctor
export const approveDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    doctor.isApproved = true;
    await doctor.save();

    res.json({ message: "Doctor approved successfully", doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    await doctor.deleteOne();
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get all patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Delete patient
export const deletePatient = async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    await patient.deleteOne();
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
