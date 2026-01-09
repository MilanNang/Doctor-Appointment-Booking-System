import React, { useState, useEffect } from "react";
import { Calendar, Clock, Star, DollarSign } from "lucide-react";
import API from "../util/api";

export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState("All");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await API.put(`/appointments/${id}/cancel`);
      setAppointments((prev) => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const rescheduleAppointment = async (id) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD)');
    const newTime = prompt('Enter new time (HH:MM, 24-hour)');
    if (!newDate || !newTime) return;
    try {
      await API.put(`/appointments/${id}/reschedule`, { date: newDate, time: newTime });
      setAppointments((prev) => prev.map(a => a._id === id ? { ...a, date: newDate, time: newTime, status: 'rescheduled' } : a));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to reschedule');
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

  if (loading) return <div className="p-6">Loading appointments...</div>;

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-50 to-white min-h-screen">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">My Appointments</h1>
      <p className="text-slate-600 mb-6">Manage and track all your doctor bookings in one place</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white shadow-sm rounded-2xl p-5 border hover:shadow-md transition text-center">
            <p className={`text-xl font-bold rounded-full px-3 py-1 inline-block ${s.color}`}>{s.value}</p>
            <p className="text-sm mt-2 text-slate-600">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 border-b mb-6 overflow-x-auto">
        {["All", "Upcoming", "Pending", "Confirmed", "Completed"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-sm font-medium rounded-t-lg transition ${activeTab === tab ? "bg-yellow-500 text-white shadow" : "text-slate-600 hover:text-yellow-600"}`}>{tab}</button>
        ))}
      </div>

      <div className="space-y-5">
        {filteredAppointments.length === 0 && <div className="text-center text-slate-500">No appointments found</div>}
        {filteredAppointments.map((appt) => (
          <div key={appt._id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-4">
              <img src={appt.doctor?.user?.avatar || appt.doctor?.avatar || 'https://via.placeholder.com/64'} alt={appt.doctor?.user?.name || 'Doctor'} className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  {appt.doctor?.user?.name || appt.doctor?.name || 'Doctor'}
                  <span className="flex items-center text-sm text-yellow-600"><Star className="w-4 h-4 fill-yellow-500 mr-1" /> {appt.doctor?.rating || appt.rating || '—'}</span>
                </h3>
                <p className="text-sm text-slate-500">{appt.doctor?.specialization || appt.specialty || ''}</p>

                <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {appt.date}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {appt.time}</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-yellow-600 flex items-center justify-end gap-1"><DollarSign className="w-4 h-4" /> {appt.fees || appt.fee || 0}</p>
                <span className={`text-xs font-medium px-3 py-1 mt-2 inline-block rounded-full ${appt.status === 'pending' ? 'bg-orange-100 text-orange-600' : appt.status === 'approved' || appt.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{appt.status}</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 mt-4">{appt.notes || appt.description || ''}</p>

            {appt.status !== 'completed' && (
              <div className="flex gap-3 mt-4">
                <button onClick={() => rescheduleAppointment(appt._id)} className="px-4 py-2 text-sm font-medium border border-yellow-400 text-yellow-600 rounded-lg hover:bg-yellow-50 transition">Reschedule</button>
                <button onClick={() => cancelAppointment(appt._id)} className="px-4 py-2 text-sm font-medium border border-red-400 text-red-600 rounded-lg hover:bg-red-50 transition">Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
