// src/pages/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../util/api"; // your axios instance with auth headers

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    appointmentsCount: 0,
    activePatients: 0,
    recentBookings: [],
    averageRating: "0.0",
    appointmentSuccessRate: 0,
    avgResponseTime: 24,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await API.get("/doctors/dashboard");
        // ✅ Ensure all fields have fallback values
        setDashboard({
          totalEarnings: data?.totalEarnings ?? 0,
          thisMonthEarnings: data?.thisMonthEarnings ?? 0,
          appointmentsCount: data?.appointmentsCount ?? 0,
          activePatients: data?.activePatients ?? 0,
          recentBookings: data?.recentBookings ?? [],
          averageRating: data?.averageRating ?? "0.0",
          appointmentSuccessRate: data?.appointmentSuccessRate ?? 0,
          avgResponseTime: data?.avgResponseTime ?? 24,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
        // Keep safe defaults
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading)
    return <div className="text-center text-gray-500 py-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50 to-yellow-100 px-6 py-8">
      {/* STATS CARDS */}
      <section className="mt-10 grid gap-6 md:grid-cols-4 max-w-7xl mx-auto">
        {[
          {
            label: "Total Earnings",
            value: `₹${dashboard.totalEarnings}`,
            change: `+12% from last month`,
          },
          {
            label: "Active Patients",
            value: dashboard.activePatients,
            change: `+3 from last week`,
          },
          {
            label: "This Month",
            value: `₹${dashboard.thisMonthEarnings}`,
            change: `+18% from last month`,
          },
          {
            label: "Appointments",
            value: dashboard.appointmentsCount,
            change: `+5 from last month`,
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-5">
            <div className="text-slate-600 text-sm">{stat.label}</div>
            <div className="text-2xl font-bold mt-1">{stat.value}</div>
            <div className="text-green-600 text-xs mt-2">{stat.change}</div>
          </div>
        ))}
      </section>

      {/* RECENT BOOKINGS + QUICK ACTIONS */}
      <section className="mt-10 grid gap-6 md:grid-cols-2 max-w-7xl mx-auto">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">Recent Bookings</h2>

          {dashboard.recentBookings?.length > 0 ? (
            dashboard.recentBookings.map((booking, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0"
              >
                <div>
                  <div className="font-medium">{booking.patient ?? "N/A"}</div>
                  <div className="text-sm text-slate-500">{booking.service ?? "Consultation"}</div>
                  <div className="text-xs text-slate-400">
                    {booking.date ? new Date(booking.date).toLocaleDateString() : "N/A"}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-2 py-1 text-xs rounded-full mb-1 ${
                      booking.status === "confirmed"
                        ? "bg-yellow-500 text-white"
                        : "bg-purple-200 text-purple-800"
                    }`}
                  >
                    {booking.status ?? "pending"}
                  </span>
                  <div className="font-semibold text-yellow-700">
                    ₹{booking.price ?? 0}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No bookings yet.</p>
          )}

          <button
            onClick={() => navigate("/doctor/bookings")}
            className="mt-4 w-full rounded-lg border border-yellow-300 py-2 text-yellow-700 font-medium"
          >
            View All Bookings
          </button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/calendar")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg"
            >
              Update Availability
            </button>
            <button
              onClick={() => navigate("/services")}
              className="border border-yellow-300 text-yellow-700 py-2 px-4 rounded-lg"
            >
              Add New Service
            </button>
            <button className="border border-yellow-200 text-slate-700 py-2 px-4 rounded-lg">
              View Analytics
            </button>
          </div>
        </div>
      </section>

      {/* PERFORMANCE OVERVIEW */}
      <section className="mt-10 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center flex-1">
            <div className="text-2xl font-bold text-yellow-600">{dashboard.averageRating ?? "0.0"}</div>
            <div className="text-sm text-slate-600">Average Rating</div>
            <div className="mt-1 text-yellow-500">★★★★★</div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-2xl font-bold text-purple-600">{dashboard.appointmentSuccessRate ?? 0}%</div>
            <div className="text-sm text-slate-600">Appointment Success</div>
            <div className="w-full bg-purple-100 h-2 rounded mt-2">
              <div
                className="bg-purple-500 h-2 rounded"
                style={{ width: `${dashboard.appointmentSuccessRate ?? 0}%` }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-2xl font-bold text-slate-800">{dashboard.avgResponseTime ?? 24}h</div>
            <div className="text-sm text-slate-600">Avg Response Time</div>
            <div className="mt-1 text-green-600 text-xs font-medium">Excellent</div>
          </div>
        </div>
      </section>
    </div>
  );
}
