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
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Manage Appointments
      </h1>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center border rounded-lg px-3 py-2 w-full md:w-1/3">
          <Search className="w-5 h-5 text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-left text-sm">
              <th className="p-3">Doctor</th>
              <th className="p-3">Patient</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((a) => (
                <tr
                  key={a.id}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="p-3 font-medium">{a.doctor}</td>
                  <td className="p-3">{a.patient}</td>
                  <td className="p-3">{a.date}</td>
                  <td className="p-3">{a.time}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
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
                  <td className="p-3 flex gap-2 justify-center">
                    <button className="p-2 rounded hover:bg-slate-100">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    {a.status !== "approved" && (
                      <button
                        onClick={() => handleUpdateStatus(a.id, "approved")}
                        disabled={actionLoading.id === a.id && actionLoading.type === "approved"}
                        className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
                      >
                        {actionLoading.id === a.id && actionLoading.type === "approved" ? (
                          <Loader2 className="animate-spin w-4 h-4 text-green-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </button>
                    )}
                    {a.status !== "cancelled" && (
                      <button
                        onClick={() => handleUpdateStatus(a.id, "cancelled")}
                        disabled={actionLoading.id === a.id && actionLoading.type === "cancelled"}
                        className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
                      >
                        {actionLoading.id === a.id && actionLoading.type === "cancelled" ? (
                          <Loader2 className="animate-spin w-4 h-4 text-red-600" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={actionLoading.id === a.id && actionLoading.type === "delete"}
                      className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
                    >
                      {actionLoading.id === a.id && actionLoading.type === "delete" ? (
                        <Loader2 className="animate-spin w-4 h-4 text-slate-600" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-slate-500 text-sm"
                >
                  No appointments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
