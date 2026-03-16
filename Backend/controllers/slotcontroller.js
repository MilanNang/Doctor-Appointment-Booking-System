import { resolveAvailability } from "../services/availabilityService.js";
import Appointment from "../models/Appointment.js";

export const getSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    const generated = await resolveAvailability(doctorId, date);
    const bookedAppointments = await Appointment.find({
      doctorId,
      date,
      status: { $nin: ["cancelled", "rejected", "no-show"] }
    }).select("time");

    const bookedTimes = new Set(bookedAppointments.map((item) => item.time));

    const slots = generated
      .map((slot) => {
        const startTime = typeof slot === "string" ? slot : slot.startTime;
        return {
          _id: `${doctorId}|${date}|${startTime}`,
          doctorId,
          date,
          startTime,
          endTime: typeof slot === "string" ? undefined : slot.endTime,
          isBooked: bookedTimes.has(startTime)
        };
      })
      .filter((slot) => !slot.isBooked);

    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
