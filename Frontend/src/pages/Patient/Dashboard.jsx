// src/pages/Patient/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../util/api";
import { useSelector } from "react-redux";

export default function PatientDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [savedDoctors, setSavedDoctors] = useState([]);
  const [activity, setActivity] = useState([]);
  const auth = JSON.parse(localStorage.getItem("auth"));
  const user = auth?.user || null;

  // Fetch appointments and compute simple stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/appointments/my");
        const appts = res.data || [];
        setUpcoming(appts.slice(0, 4));
        setActivity([]);
        setSavedDoctors([]);

        // compute stats
        const activeAppointments = appts.filter(a => a.status && a.status !== 'completed').length;
        const totalSpent = appts.reduce((s, a) => s + (a.fees || a.fee || 0), 0);
        const avgRating = appts.reduce((s, a) => s + (a.doctor?.rating || 0), 0) / (appts.length || 1);

        setStats({ activeAppointments, totalSpent, savedDoctors: 0, avgRating: avgRating.toFixed(1) });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {user?.name || "Patient"}!
        </h1>
        <p className="text-gray-500">
          Here’s your health overview and upcoming appointments.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Active Appointments</h3>
          <p className="text-2xl font-bold text-gray-800">
            {stats?.activeAppointments ?? "…"}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Total Spent</h3>
          <p className="text-2xl font-bold text-gray-800">
            ₹{stats?.totalSpent ?? "…"}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Saved Doctors</h3>
          <p className="text-2xl font-bold text-gray-800">
            {stats?.savedDoctors ?? "…"}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-gray-500 text-sm">Avg Doctor Rating</h3>
          <p className="text-2xl font-bold text-gray-800">
            {stats?.avgRating ?? "…"}
          </p>
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

            <button
              onClick={() => navigate("/patient/appointments")}
              className="text-sm text-yellow-600 hover:underline"
            >
              View All
            </button>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-gray-500 text-sm">No upcoming appointments.</p>
          ) : (
            upcoming.map((app, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-yellow-50 p-4 rounded-lg mb-3 cursor-pointer"
                onClick={() => navigate(`/patient/appointment/${app._id}`)}
              >
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {app.doctorName}
                  </h3>
                  <p className="text-sm text-gray-500">{app.specialty}</p>
                  <p className="text-xs text-gray-400">
                    {app.date} - {app.time}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                    {app.status}
                  </span>
                  <p className="font-bold text-yellow-600 mt-1">₹{app.fee}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>

          <div className="space-y-3">

            <button
              onClick={() => navigate("/patient/browse-services")}
              className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg"
            >
              Book a Doctor
            </button>

            <button
              onClick={() => navigate("/patient/calendar")}
              className="w-full px-4 py-2 bg-purple-100 text-purple-600 rounded-lg"
            >
              View Calendar
            </button>

            <button
              onClick={() => navigate("/patient/messages")}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg"
            >
              Check Messages
            </button>
          </div>
        </div>
      </div>

      {/* Saved Doctors */}
      <div className="p-6 bg-white rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Saved Doctors</h2>

          <button
            onClick={() => navigate("/patient/doctors")}
            className="text-sm text-yellow-600 hover:underline"
          >
            Browse More
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedDoctors.length === 0 ? (
            <p className="text-gray-500 text-sm">No saved doctors.</p>
          ) : (
            savedDoctors.map((doc, i) => (
              <div key={i} className="p-4 border rounded-lg shadow-sm">

                <div className="font-semibold text-gray-800">{doc.name}</div>
                <div className="text-sm text-gray-500">{doc.specialty}</div>
                <div className="mt-2 text-yellow-600 font-bold">₹{doc.fee}</div>

                <button
                  onClick={() => navigate(`/doctor/${doc._id}`)}
                  className="mt-3 w-full py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  View Profile
                </button>

              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h2>

        <ul className="space-y-3 text-sm text-gray-600">
          {activity.map((a, i) => (
            <li key={i}>
              <span className="font-semibold text-gray-800">{a.doctor}</span>{" "}
              {a.action}{" "}
              <span className="text-gray-400">· {a.timeAgo}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
