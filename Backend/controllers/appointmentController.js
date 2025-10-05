import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/User.js";

// 🩺 Book Appointment
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time } = req.body;

    console.log("📅 Booking appointment:", { doctorId, date, time, userId: req.user?._id });

    // 🩻 Find doctor + linked user
    const doctor = await Doctor.findById(doctorId).populate("user", "name email");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // 🧍 Find patient
    const patient = await User.findById(req.user._id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    if (!doctor.user) {
      console.warn("⚠️ Doctor has no linked user record");
      return res.status(400).json({ message: "Doctor user link missing in database" });
    }

    // 📅 Create appointment
    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: req.user._id,
      date,
      time,
      status: "pending",
      fees: doctor.fees || 0,
    });

    console.log("✅ Appointment created:", appointment._id);

    // ✉️ Send emails
    try {
      console.log("📧 Sending emails...");

      const doctorName = doctor.user?.name || "Doctor";
      const patientName = patient.name || "Patient";

      await sendEmail(
        patient.email,
        "Appointment Booked Successfully",
        `<h2>Hi ${patientName},</h2>
         <p>Your appointment with <strong>Dr. ${doctorName}</strong> is booked on <b>${date}</b> at <b>${time}</b>.</p>
         <p>Status: <b>${appointment.status}</b></p>`
      );

      await sendEmail(
        doctor.user.email,
        "New Appointment Alert",
        `<h2>New Appointment Booked!</h2>
         <p>Patient: ${patientName}</p>
         <p>Date: ${date}</p>
         <p>Time: ${time}</p>`
      );

      console.log("✅ Emails sent successfully");
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
    }

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🧾 Get patient's own appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate("doctor", "specialization fees")
      .populate("patient", "name email");

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ Cancel appointment
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.status = "cancelled";
    await appointment.save();

    res.json({ message: "Appointment cancelled successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔁 Reschedule appointment
export const rescheduleAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    appointment.date = date;
    appointment.time = time;
    appointment.status = "rescheduled";
    await appointment.save();

    res.json({ message: "Appointment rescheduled successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 👨‍⚕️ Doctor - get all appointments for logged-in doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate("patient", "name email")
      .populate("doctor", "specialization");

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🧑‍💼 Admin - get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctor", "specialization")
      .populate("patient", "name email");

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
