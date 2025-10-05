import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  start: String,
  end: String,
  duration: Number,
});

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true, // important!
  },
  name: String,
  specialization: String,
  hospital: String,
  experience: Number,
  fees: Number,
  contact: String,
  about: String,
  profileImage: String,
  availability: {
    Sunday: [slotSchema],
    Monday: [slotSchema],
    Tuesday: [slotSchema],
    Wednesday: [slotSchema],
    Thursday: [slotSchema],
    Friday: [slotSchema],
    Saturday: [slotSchema],
  },
});

export default mongoose.model("Doctor", doctorSchema);
