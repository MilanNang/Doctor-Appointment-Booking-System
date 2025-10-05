import React, { useState } from "react";
import { Calendar, Clock, Star, DollarSign } from "lucide-react";

export default function MyAppointments() {
  const [activeTab, setActiveTab] = useState("Pending");

  const stats = [
    { label: "Pending", value: 1, color: "bg-orange-100 text-orange-600" },
    { label: "Confirmed", value: 2, color: "bg-green-100 text-green-600" },
    { label: "Completed", value: 2, color: "bg-blue-100 text-blue-600" },
    { label: "Total Spent", value: "$3,900", color: "bg-yellow-100 text-yellow-700" },
  ];

  const appointments = [
    {
      id: 1,
      doctor: "Dr. Emma Thompson",
      specialty: "Pediatrician",
      status: "Pending",
      date: "Oct 10, 2025",
      time: "10:00 AM",
      fee: 65,
      rating: 4.9,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      notes: "Routine child health checkup.",
    },
    {
      id: 2,
      doctor: "Dr. David Kim",
      specialty: "Dentist",
      status: "Confirmed",
      date: "Oct 15, 2025",
      time: "02:30 PM",
      fee: 75,
      rating: 4.7,
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
      notes: "Teeth cleaning appointment.",
    },
    {
      id: 3,
      doctor: "Dr. Sarah Chen",
      specialty: "Cardiologist",
      status: "Completed",
      date: "Sep 20, 2025",
      time: "01:00 PM",
      fee: 100,
      rating: 4.9,
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      notes: "Follow-up heart checkup.",
    },
  ];

  const filteredAppointments =
    activeTab === "All"
      ? appointments
      : appointments.filter((a) => a.status === activeTab);

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-50 to-white min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-slate-800 mb-2">My Appointments</h1>
      <p className="text-slate-600 mb-6">
        Manage and track all your doctor bookings in one place
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white shadow-sm rounded-2xl p-5 border hover:shadow-md transition text-center"
          >
            <p
              className={`text-xl font-bold rounded-full px-3 py-1 inline-block ${s.color}`}
            >
              {s.value}
            </p>
            <p className="text-sm mt-2 text-slate-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b mb-6 overflow-x-auto">
        {["All", "Upcoming", "Pending", "Confirmed", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-medium rounded-t-lg transition ${
              activeTab === tab
                ? "bg-yellow-500 text-white shadow"
                : "text-slate-600 hover:text-yellow-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointment Cards */}
      <div className="space-y-5">
        {filteredAppointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              {/* Doctor Avatar */}
              <img
                src={appt.avatar}
                alt={appt.doctor}
                className="w-16 h-16 rounded-full border-2 border-yellow-400 object-cover"
              />
              {/* Doctor Info */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  {appt.doctor}
                  <span className="flex items-center text-sm text-yellow-600">
                    <Star className="w-4 h-4 fill-yellow-500 mr-1" /> {appt.rating}
                  </span>
                </h3>
                <p className="text-sm text-slate-500">{appt.specialty}</p>

                {/* Date/Time */}
                <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {appt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {appt.time}
                  </span>
                </div>
              </div>

              {/* Right side info */}
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-600 flex items-center justify-end gap-1">
                  <DollarSign className="w-4 h-4" /> {appt.fee}
                </p>
                <span
                  className={`text-xs font-medium px-3 py-1 mt-2 inline-block rounded-full ${
                    appt.status === "Pending"
                      ? "bg-orange-100 text-orange-600"
                      : appt.status === "Confirmed"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {appt.status}
                </span>
              </div>
            </div>

            {/* Notes */}
            <p className="text-sm text-slate-600 mt-4">{appt.notes}</p>

            {/* Action Buttons */}
            {appt.status !== "Completed" && (
              <div className="flex gap-3 mt-4">
                <button className="px-4 py-2 text-sm font-medium border border-yellow-400 text-yellow-600 rounded-lg hover:bg-yellow-50 transition">
                  Reschedule
                </button>
                <button className="px-4 py-2 text-sm font-medium border border-red-400 text-red-600 rounded-lg hover:bg-red-50 transition">
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
