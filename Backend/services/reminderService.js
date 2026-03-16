import Appointment from "../models/Appointment.js";
import { sendEmail } from "../utils/sendEmail.js";
import { parseAppointmentDateTime } from "../utils/appointmentDateTime.js";
import { APPOINTMENT_STATUS } from "../utils/appointmentStatus.js";

const shouldSend = (hoursLeft, type) => {
  if (type === "24h") return hoursLeft <= 24 && hoursLeft > 23;
  if (type === "2h") return hoursLeft <= 2 && hoursLeft > 1;
  return false;
};

const pushReminderHistory = (appointment, type, channel = "status") => {
  appointment.reminderHistory.push({ type, sentAt: new Date(), channel });
  if (type === "24h") appointment.reminderSent.before24h = true;
  if (type === "2h") appointment.reminderSent.before2h = true;
};

export const processAppointmentReminders = async () => {
  const appointments = await Appointment.find({
    status: APPOINTMENT_STATUS.APPROVED,
    date: { $ne: null },
    time: { $ne: null }
  })
    .populate("patient", "name email")
    .populate({ path: "doctor", select: "user", populate: { path: "user", select: "name" } });

  for (const appointment of appointments) {
    const appointmentDate = parseAppointmentDateTime(appointment.date, appointment.time);
    if (!appointmentDate) continue;

    const hoursLeft = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursLeft <= 0) continue;

    const reminderTargets = [
      { type: "24h", sent: appointment.reminderSent?.before24h },
      { type: "2h", sent: appointment.reminderSent?.before2h }
    ];

    for (const target of reminderTargets) {
      if (target.sent || !shouldSend(hoursLeft, target.type)) continue;

      const message =
        target.type === "24h"
          ? `Reminder: You have an appointment with Dr. ${appointment.doctor?.user?.name || "Doctor"} tomorrow at ${appointment.time}.`
          : `Reminder: Your appointment with Dr. ${appointment.doctor?.user?.name || "Doctor"} is in 2 hours at ${appointment.time}.`;

      pushReminderHistory(appointment, target.type, "status");

      try {
        if (appointment.patient?.email) {
          await sendEmail(
            appointment.patient.email,
            "Appointment Reminder",
            `<p>${message}</p><p>Date: ${appointment.date}</p><p>Time: ${appointment.time}</p>`
          );
        }
      } catch (error) {
        console.error("Email reminder failed:", error.message);
      }

      await appointment.save();
    }
  }
};
