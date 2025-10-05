import { useState } from "react";
import { Search, CheckCircle, XCircle, Trash2, Eye } from "lucide-react";

export default function ManageAppointments() {
  const [search, setSearch] = useState("");

  // Sample appointment data
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      doctor: "Dr. Sarah Chen",
      patient: "John Doe",
      date: "2025-10-15",
      time: "10:30 AM",
      status: "Pending",
    },
    {
      id: 2,
      doctor: "Dr. Marcus Rodriguez",
      patient: "Jane Smith",
      date: "2025-10-16",
      time: "2:00 PM",
      status: "Approved",
    },
    {
      id: 3,
      doctor: "Dr. Emma Thompson",
      patient: "David Johnson",
      date: "2025-10-17",
      time: "5:00 PM",
      status: "Cancelled",
    },
  ]);

  const handleAction = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const filteredAppointments = appointments.filter(
    (a) =>
      a.doctor.toLowerCase().includes(search.toLowerCase()) ||
      a.patient.toLowerCase().includes(search.toLowerCase()) ||
      a.date.includes(search) ||
      a.time.includes(search)
  );

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
                    {a.status !== "Approved" && (
                      <button
                        onClick={() => handleAction(a.id, "Approved")}
                        className="p-2 rounded hover:bg-slate-100"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                    {a.status !== "Cancelled" && (
                      <button
                        onClick={() => handleAction(a.id, "Cancelled")}
                        className="p-2 rounded hover:bg-slate-100"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setAppointments((prev) =>
                          prev.filter((app) => app.id !== a.id)
                        )
                      }
                      className="p-2 rounded hover:bg-slate-100"
                    >
                      <Trash2 className="w-4 h-4 text-slate-600" />
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
