import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Search, CheckCircle, XCircle, Trash2, Eye, Loader2 } from "lucide-react";
import API from "../util/api";
import { showToast } from "../../Redux/toastSlice";

export default function ManageAppointments() {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await API.get("/appointments/all");
      const appointmentsList = Array.isArray(res.data) ? res.data : [];
      setAppointments(
        appointmentsList.map((a) => ({
          id: a._id,
          doctor: a.doctor?.user?.name || "N/A",
          patient: a.patient?.name || "N/A",
          date: a.date || "N/A",
          time: a.time || "N/A",
          status: a.status || "pending",
        }))
      );
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setActionLoading({ id, type: newStatus });
      await API.put(`/appointments/${id}`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      dispatch(showToast({ message: `Appointment ${newStatus}!`, type: "success" }));
    } catch (error) {
      console.error("Update failed:", error);
      dispatch(showToast({ message: "Failed to update appointment status", type: "error" }));
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading({ id, type: "delete" });
      // Note: You may need to add a delete endpoint in backend if it doesn't exist
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const filteredAppointments = appointments.filter(
    (a) =>
      a.doctor.toLowerCase().includes(search.toLowerCase()) ||
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.date.includes(search) ||
      a.time.includes(search)
  );

  if (loading) {
    return <div className="text-center py-8">Loading appointments...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Manage Appointments</h1>
          <p className="text-gray-600 mt-2">View and manage all doctor appointments</p>
        </div>

        {/* Search */}
        <div className="card p-4 mb-6">
          <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2.5 bg-white">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search by doctor, patient, or date..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left text-sm font-semibold border-b border-gray-200">
              <th className="px-6 py-4">Doctor</th>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Time</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-gray-200 hover:bg-yellow-50 transition"
                >
                  <td className="px-6 py-4 font-semibold text-gray-900">{a.doctor}</td>
                  <td className="px-6 py-4 text-gray-700">{a.patient}</td>
                  <td className="px-6 py-4 text-gray-600">{a.date}</td>
                  <td className="px-6 py-4 text-gray-600">{a.time}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold
                        ${
                          a.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : a.status === "Cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2 justify-end">
                    <span className="text-xl cursor-pointer">👁️</span>
                    {a.status !== "approved" && (
                      <button
                        onClick={() => handleUpdateStatus(a.id, "approved")}
                        disabled={actionLoading.id === a.id && actionLoading.type === "approved"}
                        className="text-xl hover:scale-110 transition disabled:opacity-50"
                      >
                        ✅
                      </button>
                    )}
                    {a.status !== "cancelled" && (
                      <button
                        onClick={() => handleUpdateStatus(a.id, "cancelled")}
                        disabled={actionLoading.id === a.id && actionLoading.type === "cancelled"}
                        className="text-xl hover:scale-110 transition disabled:opacity-50"
                      >
                        ❌
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={actionLoading.id === a.id && actionLoading.type === "delete"}
                      className="text-xl hover:scale-110 transition disabled:opacity-50"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
