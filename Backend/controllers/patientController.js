import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

// @desc   Get all approved doctors (browse/search)
export const getAllDoctors = async (req, res) => {
  try {
    const { specialization, location } = req.query;

    let query = { isApproved: true };
    if (specialization) query.specialization = specialization;
    if (location) query.location = location;

    const doctors = await Doctor.find(query).populate("user", "name email");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get doctor details
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user", "name email");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Book appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    // check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // check if slot is already taken
    const existing = await Appointment.findOne({ doctor: doctorId, date, time, status: "booked" });
    if (existing) return res.status(400).json({ message: "This slot is already booked" });

    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: req.user._id,
      date,
      time
    });

    res.json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get logged-in patient’s appointments
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate("doctor", "specialization location fees")
      .populate("patient", "name email");
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
