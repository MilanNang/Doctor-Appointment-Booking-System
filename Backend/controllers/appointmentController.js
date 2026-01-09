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
      .populate({
        path: "doctor",
        select: "specialization fees user",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .populate("patient", "name email")
      .sort({ date: -1, time: 1 });

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
    // 1️⃣ Find doctor document using logged-in USER ID
    const doctorDoc = await Doctor.findOne({ user: req.user._id });

    if (!doctorDoc) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    // 2️⃣ Find appointments linked to DOCTOR DOCUMENT ID with proper population
    const appointments = await Appointment.find({ doctor: doctorDoc._id })
      .populate("patient", "name email")
      .populate({
        path: "doctor",
        select: "specialization fees user",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .sort({ date: -1, time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🧑‍💼 Admin - get all appointments
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: "doctor",
        select: "specialization fees user",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .populate("patient", "name email")
      .sort({ date: -1, time: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Doctor approves or cancels appointment
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ["pending", "approved", "cancelled", "completed", "rescheduled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email")
      .populate({
        path: "doctor",
        select: "user",
        populate: {
          path: "user",
          select: "name email"
        }
      });

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Update status
    appointment.status = status;
    await appointment.save();

    // Send notification email to patient
    try {
      if (status === "approved" || status === "cancelled") {
        await sendEmail(
          appointment.patient.email,
          `Appointment ${status === "approved" ? "Approved" : "Cancelled"}`,
          `<h2>Hi ${appointment.patient.name},</h2>
           <p>Your appointment with <strong>Dr. ${appointment.doctor.user?.name}</strong> has been <b>${status}</b>.</p>
           <p>Date: ${appointment.date}</p>
           <p>Time: ${appointment.time}</p>`
        );
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    res.json({ message: "Status updated successfully", appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};