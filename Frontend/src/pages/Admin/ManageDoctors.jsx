import { useState } from "react";
import { Search, Eye, CheckCircle, XCircle, Trash2 } from "lucide-react";

export default function ManageDoctors() {
  const [search, setSearch] = useState("");

  // Sample doctor data
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. Sarah Chen",
      specialty: "Cardiologist",
      email: "sarah.chen@email.com",
      status: "Approved",
    },
    {
      id: 2,
      name: "Dr. Marcus Rodriguez",
      specialty: "Dermatologist",
      email: "marcus.rod@email.com",
      status: "Pending",
    },
    {
      id: 3,
      name: "Dr. Emma Thompson",
      specialty: "Pediatrician",
      email: "emma.t@email.com",
      status: "Blocked",
    },
  ]);

  const handleAction = (id, action) => {
    setDoctors((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, status: action } : doc
      )
    );
  };

  const filteredDoctors = doctors.filter(
    (doc) =>
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(search.toLowerCase()) ||
      doc.email.toLowerCase().includes(search.toLowerCase())
  );

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
                      onClick={() => handleAction(doc.id, "Approved")}
                      className="p-2 rounded hover:bg-slate-100"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => handleAction(doc.id, "Blocked")}
                      className="p-2 rounded hover:bg-slate-100"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                    </button>
                    <button
                      onClick={() =>
                        setDoctors((prev) =>
                          prev.filter((d) => d.id !== doc.id)
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
