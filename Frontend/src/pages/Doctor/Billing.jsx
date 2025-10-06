// src/pages/Billing.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  IndianRupee,
  Calendar,
} from "lucide-react";

export default function Billing() {
  const { user, token } = useSelector((state) => state.auth);
  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [amount, setAmount] = useState("");

  const isDoctor = user?.role === "doctor";
  const isAdmin = user?.role === "admin";
  const isPatient = user?.role === "patient";

  useEffect(() => {
    fetchPayments();
    if (isPatient) fetchAppointments();
  }, []);

  // ✅ Safe Fetch Payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const endpoint = isAdmin
        ? "/api/payments"
        : isPatient
        ? "/api/appointments/my"
        : "/api/payments"; // doctor sees same as admin

      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ensure data is array
      const data = Array.isArray(res.data) ? res.data : [];
      setPayments(data);
    } catch (err) {
      console.error("❌ Error fetching payments:", err);
      setError("Failed to load payments");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Safe Fetch Patient's Appointments
  const fetchAppointments = async () => {
    try {
      const res = await axios.get("/api/appointments/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setAppointments([]);
    }
  };

  // ✅ Create Cash Payment
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!selectedAppointment || !amount) {
      return alert("Please select an appointment and enter amount.");
    }

    try {
      const res = await axios.post(
        "/api/payments/cash",
        { appointmentId: selectedAppointment, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Payment recorded successfully!");
      setSelectedAppointment("");
      setAmount("");
      fetchPayments();
    } catch (err) {
      console.error("Payment creation failed:", err);
      alert(err.response?.data?.message || "Failed to create payment");
    }
  };

  // ✅ Confirm Payment (for doctor/admin)
  const handleConfirmPayment = async (id) => {
    try {
      const res = await axios.put(
        `/api/payments/${id}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.message || "Payment confirmed");
      fetchPayments();
    } catch (err) {
      console.error("Confirm payment error:", err);
      alert(err.response?.data?.message || "Failed to confirm payment");
    }
  };

  // ✅ Safety totals
  const safePayments = Array.isArray(payments) ? payments : [];
  const totalAmount = safePayments
    .reduce((sum, p) => sum + (p?.amount || 0), 0)
    .toFixed(2);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-yellow-500" />
      </div>
    );

  if (error)
    return <div className="text-red-600 text-center mt-10">{error}</div>;

  return (
    <div className="p-6 bg-yellow-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Billing</h1>
      <p className="text-gray-600 mb-6">
        {isPatient
          ? "View your payments or record a new one"
          : isDoctor
          ? "Manage and confirm patient payments"
          : "Admin view of all transactions"}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-yellow-600 text-2xl font-bold">
            ₹{totalAmount || "0.0"}
          </p>
          <p className="text-gray-500 text-sm">Total Payments</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-green-600 text-2xl font-bold">
            {safePayments.filter((p) => p.status === "completed").length}
          </p>
          <p className="text-gray-500 text-sm">Completed</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <p className="text-yellow-500 text-2xl font-bold">
            {safePayments.filter((p) => p.status === "pending").length}
          </p>
          <p className="text-gray-500 text-sm">Pending</p>
        </div>
      </div>

      {/* Record Payment Form (Patient Only) */}
      {isPatient && (
        <form
          onSubmit={handleCreatePayment}
          className="bg-white rounded-xl shadow p-6 mb-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Record Cash Payment
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <select
              className="border p-2 rounded-lg flex-1"
              value={selectedAppointment}
              onChange={(e) => setSelectedAppointment(e.target.value)}
            >
              <option value="">Select Appointment</option>
              {appointments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.date || "N/A"} - {a.time || "N/A"} (
                  {a.status || "unknown"})
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Amount"
              className="border p-2 rounded-lg w-32"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button
              type="submit"
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      {/* Payment List */}
      <div className="space-y-4">
        {safePayments.length === 0 ? (
          <p className="text-gray-500 text-center">No payment records found.</p>
        ) : (
          safePayments.map((p) => (
            <div
              key={p._id}
              className="bg-white shadow rounded-xl p-5 flex flex-col gap-3"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">
                    ₹{p.amount || "0.0"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {p.paymentMethod || "cash"} —{" "}
                    {p.patient?.name || "Unknown Patient"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    p.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : p.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {p.status || "unknown"}
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-600 text-sm">
                <Calendar className="w-4 h-4 text-yellow-500" />
                {new Date(p.createdAt).toLocaleDateString() || "N/A"}
              </div>

              {(isDoctor || isAdmin) && p.status === "pending" && (
                <button
                  onClick={() => handleConfirmPayment(p._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg w-fit hover:bg-green-700 mt-2"
                >
                  Confirm Payment
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
