import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // linked to User
  specialization: { type: String, required: true },
  experience: { type: Number, required: true }, // in years
  fees: { type: Number, required: true },
  availability: [
    {
      day: { type: String }, // e.g. Monday, Tuesday
      slots: [{ type: String }] // e.g. "10:00 AM - 11:00 AM"
    }
  ],
  about: { type: String },
  location: { type: String },
  isApproved: { type: Boolean, default: false } // for admin approval
}, { timestamps: true });

export default mongoose.model("Doctor", doctorSchema);
