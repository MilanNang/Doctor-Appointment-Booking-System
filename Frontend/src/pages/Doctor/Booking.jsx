// src/pages/Bookings.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Calendar, Clock, Star, Loader2 } from "lucide-react";

const tabs = ["All", "Pending", "Approved", "Completed", "Cancelled", "Rescheduled"];

export default function Bookings() {
  const { user, token } = useSelector((state) => state.auth);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All");

  // ✅ Fetch bookings on mount
  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Fetch Bookings (Safe + Role-aware)
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const endpoint =
        user?.role === "doctor"
          ? "/api/appointments/doctor"
          : user?.role === "patient"
          ? "/api/appointments/my"
          : "/api/appointments/all";

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data;

      // ✅ Always ensure array type
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (Array.isArray(data.appointments)) {
        setBookings(data.appointments);
      } else {
        console.warn("⚠️ Unexpected bookings format:", data);
        setBookings([]);
      }
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      setError(err.response?.data?.message || "Failed to load bookings");
      setBookings([]); // fallback to safe empty array
    } finally {
      setLoading(false);
    }
  };

  // ✅ Safely handle status change (for doctor)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(
        `/api/appointments/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBookings(); // refresh after update
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update appointment status");
    }
  };

  // ✅ Ensure bookings is always an array
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  // ✅ Calculate total value safely
  const totalValue = safeBookings
    .reduce((sum, b) => sum + (b?.fees || 0), 0)
    .toFixed(2);

  // ✅ Filtered bookings by tab
  const filteredBookings =
    activeTab === "All"
      ? safeBookings
      : safeBookings.filter(
          (b) => b?.status?.toLowerCase() === activeTab.toLowerCase()
        );

  // ✅ Loading UI
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-yellow-500" />
      </div>
    );

  // ✅ Error UI
  if (error)
    return (
      <div className="text-red-600 text-center mt-10 font-semibold">
        ⚠️ {error}
      </div>
    );

  return (
    <div className="p-6 bg-yellow-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
      <p className="text-gray-600 mb-6">
        {user?.role === "doctor"
          ? "Manage your patient appointments"
          : "View your upcoming and past appointments"}
      </p>

      {/* ✅ Stats Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-yellow-600 text-xl font-bold">
            {safeBookings.filter((b) => b?.status === "pending").length}
          </p>
          <p className="text-gray-500 text-sm">Pending</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-green-600 text-xl font-bold">
            {safeBookings.filter((b) => b?.status === "approved").length}
          </p>
          <p className="text-gray-500 text-sm">Approved</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-blue-600 text-xl font-bold">
            {safeBookings.filter((b) => b?.status === "completed").length}
          </p>
          <p className="text-gray-500 text-sm">Completed</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-purple-600 text-xl font-bold">₹{totalValue}</p>
          <p className="text-gray-500 text-sm">Total Value</p>
        </div>
      </div>

      {/* ✅ Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
              activeTab === tab
                ? "bg-yellow-400 text-white"
                : "bg-white text-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} (
            {
              (tab === "All"
                ? safeBookings
                : safeBookings.filter(
                    (b) => b?.status?.toLowerCase() === tab.toLowerCase()
                  )
              ).length
            }
            )
          </button>
        ))}
      </div>

      {/* ✅ Booking Cards */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <p className="text-gray-500 text-center">No bookings found.</p>
        ) : (
          filteredBookings.map((b, index) => (
            <div
              key={b?._id || index}
              className="bg-white shadow rounded-xl p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                  {(user?.role === "doctor"
                    ? b?.patient?.name
                    : b?.doctor?.specialization)?.[0] || "?"}
                </div>
                <div>
                  <p className="font-semibold">
                    {user?.role === "doctor"
                      ? b?.patient?.name || "Unknown"
                      : `Dr. ${b?.doctor?.specialization || "Unknown"}`}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    4.9
                  </div>
                </div>
                <span
                  className={`ml-auto text-xs px-3 py-1 rounded-full capitalize ${
                    b?.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : b?.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : b?.status === "completed"
                      ? "bg-blue-100 text-blue-700"
                      : b?.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : b?.status === "rescheduled"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {b?.status || "unknown"}
                </span>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-yellow-500" />
                  {b?.date || "N/A"}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  {b?.time || "N/A"}
                </div>
                <div className="ml-auto text-green-600 font-bold">
                  ₹{b?.fees || "0.0"}
                </div>
              </div>

              {/* ✅ Actions */}
              <div className="flex gap-3 mt-2 flex-wrap">
                {user?.role === "doctor" && b?.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(b?._id, "approved")}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(b?._id, "cancelled")}
                      className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200"
                    >
                      Decline
                    </button>
                  </>
                )}
                <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200">
                  Message
                </button>
                <button className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200">
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
