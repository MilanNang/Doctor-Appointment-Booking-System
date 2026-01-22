import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Calendar, Clock, Star, DollarSign } from "lucide-react";
import API from "../util/api";
import { showToast } from "../../Redux/toastSlice";
import ConfirmDialog from "../../Componet/ConfirmDialog";

export default function MyAppointments() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("All");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    appointmentId: null,
    action: null, // "cancel" or "reschedule"
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await API.get("/appointments/my");
        setAppointments(res.data || []);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cancelAppointment = async (id) => {
    try {
      await API.put(`/appointments/${id}/cancel`);
      setAppointments((prev) => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
      dispatch(showToast({ message: "Appointment cancelled successfully", type: "success" }));
    } catch (err) {
      console.error(err);
      dispatch(showToast({ message: err.response?.data?.message || 'Failed to cancel appointment', type: "error" }));
    }
  };

  const rescheduleAppointment = async (id) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD)');
    const newTime = prompt('Enter new time (HH:MM, 24-hour)');
    if (!newDate || !newTime) return;
    try {
      await API.put(`/appointments/${id}/reschedule`, { date: newDate, time: newTime });
      setAppointments((prev) => prev.map(a => a._id === id ? { ...a, date: newDate, time: newTime, status: 'rescheduled' } : a));
      dispatch(showToast({ message: "Appointment rescheduled successfully", type: "success" }));
    } catch (err) {
      console.error(err);
      dispatch(showToast({ message: err.response?.data?.message || 'Failed to reschedule', type: "error" }));
    }
  };

  const stats = [
    { label: "Pending", value: appointments.filter(a => a.status === 'pending').length, color: "bg-orange-100 text-orange-600" },
    { label: "Confirmed", value: appointments.filter(a => a.status === 'approved' || a.status === 'confirmed').length, color: "bg-green-100 text-green-600" },
    { label: "Completed", value: appointments.filter(a => a.status === 'completed').length, color: "bg-blue-100 text-blue-600" },
    { label: "Total Spent", value: `$${appointments.reduce((s, a) => s + (a.fees || a.fee || 0), 0)}`, color: "bg-yellow-100 text-yellow-700" },
  ];

  const filteredAppointments = activeTab === "All" ? appointments : (
    activeTab === 'Upcoming' ? appointments.filter(a => ['pending','approved','confirmed','rescheduled'].includes(a.status)) : appointments.filter(a => (
      activeTab === 'Pending' ? a.status === 'pending' : activeTab === 'Confirmed' ? (a.status === 'approved' || a.status === 'confirmed') : a.status === 'completed'
    ))
  );

  if (loading) return <div className="p-6 text-center">Loading appointments...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Appointments</h1>
          <p className="text-gray-600">Manage and track all your doctor bookings in one place</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="card p-6 text-center hover:shadow-md transition">
              <p className={`text-3xl font-bold rounded-full px-3 py-1 inline-block ${s.color}`}>{s.value}</p>
              <p className="text-sm text-gray-600 mt-3">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="card p-1 mb-8">
          <div className="flex gap-0 overflow-x-auto">
            {["All", "Upcoming", "Pending", "Confirmed", "Completed"].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`flex-1 px-6 py-3 text-sm font-medium transition ${activeTab === tab 
                  ? "bg-yellow-500 text-white rounded-lg m-1" 
                  : "text-gray-600 hover:text-gray-900"}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.length === 0 && (
            <div className="text-center card p-12">
              <p className="text-gray-500 text-lg">No appointments found in this category</p>
            </div>
          )}
          {filteredAppointments.map((appt) => (
            <div key={appt._id} className="card p-6 hover:shadow-md transition">
              <div className="flex items-start gap-4 mb-4">
                <img 
                  src={appt.doctor?.user?.avatar || appt.doctor?.avatar || 'https://via.placeholder.com/64'} 
                  alt={appt.doctor?.user?.name || 'Doctor'} 
                  className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {appt.doctor?.user?.name || appt.doctor?.name || 'Doctor'}
                  </h3>
                  <p className="text-sm text-yellow-600 font-medium">{appt.doctor?.specialization || appt.specialty || 'Specialist'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {appt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {appt.time}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-yellow-600">₹{appt.fees || appt.fee || 0}</p>
                  <span className={`text-xs font-medium px-3 py-1 mt-2 inline-block rounded-full ${
                    appt.status === 'pending' ? 'bg-orange-100 text-orange-700' 
                    : appt.status === 'approved' || appt.status === 'confirmed' ? 'bg-green-100 text-green-700' 
                    : appt.status === 'completed' ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                    {appt.status?.charAt(0).toUpperCase() + appt.status?.slice(1)}
                  </span>
                </div>
              </div>

              {appt.notes || appt.description && (
                <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">{appt.notes || appt.description}</p>
              )}

              {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => setConfirmDialog({ isOpen: true, appointmentId: appt._id, action: 'reschedule' })} 
                    className="px-4 py-2 text-sm font-medium border border-yellow-400 text-yellow-600 rounded-lg hover:bg-yellow-50 transition"
                  >
                    Reschedule
                  </button>
                  <button 
                    onClick={() => setConfirmDialog({ isOpen: true, appointmentId: appt._id, action: 'cancel' })} 
                    className="px-4 py-2 text-sm font-medium border border-red-400 text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.action === 'cancel' ? "Cancel Appointment" : "Reschedule Appointment"}
        message={
          confirmDialog.action === 'cancel'
            ? "Are you sure you want to cancel this appointment? This action cannot be undone."
            : "Are you sure you want to reschedule this appointment?"
        }
        confirmText={confirmDialog.action === 'cancel' ? "Cancel Appointment" : "Reschedule"}
        cancelText="Keep it"
        isDangerous={confirmDialog.action === 'cancel'}
        onConfirm={() => {
          if (confirmDialog.action === 'cancel') {
            cancelAppointment(confirmDialog.appointmentId);
          } else {
            rescheduleAppointment(confirmDialog.appointmentId);
          }
          setConfirmDialog({ isOpen: false, appointmentId: null, action: null });
        }}
        onCancel={() => setConfirmDialog({ isOpen: false, appointmentId: null, action: null })}
      />
    </div>
  );
}
