import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },   // e.g. "2025-10-05"
  time: { type: String, required: true },   // e.g. "10:00 AM"
 status: {
  type: String,
  enum: ["pending", "approved", "cancelled", "completed", "rescheduled"], // ✅ added
  default: "pending"
}
,
  paymentStatus: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
