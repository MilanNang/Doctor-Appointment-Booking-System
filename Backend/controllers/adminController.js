import User from "../models/User.js";
import Doctor from "../models/Doctor.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";

export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("user", "name email role");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

export const getPendingDoctorRequests = async (req, res) => {
  try {
    const requests = await Doctor.find({ status: "pending" })
      .populate("user", "name email age mobileNumber residentialAddress")
      .sort({ updatedAt: -1 });

    const response = requests.map((doctor) => ({
      _id: doctor._id,
      fullName: doctor.user?.name || "",
      age: doctor.user?.age || 0,
      email: doctor.user?.email || "",
      mobileNumber: doctor.user?.mobileNumber || "",
      residentialAddress: doctor.user?.residentialAddress || "",
      medicalQualification: doctor.medicalQualification || "",
      specialization: doctor.specialization || "",
      medicalRegistrationId: doctor.medicalRegistrationId || "",
      yearsOfExperience: doctor.yearsOfExperience || 0,
      hospitalClinicName: doctor.hospitalClinicName || "",
      hospitalClinicAddress: doctor.hospitalClinicAddress || "",
      fees: doctor.fees || 0,
      status: doctor.status,
      submittedAt: doctor.updatedAt,
      rejectionReason: doctor.rejectionReason || ""
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getPendingDoctorRequests:", error);
    res.status(500).json({ error: error.message || "Failed to fetch requests" });
  }
};

export const getDoctorRequestById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("user", "name email age mobileNumber residentialAddress");

    if (!doctor) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({
      _id: doctor._id,
      fullName: doctor.user?.name || "",
      age: doctor.user?.age || 0,
      email: doctor.user?.email || "",
      mobileNumber: doctor.user?.mobileNumber || "",
      residentialAddress: doctor.user?.residentialAddress || "",
      medicalQualification: doctor.medicalQualification || "",
      specialization: doctor.specialization || "",
      medicalRegistrationId: doctor.medicalRegistrationId || "",
      yearsOfExperience: doctor.yearsOfExperience || 0,
      hospitalClinicName: doctor.hospitalClinicName || "",
      hospitalClinicAddress: doctor.hospitalClinicAddress || "",
      fees: doctor.fees || 0,
      status: doctor.status,
      submittedAt: doctor.updatedAt,
      rejectionReason: doctor.rejectionReason || ""
    });
  } catch (error) {
    console.error("Error in getDoctorRequestById:", error);
    res.status(500).json({ error: error.message || "Failed to fetch request" });
  }
};

export const approveDoctorRequest = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user");

    if (!doctor) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (doctor.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    const user = doctor.user;
    if (!user) {
      return res.status(404).json({ message: "Linked user not found" });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

    user.password = hashedTempPassword;
    user.role = "doctor";
    user.isVerified = true;
    user.isApproved = true;
    user.mustResetPassword = true;
    user.tempPassword = hashedTempPassword;
    user.isFirstLogin = false;
    await user.save();

    doctor.status = "approved";
    doctor.reviewedAt = new Date();
    doctor.reviewedBy = req.user._id;
    doctor.rejectionReason = "";
    await doctor.save();

    const loginUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`;
    const approvalEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Doctor Account Approved</h2>
        <p>Dear ${user.name},</p>
        <p>Congratulations! Your doctor registration request has been approved.</p>
        <p>Your account has been created. Please use the following credentials to log in:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 3px;">${tempPassword}</code></p>
        </div>
        <p><strong>Important:</strong> You will be required to reset your password on first login.</p>
        <p>
          <a href="${loginUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">
            Login to Your Account
          </a>
        </p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>Doctor Appointment System Admin</p>
      </div>
    `;

    try {
      await sendEmail(user.email, "Doctor Account Approved", approvalEmailHtml);
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    res.status(200).json({
      message: "Doctor approved successfully",
      doctor: {
        _id: doctor._id,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error("Error in approveDoctorRequest:", error);
    res.status(500).json({ error: error.message || "Failed to approve doctor" });
  }
};

export const rejectDoctorRequest = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim() === "") {
      return res.status(400).json({ message: "Rejection reason is required" });
    }

    const doctor = await Doctor.findById(req.params.id).populate("user");

    if (!doctor) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (doctor.status !== "pending") {
      return res.status(400).json({ message: "Request is not pending" });
    }

    doctor.status = "rejected";
    doctor.rejectionReason = rejectionReason;
    doctor.reviewedAt = new Date();
    doctor.reviewedBy = req.user._id;
    await doctor.save();

    const rejectionEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">Doctor Registration Request Update</h2>
        <p>Dear ${doctor.user?.name || "Doctor"},</p>
        <p>We regret to inform you that your doctor registration request has been reviewed and unfortunately, we are unable to approve it at this time.</p>
        <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f44336;">
          <p><strong>Reason for Rejection:</strong></p>
          <p>${rejectionReason}</p>
        </div>
        <p>We apologize for any inconvenience this may cause. If you believe this is an error or would like to provide additional information, please feel free to contact our support team.</p>
        <p>Thank you for your interest in joining our platform.</p>
        <p>Best regards,<br>Doctor Appointment System Admin</p>
      </div>
    `;

    try {
      if (doctor.user?.email) {
        await sendEmail(doctor.user.email, "Doctor Registration Request Update", rejectionEmailHtml);
      }
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    res.status(200).json({
      message: "Doctor request rejected successfully",
      requestId: doctor._id
    });
  } catch (error) {
    console.error("Error in rejectDoctorRequest:", error);
    res.status(500).json({ error: error.message || "Failed to reject doctor request" });
  }
};
