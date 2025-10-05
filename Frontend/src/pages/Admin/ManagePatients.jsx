import { useState } from "react";
import { Search, Eye, XCircle, CheckCircle, Trash2 } from "lucide-react";

export default function ManagePatients() {
  const [search, setSearch] = useState("");

  // Sample patients
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1 234 567 890",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1 987 654 321",
      status: "Blocked",
    },
    {
      id: 3,
      name: "David Johnson",
      email: "david.j@email.com",
      phone: "+1 456 789 123",
      status: "Active",
    },
  ]);

  const handleAction = (id, action) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: action } : p
      )
    );
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

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
                    {p.status === "Active" ? (
                      <button
                        onClick={() => handleAction(p.id, "Blocked")}
                        className="p-2 rounded hover:bg-slate-100"
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(p.id, "Active")}
                        className="p-2 rounded hover:bg-slate-100"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setPatients((prev) =>
                          prev.filter((pt) => pt.id !== p.id)
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
