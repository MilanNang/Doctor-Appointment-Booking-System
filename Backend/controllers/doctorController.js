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

    // Get User model to update personal info
    const User = (await import("../models/User.js")).default;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Extract all fields from request body
    const {
      // Personal Information
      fullName,
      mobileNumber,
      address,
      
      // Professional Information
      medicalQualification,
      specialization,
      yearsOfExperience,
      hospitalClinicName,
      hospitalClinicAddress,
      consultationFeesOnline,
      consultationFeesOffline,
      
      // Legacy fields (for backward compatibility)
      experience,
      fees,
      availability,
      about,
      location,
    } = req.body;

    let doctor = await Doctor.findOne({ user: req.user._id });

    if (doctor) {
      // Update existing doctor profile
      console.log("📝 Updating existing doctor");
      
      // Update personal information in User model
      if (fullName) user.name = fullName.trim();
      if (mobileNumber !== undefined) user.mobileNumber = mobileNumber.trim();
      if (address !== undefined) user.residentialAddress = address.trim();
      await user.save();

      // Update professional information in Doctor model
      if (medicalQualification !== undefined) doctor.medicalQualification = medicalQualification.trim();
      if (specialization !== undefined) doctor.specialization = typeof specialization === 'string' ? specialization.trim() : specialization;
      if (yearsOfExperience !== undefined) {
        doctor.yearsOfExperience = Number(yearsOfExperience);
        doctor.experience = Number(yearsOfExperience); // Legacy field
      }
      if (hospitalClinicName !== undefined) doctor.hospitalClinicName = hospitalClinicName.trim();
      if (hospitalClinicAddress !== undefined) doctor.hospitalClinicAddress = hospitalClinicAddress.trim();
      if (consultationFeesOnline !== undefined) doctor.consultationFeesOnline = Number(consultationFeesOnline);
      if (consultationFeesOffline !== undefined) {
        doctor.consultationFeesOffline = Number(consultationFeesOffline);
        doctor.fees = Number(consultationFeesOffline); // Legacy field
      }
      
      // Legacy fields
      if (experience !== undefined) {
        doctor.experience = Number(experience);
        doctor.yearsOfExperience = Number(experience);
      }
      if (fees !== undefined) {
        doctor.fees = Number(fees);
        doctor.consultationFeesOffline = Number(fees);
      }
      if (about !== undefined) doctor.about = about;
      if (location !== undefined) {
        doctor.location = location;
        if (!doctor.hospitalClinicAddress) doctor.hospitalClinicAddress = location;
      }
      
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
      
      // Audit log: Profile updated
      console.log(`[AUDIT] Doctor profile updated - User ID: ${req.user._id}, Doctor ID: ${savedDoctor._id}, Timestamp: ${new Date().toISOString()}`);
      
      // Return combined profile data
      const profileData = {
        fullName: user.name,
        email: user.email,
        age: user.age || "",
        mobileNumber: user.mobileNumber || "",
        address: user.residentialAddress || "",
        medicalQualification: savedDoctor.medicalQualification || "",
        specialization: savedDoctor.specialization || "",
        medicalRegistrationId: savedDoctor.medicalRegistrationId || "",
        yearsOfExperience: savedDoctor.yearsOfExperience || 0,
        hospitalClinicName: savedDoctor.hospitalClinicName || "",
        hospitalClinicAddress: savedDoctor.hospitalClinicAddress || "",
        consultationFeesOnline: savedDoctor.consultationFeesOnline || 0,
        consultationFeesOffline: savedDoctor.consultationFeesOffline || 0,
        profileImage: savedDoctor.profileImage || "",
        status: savedDoctor.status || "pending",
        experience: savedDoctor.experience || savedDoctor.yearsOfExperience || 0,
        fees: savedDoctor.fees || savedDoctor.consultationFeesOffline || 0,
        about: savedDoctor.about || "",
        location: savedDoctor.location || savedDoctor.hospitalClinicAddress || "",
        availability: savedDoctor.availability || {},
      };
      
      return res.json({ message: "Doctor profile updated", doctor: profileData });
    } else {
      // Create new doctor profile
      console.log("➕ Creating new doctor profile");
      
      // Update user personal info if provided
      if (fullName) user.name = fullName.trim();
      if (mobileNumber !== undefined) user.mobileNumber = mobileNumber.trim();
      if (address !== undefined) user.residentialAddress = address.trim();
      await user.save();
      
      doctor = new Doctor({
        user: req.user._id,
        medicalQualification: medicalQualification ? medicalQualification.trim() : "",
        specialization: typeof specialization === 'string' ? specialization.trim() : (specialization || ""),
        yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : (experience ? Number(experience) : 0),
        hospitalClinicName: hospitalClinicName ? hospitalClinicName.trim() : "",
        hospitalClinicAddress: hospitalClinicAddress ? hospitalClinicAddress.trim() : "",
        consultationFeesOnline: consultationFeesOnline ? Number(consultationFeesOnline) : 0,
        consultationFeesOffline: consultationFeesOffline ? Number(consultationFeesOffline) : (fees ? Number(fees) : 0),
        experience: experience ? Number(experience) : (yearsOfExperience ? Number(yearsOfExperience) : 0),
        fees: fees ? Number(fees) : (consultationFeesOffline ? Number(consultationFeesOffline) : 0),
        about: about || "",
        location: location || (hospitalClinicAddress ? hospitalClinicAddress.trim() : ""),
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
      
      // Audit log: Profile created
      console.log(`[AUDIT] Doctor profile created - User ID: ${req.user._id}, Doctor ID: ${savedDoctor._id}, Timestamp: ${new Date().toISOString()}`);
      
      // Return combined profile data
      const profileData = {
        fullName: user.name,
        email: user.email,
        age: user.age || "",
        mobileNumber: user.mobileNumber || "",
        address: user.residentialAddress || "",
        medicalQualification: savedDoctor.medicalQualification || "",
        specialization: savedDoctor.specialization || "",
        medicalRegistrationId: savedDoctor.medicalRegistrationId || "",
        yearsOfExperience: savedDoctor.yearsOfExperience || 0,
        hospitalClinicName: savedDoctor.hospitalClinicName || "",
        hospitalClinicAddress: savedDoctor.hospitalClinicAddress || "",
        consultationFeesOnline: savedDoctor.consultationFeesOnline || 0,
        consultationFeesOffline: savedDoctor.consultationFeesOffline || 0,
        profileImage: savedDoctor.profileImage || "",
        status: savedDoctor.status || "pending",
        experience: savedDoctor.experience || savedDoctor.yearsOfExperience || 0,
        fees: savedDoctor.fees || savedDoctor.consultationFeesOffline || 0,
        about: savedDoctor.about || "",
        location: savedDoctor.location || savedDoctor.hospitalClinicAddress || "",
        availability: savedDoctor.availability || {},
      };
      
      return res.json({ message: "Doctor profile created", doctor: profileData });
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
    // Only return approved doctors with approved users
    const doctors = await Doctor.find({ status: "approved" })
      .populate({
        path: "user",
        match: { isApproved: true, isVerified: true },
        select: "name email"
      });
    
    // Filter out doctors where user is null (not approved)
    const approvedDoctors = doctors.filter(doc => doc.user !== null);
    
    res.json(approvedDoctors);
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

// Get complete doctor profile (for profile page)
export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate("user", "name email age mobileNumber residentialAddress");
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor profile not found" });
    }

    // Combine User and Doctor data
    const profileData = {
      // Personal Information (from User)
      fullName: doctor.user.name,
      email: doctor.user.email,
      age: doctor.user.age || "",
      mobileNumber: doctor.user.mobileNumber || "",
      address: doctor.user.residentialAddress || "",
      
      // Professional Information (from Doctor)
      medicalQualification: doctor.medicalQualification || "",
      specialization: doctor.specialization || "",
      medicalRegistrationId: doctor.medicalRegistrationId || "",
      yearsOfExperience: doctor.yearsOfExperience || 0,
      hospitalClinicName: doctor.hospitalClinicName || "",
      hospitalClinicAddress: doctor.hospitalClinicAddress || "",
      consultationFeesOnline: doctor.consultationFeesOnline || 0,
      consultationFeesOffline: doctor.consultationFeesOffline || 0,
      
      // Profile Image
      profileImage: doctor.profileImage || "",
      
      // Status
      status: doctor.status || "pending",
      
      // Legacy fields for backward compatibility
      experience: doctor.experience || doctor.yearsOfExperience || 0,
      fees: doctor.fees || doctor.consultationFeesOffline || 0,
      about: doctor.about || "",
      location: doctor.location || doctor.hospitalClinicAddress || "",
      availability: doctor.availability || {},
    };

    res.json(profileData);
  } catch (error) {
    console.error("Error in getDoctorProfile:", error);
    res.status(500).json({ error: error.message || "Failed to fetch doctor profile" });
  }
};




