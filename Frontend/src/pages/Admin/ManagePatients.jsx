import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Search, Eye, XCircle, CheckCircle, Trash2, Loader2 } from "lucide-react";
import API from "../util/api";
import { showToast } from "../../Redux/toastSlice";

export default function ManagePatients() {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/patients");
      const patientsList = Array.isArray(res.data) ? res.data : [];
      setPatients(
        patientsList.map((p) => ({
          id: p._id,
          name: p.name || "N/A",
          email: p.email || "N/A",
          phone: p.phone || "N/A",
          status: "Active",
        }))
      );
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setActionLoading({ id, type: "delete" });
      await API.delete(`/admin/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
      dispatch(showToast({ message: "Patient deleted successfully", type: "success" }));
    } catch (error) {
      console.error("Delete failed:", error);
      dispatch(showToast({ message: "Failed to delete patient", type: "error" }));
    } finally {
      setActionLoading({ id: null, type: null });
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  if (loading) {
    return <div className="text-center py-8">Loading patients...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">
        Manage Patients
      </h1>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center border rounded-lg px-3 py-2 w-full md:w-1/3">
          <Search className="w-5 h-5 text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Search patients..."
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
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((p) => (
                <tr
                  key={p.id}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-slate-600">{p.email}</td>
                  <td className="p-3">{p.phone}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
                        ${
                          p.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-center flex gap-2 justify-center">
                    <button className="p-2 rounded hover:bg-slate-100">
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={actionLoading.id === p.id && actionLoading.type === "delete"}
                      className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
                    >
                      {actionLoading.id === p.id && actionLoading.type === "delete" ? (
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
                  No patients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
