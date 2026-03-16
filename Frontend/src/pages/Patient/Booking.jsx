import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Download, Star } from "lucide-react";
import API from "../util/api";
import { showToast } from "../../Redux/toastSlice";
import ConfirmDialog from "../../Componet/ConfirmDialog";
import DoctorAvatar from "../../Componet/DoctorAvatar";
import { getSocket } from "../../utils/socket";

const FLOW = ["pending", "approved", "arrived", "consultation-started", "consultation-completed"];

export default function MyAppointments() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, appointmentId: null, action: null });
  const [reviewModal, setReviewModal] = useState({ open: false, appointmentId: null, rating: 5, comment: "" });
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const loadAppointments = async () => {
    try {
      const [appointmentsRes, remindersRes] = await Promise.all([
        API.get("/appointments/my"),
        API.get("/appointments/my/reminders")
      ]);
      setAppointments(appointmentsRes.data || []);
      setReminders(remindersRes.data || []);
    } catch (err) {
      dispatch(showToast({ message: err.response?.data?.message || "Failed to load appointments", type: "error" }));
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadAppointments();
      setLoading(false);
    };

    init();

    const socket = getSocket();
    socket.on("appointmentStatusUpdate", loadAppointments);
    return () => socket.off("appointmentStatusUpdate", loadAppointments);
  }, []);

  const canShowCheckIn = (appointment) => {
    if (appointment.status !== "approved") return false;
    if (appointment.checkInTime) return false;

    const now = new Date();
    const apDate = new Date(`${appointment.date} ${appointment.time}`);
    const sameDay = now.toDateString() === new Date(appointment.date).toDateString();
    const oneHourBefore = new Date(apDate.getTime() - 60 * 60 * 1000);

    return sameDay && now >= oneHourBefore;
  };

  const timeline = (status) => {
    const index = FLOW.indexOf(status);
    return (
      <div className="flex items-center gap-1 mt-2 overflow-x-auto">
        {FLOW.map((item, idx) => (
          <div key={item} className="flex items-center gap-1">
            <span className={`text-[10px] px-2 py-1 rounded-full whitespace-nowrap ${idx <= index ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
              {item.replaceAll("-", " ")}
            </span>
            {idx < FLOW.length - 1 && <span className="text-gray-300">→</span>}
          </div>
        ))}
      </div>
    );
  };

  const stats = useMemo(() => {
    return {
      pending: appointments.filter((a) => a.status === "pending").length,
      approved: appointments.filter((a) => a.status === "approved").length,
      completed: appointments.filter((a) => ["consultation-completed", "completed"].includes(a.status)).length
    };
  }, [appointments]);

  const markArrived = async (id) => {
    try {
      await API.put(`/appointments/${id}/check-in`);
      dispatch(showToast({ message: "Checked in successfully", type: "success" }));
      loadAppointments();
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || "Check-in failed", type: "error" }));
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await API.put(`/appointments/${id}/cancel`);
      dispatch(showToast({ message: "Appointment cancelled", type: "success" }));
      loadAppointments();
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || "Cancellation failed", type: "error" }));
    }
  };

  const viewPrescription = async (id) => {
    try {
      const { data } = await API.get(`/appointments/${id}/prescription`);
      setSelectedPrescription(data);
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || "Prescription not found", type: "error" }));
    }
  };

  const downloadPrescription = async (id) => {
    try {
      const response = await API.get(`/appointments/${id}/prescription/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `prescription-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || "Download failed", type: "error" }));
    }
  };

  const submitReview = async () => {
    try {
      await API.post(`/appointments/${reviewModal.appointmentId}/review`, {
        rating: reviewModal.rating,
        comment: reviewModal.comment
      });
      dispatch(showToast({ message: "Review submitted", type: "success" }));
      setReviewModal({ open: false, appointmentId: null, rating: 5, comment: "" });
      loadAppointments();
    } catch (error) {
      dispatch(showToast({ message: error.response?.data?.message || "Review submit failed", type: "error" }));
    }
  };

  if (loading) return <div className="p-6 text-center">Loading appointments...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-900">My Appointments</h1>

        {reminders.length > 0 && (
          <div className="bg-white border border-blue-200 rounded-xl p-4">
            <h2 className="text-blue-800 font-semibold">Appointment Reminders</h2>
            <div className="mt-3 space-y-2">
              {reminders.slice(0, 5).map((item) => {
                const latest = item.reminderHistory?.[item.reminderHistory.length - 1];
                return (
                  <div key={item._id} className="text-sm text-blue-700 bg-blue-50 rounded-lg p-2">
                    Dr. {item.doctor?.user?.name || "Doctor"} on {item.date} at {item.time} ({latest?.type || "reminder"})
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl border border-blue-100 text-center"><p className="text-2xl font-bold text-amber-600">{stats.pending}</p><p className="text-xs text-gray-500">Pending</p></div>
          <div className="bg-white p-4 rounded-xl border border-blue-100 text-center"><p className="text-2xl font-bold text-blue-600">{stats.approved}</p><p className="text-xs text-gray-500">Approved</p></div>
          <div className="bg-white p-4 rounded-xl border border-blue-100 text-center"><p className="text-2xl font-bold text-green-600">{stats.completed}</p><p className="text-xs text-gray-500">Completed</p></div>
        </div>

        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm">
              <div className="flex gap-4 items-start">
                <DoctorAvatar doctor={appt.doctor} size="w-14 h-14" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Dr. {appt.doctor?.user?.name || "Doctor"}</p>
                      <p className="text-sm text-blue-700">{appt.doctor?.specialization || "Specialist"}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">{appt.status}</span>
                  </div>

                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{appt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{appt.time}</span>
                  </div>

                  {timeline(appt.status)}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {canShowCheckIn(appt) && (
                      <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm" onClick={() => markArrived(appt._id)}>
                        Mark as Arrived
                      </button>
                    )}

                    {appt.status === "approved" && (
                      <button className="px-3 py-2 border border-red-300 text-red-700 rounded-lg text-sm" onClick={() => setConfirmDialog({ isOpen: true, appointmentId: appt._id, action: "cancel" })}>
                        Cancel
                      </button>
                    )}

                    {["consultation-completed", "completed"].includes(appt.status) && (
                      <>
                        <button className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm" onClick={() => viewPrescription(appt._id)}>
                          View Prescription
                        </button>
                        <button className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm flex items-center gap-1" onClick={() => downloadPrescription(appt._id)}>
                          <Download className="w-4 h-4" /> PDF
                        </button>
                        <button
                          className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm"
                          onClick={() => navigate(`/patient/browse-services?doctorId=${appt.doctor?._id}&followUpOf=${appt._id}`)}
                        >
                          Book Follow-up
                        </button>
                        {!appt.review && (
                          <button className="px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm" onClick={() => setReviewModal({ open: true, appointmentId: appt._id, rating: 5, comment: "" })}>
                            Rate & Feedback
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment?"
        confirmText="Cancel Appointment"
        isDangerous
        onConfirm={() => {
          cancelAppointment(confirmDialog.appointmentId);
          setConfirmDialog({ isOpen: false, appointmentId: null, action: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, appointmentId: null, action: null })}
      />

      {selectedPrescription && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl p-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-blue-900">Prescription (Version {selectedPrescription.version})</h3>
            <p className="mt-3 text-sm"><strong>Diagnosis:</strong> {selectedPrescription.diagnosis}</p>
            <div className="mt-3">
              <p className="font-medium text-sm">Medicines</p>
              <ul className="list-disc ml-5 text-sm text-gray-700">
                {selectedPrescription.medicines?.map((m, index) => (
                  <li key={index}>{m.name} - {m.dosage}, {m.frequency}, {m.duration}</li>
                ))}
              </ul>
            </div>
            {selectedPrescription.advice && <p className="mt-3 text-sm"><strong>Advice:</strong> {selectedPrescription.advice}</p>}
            <div className="mt-4 text-right">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setSelectedPrescription(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {reviewModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl p-4">
            <h3 className="font-semibold text-blue-900">Rate this appointment</h3>
            <div className="mt-3">
              <label className="text-sm text-gray-600">Rating (1 to 5)</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} onClick={() => setReviewModal((prev) => ({ ...prev, rating: value }))} className={`p-1 ${reviewModal.rating >= value ? "text-amber-500" : "text-gray-300"}`}>
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
              <textarea className="w-full border rounded-lg p-2 mt-3" rows="4" placeholder="Optional comment" value={reviewModal.comment} onChange={(e) => setReviewModal((prev) => ({ ...prev, comment: e.target.value }))} />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={() => setReviewModal({ open: false, appointmentId: null, rating: 5, comment: "" })}>Close</button>
              <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={submitReview}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
