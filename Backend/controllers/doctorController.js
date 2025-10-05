import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

// @desc   Create or update doctor profile
export const createOrUpdateDoctor = async (req, res) => {
  try {
    const { specialization, experience, fees, availability, about, location } = req.body;

    let doctor = await Doctor.findOne({ user: req.user._id });

    if (doctor) {
      // update profile
      doctor.specialization = specialization || doctor.specialization;
      doctor.experience = experience || doctor.experience;
      doctor.fees = fees || doctor.fees;
      doctor.availability = availability || doctor.availability;
      doctor.about = about || doctor.about;
      doctor.location = location || doctor.location;

      await doctor.save();
      return res.json({ message: "Doctor profile updated", doctor });
    } else {
      // create profile
      doctor = await Doctor.create({
        user: req.user._id,
        specialization,
        experience,
        fees,
        availability,
        about,
        location
      });
      return res.json({ message: "Doctor profile created", doctor });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: true }).populate("user", "name email");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate("user", "name email");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc   Update availability
export const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });

    doctor.availability = availability;
    await doctor.save();

    res.json({ message: "Availability updated", doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
