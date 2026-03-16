import Appointment from "../models/Appointment.js";
import { getDoctorByUserId } from "./userService.js";

export const createAuditLog = async ({ appointmentId, actorId, actorRole, action, fromStatus = "", toStatus = "", metadata = {} }) => {
  await Appointment.findByIdAndUpdate(appointmentId, {
    $push: {
      auditTrail: {
        actorId,
        actorRole,
        action,
        fromStatus,
        toStatus,
        metadata,
        createdAt: new Date()
      }
    }
  });
};

export const findAppointmentForPatient = async (appointmentId, patientId, populateConfig = []) => {
  let query = Appointment.findOne({ _id: appointmentId, patient: patientId });
  for (const populateItem of populateConfig) {
    query = query.populate(populateItem);
  }
  return query;
};

export const findAppointmentById = async (appointmentId, populateConfig = []) => {
  let query = Appointment.findById(appointmentId);
  for (const populateItem of populateConfig) {
    query = query.populate(populateItem);
  }
  return query;
};

export const releaseSlotIfExists = async (slotId) => {
  return;
};

export const lockSlotOrThrow = async (slotId) => {
  if (!slotId || typeof slotId !== "string") {
    const error = new Error("Selected slot is unavailable");
    error.statusCode = 400;
    throw error;
  }

  const [doctorId, date, startTime] = slotId.split("|");
  if (!doctorId || !date || !startTime) {
    const error = new Error("Selected slot is unavailable");
    error.statusCode = 400;
    throw error;
  }

  const exists = await Appointment.findOne({
    doctorId,
    date,
    time: startTime,
    status: { $nin: ["cancelled", "rejected", "no-show"] }
  });

  if (exists) {
    const error = new Error("Selected slot is unavailable");
    error.statusCode = 400;
    throw error;
  }

  return { _id: slotId, doctorId, date, startTime };
};

export const ensureDoctorOwnsAppointment = async (userId, appointment) => {
  const doctorDoc = await getDoctorByUserId(userId);
  if (!doctorDoc) {
    return { error: "Doctor profile not found" };
  }

  const appointmentDoctorId =
    appointment?.doctorId ||
    appointment?.doctor?._id ||
    appointment?.doctor;

  if (!appointmentDoctorId || String(doctorDoc._id) !== String(appointmentDoctorId)) {
    return { error: "Unauthorized appointment access" };
  }

  return { doctorDoc };
};
