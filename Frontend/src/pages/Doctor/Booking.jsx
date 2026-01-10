// src/pages/Bookings.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import API from "../util/api";
import { showToast } from "../../Redux/toastSlice";
import {
  Calendar,
  Clock,
  Loader2,
  User,
  Mail,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function Bookings() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FIXED: load state per button
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  useEffect(() => {
    fetchDoctorBookings();
  }, []);

  const fetchDoctorBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await API.get("/appointments/doctor");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const parseTime = (t) => {
    const m = t.match(/(\d{1,2}):(\d{2})(am|pm)/i);
    if (!m) return new Date(0);
    let [_, h, min, p] = m;
    h = Number(h);
    min = Number(min);
    if (p.toLowerCase() === "pm" && h !== 12) h += 12;
    if (p.toLowerCase() === "am" && h === 12) h = 0;
    return new Date(2000, 1, 1, h, min);
  };

  const handleStatusChange = async (id, newStatus, type) => {
    try {
      setActionLoading({ id, type });

      await API.put(`/appointments/${id}`, { status: newStatus });

      await fetchDoctorBookings();
      dispatch(showToast({ message: `Appointment ${newStatus}!`, type: "success" }));
    } catch (err) {
      dispatch(showToast({ message: err.response?.data?.message || "Failed to update status", type: "error" }));
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const grouped = bookings.reduce((acc, ap) => {
    if (!acc[ap.date]) acc[ap.date] = [];
    acc[ap.date].push(ap);
    return acc;
  }, {});

  const getStatusStyle = (status) => {
    const s = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      "in-progress": "bg-indigo-100 text-indigo-700 border-indigo-200",
      completed: "bg-blue-100 text-blue-700 border-blue-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
    };
    return s[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-yellow-500" />
        <p className="mt-3 text-gray-600">Loading your appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-8 shadow rounded-lg text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold mt-4 mb-2 text-red-600">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDoctorBookings}
            className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-yellow-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        My Appointments
      </h1>
      <p className="text-gray-600 mb-8">
        {bookings.length} appointments found
      </p>

      {Object.keys(grouped).length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-xl">No bookings found.</p>
        </div>
      )}

      {Object.keys(grouped)
        .sort()
        .map((date) => (
          <div key={date} className="mb-10">
            <div className="flex items-center gap-3 mb-4 bg-white p-4 rounded-lg shadow">
              <Calendar className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-semibold text-gray-800">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {grouped[date]
                .sort((a, b) => parseTime(a.time) - parseTime(b.time))
                .map((ap) => (
                  <div
                    key={ap._id}
                    className="bg-white rounded-xl p-6 shadow border hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-gray-500" />
                          <p className="font-semibold text-lg text-gray-800">
                            {ap.patient?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <Mail className="w-4 h-4" />
                          {ap.patient?.email}
                        </div>
                      </div>

                      <span
                        className={`px-4 py-1.5 text-xs border rounded-full capitalize font-semibold ${getStatusStyle(
                          ap.status
                        )}`}
                      >
                        {ap.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-purple-500" />
                        <span className="font-semibold">{ap.time}</span>
                      </div>

                      <div className="flex items-center gap-2 text-green-600">
                        <DollarSign className="w-5 h-5" />
                        <span className="font-bold text-lg">₹{ap.fees}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {ap.status === "pending" && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                        {/* APPROVE BUTTON */}
                        <button
                          onClick={() =>
                            handleStatusChange(ap._id, "approved", "approve")
                          }
                          disabled={
                            actionLoading.id === ap._id &&
                            actionLoading.type === "approve"
                          }
                          className="flex-1 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading.id === ap._id &&
                          actionLoading.type === "approve" ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Approve
                        </button>

                        {/* DECLINE BUTTON */}
                        <button
                          onClick={() =>
                            handleStatusChange(ap._id, "cancelled", "cancel")
                          }
                          disabled={
                            actionLoading.id === ap._id &&
                            actionLoading.type === "cancel"
                          }
                          className="flex-1 bg-red-100 text-red-600 py-2.5 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading.id === ap._id &&
                          actionLoading.type === "cancel" ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Decline
                        </button>
                      </div>
                    )}

                    {ap.status === "approved" && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleStatusChange(ap._id, "in-progress", "start")}
                          disabled={
                            actionLoading.id === ap._id &&
                            actionLoading.type === "start"
                          }
                          className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading.id === ap._id &&
                          actionLoading.type === "start" ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                          Start
                        </button>

                        <button
                          onClick={() => handleStatusChange(ap._id, "cancelled", "cancel")}
                          disabled={
                            actionLoading.id === ap._id &&
                            actionLoading.type === "cancel"
                          }
                          className="flex-1 bg-red-100 text-red-600 py-2.5 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading.id === ap._id &&
                          actionLoading.type === "cancel" ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Cancel
                        </button>
                      </div>
                    )}

                    {ap.status === "in-progress" && (
                      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => handleStatusChange(ap._id, "completed", "complete")}
                          disabled={
                            actionLoading.id === ap._id &&
                            actionLoading.type === "complete"
                          }
                          className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading.id === ap._id &&
                          actionLoading.type === "complete" ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Complete
                        </button>

                        <button
                          onClick={() => handleStatusChange(ap._id, "cancelled", "cancel")}
                          disabled={
                            actionLoading.id === ap._id &&
                            actionLoading.type === "cancel"
                          }
                          className="flex-1 bg-red-100 text-red-600 py-2.5 rounded-lg hover:bg-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading.id === ap._id &&
                          actionLoading.type === "cancel" ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
    </div>
  );
}
