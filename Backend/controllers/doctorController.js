import Doctor from "../models/Doctor.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import {bookAppointment, getPatientAppointments} from './appointmentController.js'
import Appointment from "../models/Appointment.js";

// Create or update doctor profile

// Create or update doctor profile
export const createOrUpdateDoctor = async (req, res) => {
  try {
    console.log("=== Doctor Profile Update ===");
    console.log("User:", req.user);
    console.log("Body:", req.body);
    console.log("File:", req.file ? `${req.file.originalname} (${req.file.size} bytes)` : "No file");

    // Check if user exists
    if (!req.user || !req.user._id) {
      console.error("❌ No user found in request");
      return res.status(401).json({ error: "Unauthorized: No user" });
    }

    const { specialization, experience, fees, availability, about, location } = req.body;

    let doctor = await Doctor.findOne({ user: req.user._id });

    if (doctor) {
      // Update existing
      console.log("📝 Updating existing doctor");
      
      if (specialization) doctor.specialization = typeof specialization === 'string' ? specialization.trim() : specialization;
      if (experience) doctor.experience = Number(experience);
      if (fees) doctor.fees = Number(fees);
      if (about) doctor.about = about;
      if (location) doctor.location = location;
      
      if (availability) {
        try {
          doctor.availability = typeof availability === "string" ? JSON.parse(availability) : availability;
        } catch (e) {
          console.log("⚠️  Could not parse availability, skipping");
          doctor.availability = {};
        }
      }

      // Handle image upload if present
      if (req.file) {
        try {
          console.log("📤 Uploading image to Cloudinary...");
          const imageUrl = await uploadToCloudinary(req.file.buffer);
          doctor.profileImage = imageUrl;
          console.log("✅ Image uploaded:", imageUrl);
        } catch (imgErr) {
          console.error("⚠️ Image upload failed:", imgErr.message);
          // Continue without image
        }
      }

      const savedDoctor = await doctor.save();
      console.log("✅ Doctor profile saved");
      return res.json({ message: "Doctor profile updated", doctor: savedDoctor });
    } else {
      // Create new
      console.log("➕ Creating new doctor profile");
      
      doctor = new Doctor({
        user: req.user._id,
        specialization: typeof specialization === 'string' ? specialization.trim() : (specialization || ""),
        experience: Number(experience) || 0,
        fees: Number(fees) || 0,
        about: about || "",
        location: location || "",
        availability: {},
      });

      if (availability) {
        try {
          doctor.availability = typeof availability === "string" ? JSON.parse(availability) : availability;
        } catch (e) {
          doctor.availability = {};
        }
      }

      // Handle image upload if present
      if (req.file) {
        try {
          console.log("📤 Uploading image to Cloudinary...");
          const imageUrl = await uploadToCloudinary(req.file.buffer);
          doctor.profileImage = imageUrl;
          console.log("✅ Image uploaded:", imageUrl);
        } catch (imgErr) {
          console.error("⚠️ Image upload failed:", imgErr.message);
          // Continue without image
        }
      }

      const savedDoctor = await doctor.save();
      console.log("✅ Doctor profile created");
      return res.json({ message: "Doctor profile created", doctor: savedDoctor });
    }
  } catch (error) {
    console.error("❌ Error in createOrUpdateDoctor:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ error: error.message || "Failed to save doctor profile" });
  }
};

// Update availability
export const updateAvailability = async (req, res) => {
  const { availability } = req.body;
  const userId = req.user._id; // user id from auth middleware

  try {
    // find doctor by user reference
    const doctor = await Doctor.findOneAndUpdate(
      { user: userId },
      { availability },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    res.json({ success: true, availability: doctor.availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update availability", error: err.message });
  }
};



export const getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(200).json({
        totalEarnings: 0,
        thisMonthEarnings: 0,
        appointmentsCount: 0,
        activePatients: 0,
        recentBookings: [],
        averageRating: "0.0",
        appointmentSuccessRate: 0,
        avgResponseTime: 24
      });
    }

    const appointments = (await Appointment.find({ doctor: doctor._id })
      .populate("patient", "name email")) || [];

    const totalEarnings = appointments.reduce((acc, a) => acc + (a?.fees || 0), 0);

    const currentMonth = new Date().getMonth();
    const thisMonthEarnings = appointments
      .filter(a => a?.date && !isNaN(new Date(a.date)))
      .filter(a => new Date(a.date).getMonth() === currentMonth)
      .reduce((acc, a) => acc + (a?.fees || 0), 0);

    const appointmentsCount = appointments.length || 0;

    const activePatients = [...new Set(
      appointments.map(a => a?.patient?._id?.toString()).filter(Boolean)
    )].length || 0;

    const recentBookings = appointments
      .sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0))
      .slice(0, 5)
      .map(a => ({
        patient: a?.patient?.name || "N/A",
        service: a?.serviceName || "Consultation",
        date: a?.date || "N/A",
        status: a?.status || "pending",
        price: a?.fees || 0,
      })) || [];

    const averageRating = doctor?.ratings?.length
      ? doctor.ratings.reduce((acc, r) => acc + (r || 0), 0) / doctor.ratings.length
      : 0;

    const appointmentSuccessRate = appointmentsCount
      ? Math.round(
          (appointments.filter(a => a?.status === "confirmed").length || 0) / appointmentsCount * 100
        )
      : 0;

    const avgResponseTime = doctor?.avgResponseTime || 24;

    return res.status(200).json({
      totalEarnings,
      thisMonthEarnings,
      appointmentsCount,
      activePatients,
      recentBookings,
      averageRating: averageRating.toFixed(1) || "0.0",
      appointmentSuccessRate,
      avgResponseTime,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    // return safe defaults instead of 500
    return res.status(200).json({
      totalEarnings: 0,
      thisMonthEarnings: 0,
      appointmentsCount: 0,
      activePatients: 0,
      recentBookings: [],
      averageRating: "0.0",
      appointmentSuccessRate: 0,
      avgResponseTime: 24
    });
  }
};







// Get all approved doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("user", "name email");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user", "name email");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




