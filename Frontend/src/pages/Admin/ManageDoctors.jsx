import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Search, Eye, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import API from "../util/api";
import { showToast } from "../../Redux/toastSlice";

export default function ManageDoctors() {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/doctors");
      const doctorsList = Array.isArray(res.data) ? res.data : [];
      setDoctors(
        doctorsList.map((doc) => ({
          id: doc._id,
          name: doc.user?.name || "N/A",
          specialty: doc.specialization || "N/A",
          email: doc.user?.email || "N/A",
          status: "Approved", // From database if available
        }))
      );
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading({ id, type: "delete" });
      await API.delete(`/admin/doctors/${id}`);
      setDoctors((prev) => prev.filter((d) => d.id !== id));
      dispatch(showToast({ message: "Doctor deleted successfully", type: "success" }));
    } catch (error) {
      console.error("Delete failed:", error);
      dispatch(showToast({ message: "Failed to delete doctor", type: "error" }));
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
      doc.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8">Loading doctors...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Manage Doctors
      </h1>

      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center border rounded-lg px-3 py-2 w-full md:w-1/3">
          <Search className="w-5 h-5 text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Search doctors..."
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
              <th className="p-3">Name</th>
              <th className="p-3">Specialty</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="p-3 font-medium">{doc.name}</td>
                  <td className="p-3">{doc.specialty}</td>
                  <td className="p-3 text-slate-600">{doc.email}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
                        ${
                          doc.status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : doc.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button className="p-2 rounded hover:bg-slate-100">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      disabled={actionLoading.id === doc.id && actionLoading.type === "delete"}
                      className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
                    >
                      {actionLoading.id === doc.id && actionLoading.type === "delete" ? (
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
                  colSpan={5}
                  className="p-4 text-center text-slate-500 text-sm"
                >
                  No doctors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
