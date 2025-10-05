import React from "react";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-yellow-50 to-yellow-100 px-6 py-8">
      {/* STATS CARDS */}
      <section className="mt-10 grid gap-6 md:grid-cols-4 max-w-7xl mx-auto">
        {[
          {
            label: "Total Earnings",
            value: "$12,450",
            change: "+12% from last month",
          },
          { label: "Active Patients", value: "24", change: "+3 from last week" },
          { label: "This Month", value: "$3,240", change: "+18% from last month" },
          { label: "Appointments", value: "156", change: "+5 from last month" },
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

          {[
            {
              patient: "John Doe",
              service: "Cardiology Consultation",
              date: "Oct 05, 2025",
              status: "confirmed",
              price: 120,
            },
            {
              patient: "Maria Lopez",
              service: "Follow-up Checkup",
              date: "Oct 07, 2025",
              status: "pending",
              price: 80,
            },
            {
              patient: "David Kim",
              service: "Heart Surgery Consultation",
              date: "Oct 10, 2025",
              status: "confirmed",
              price: 200,
            },
          ].map((booking, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-slate-100 py-4 last:border-0"
            >
              <div>
                <div className="font-medium">{booking.patient}</div>
                <div className="text-sm text-slate-500">{booking.service}</div>
                <div className="text-xs text-slate-400">{booking.date}</div>
              </div>
              <div className="flex flex-col items-end">
                <span
                  className={`px-2 py-1 text-xs rounded-full mb-1 ${
                    booking.status === "confirmed"
                      ? "bg-yellow-500 text-white"
                      : "bg-purple-200 text-purple-800"
                  }`}
                >
                  {booking.status}
                </span>
                <div className="font-semibold text-yellow-700">
                  ${booking.price}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => navigate("/bookings")}
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
            <div className="text-2xl font-bold text-yellow-600">4.9</div>
            <div className="text-sm text-slate-600">Average Rating</div>
            <div className="mt-1 text-yellow-500">★★★★★</div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-2xl font-bold text-purple-600">98%</div>
            <div className="text-sm text-slate-600">Appointment Success</div>
            <div className="w-full bg-purple-100 h-2 rounded mt-2">
              <div
                className="bg-purple-500 h-2 rounded"
                style={{ width: "98%" }}
              ></div>
            </div>
          </div>

          <div className="flex flex-col items-center flex-1">
            <div className="text-2xl font-bold text-slate-800">24h</div>
            <div className="text-sm text-slate-600">Avg Response Time</div>
            <div className="mt-1 text-green-600 text-xs font-medium">
              Excellent
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
