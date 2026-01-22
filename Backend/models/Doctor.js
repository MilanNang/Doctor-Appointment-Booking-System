import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialization: {
    type: String,
    default: "",
  },
  experience: {
    type: Number,
    default: 0,
  },
  fees: {
    type: Number,
    default: 0,
  },
  about: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  profileImage: {
    type: String,
    default: "",
  },
  availability: {
    type: Object,
    default: {},
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Doctor", doctorSchema);
