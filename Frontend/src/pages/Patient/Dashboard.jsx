// src/pages/Patient/Dashboard.jsx
import React from "react";

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, Alex!
        </h1>
        <p className="text-gray-500">
          Here’s your health overview and upcoming appointments.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Active Appointments</h3>
          <p className="text-2xl font-bold text-gray-800">5</p>
          <span className="text-green-600 text-xs">+2 from last month</span>
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Total Spent</h3>
          <p className="text-2xl font-bold text-gray-800">$4,250</p>
          <span className="text-green-600 text-xs">+15% from last month</span>
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Saved Doctors</h3>
          <p className="text-2xl font-bold text-gray-800">12</p>
          <span className="text-green-600 text-xs">+3 from last month</span>
        </div>
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Avg Doctor Rating</h3>
          <p className="text-2xl font-bold text-gray-800">4.8</p>
          <span className="text-green-600 text-xs">+0.2 from last month</span>
        </div>
      </div>

      {/* Upcoming Appointments + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="p-6 bg-white rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Upcoming Appointments
            </h2>
            <button className="text-sm text-yellow-600 hover:underline">
              View All
            </button>
          </div>

          <div className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg">
            <div>
              <h3 className="font-semibold text-gray-800">Dr. Sarah Chen</h3>
              <p className="text-sm text-gray-500">Cardiologist</p>
              <p className="text-xs text-gray-400">Fri, Dec 20 - 2:00 PM</p>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                Confirmed
              </span>
              <p className="font-bold text-yellow-600 mt-1">$120</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
              Book a Doctor
            </button>
            <button className="w-full flex items-center justify-between px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200">
              View Calendar
            </button>
            <button className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              Check Messages
            </button>
          </div>
        </div>
      </div>

      {/* Saved Doctors */}
      <div className="p-6 bg-white rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Saved Doctors</h2>
          <button className="text-sm text-yellow-600 hover:underline">
            Browse More
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Dr. Sarah Chen", specialty: "Cardiologist", fee: "$120", status: "Available" },
            { name: "Dr. Marcus Rodriguez", specialty: "Dermatologist", fee: "$95", status: "Busy" },
            { name: "Dr. Emma Thompson", specialty: "Pediatrician", fee: "$65", status: "Available" },
          ].map((doc, i) => (
            <div key={i} className="p-4 border rounded-lg shadow-sm">
              <div className="font-semibold text-gray-800">{doc.name}</div>
              <div className="text-sm text-gray-500">{doc.specialty}</div>
              <div className="mt-2 text-yellow-600 font-bold">{doc.fee}</div>
              <span
                className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                  doc.status === "Available"
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {doc.status}
              </span>
              <button className="mt-3 w-full py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600">
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>
        <ul className="space-y-3 text-sm text-gray-600">
          <li>
            <span className="font-semibold text-gray-800">Dr. Sarah Chen</span>{" "}
            confirmed your cardiology appointment{" "}
            <span className="text-gray-400">· 2 hours ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
