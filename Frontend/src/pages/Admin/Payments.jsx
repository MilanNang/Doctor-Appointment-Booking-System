import { useState } from "react";
import { Search, DollarSign, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function Payments() {
  const [search, setSearch] = useState("");

  // Sample transactions
  const transactions = [
    {
      id: 1,
      doctor: "Dr. Sarah Chen",
      patient: "John Doe",
      amount: 50,
      type: "Credit",
      date: "2025-10-10",
      status: "Completed",
    },
    {
      id: 2,
      doctor: "Dr. Marcus Rodriguez",
      patient: "Jane Smith",
      amount: 100,
      type: "Debit",
      date: "2025-10-12",
      status: "Pending",
    },
    {
      id: 3,
      doctor: "Dr. Emma Thompson",
      patient: "David Johnson",
      amount: 75,
      type: "Credit",
      date: "2025-10-14",
      status: "Failed",
    },
  ];

  const filtered = transactions.filter(
    (t) =>
      t.doctor.toLowerCase().includes(search.toLowerCase()) ||
      t.patient.toLowerCase().includes(search.toLowerCase()) ||
      t.date.includes(search)
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Payments</h1>

      {/* Search */}
      <div className="flex items-center border rounded-lg px-3 py-2 w-full md:w-1/3 mb-6">
        <Search className="w-5 h-5 text-slate-500 mr-2" />
        <input
          type="text"
          placeholder="Search payments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 text-sm">
              <th className="p-3 text-left">Doctor</th>
              <th className="p-3 text-left">Patient</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <tr key={t.id} className="border-t hover:bg-slate-50">
                  <td className="p-3">{t.doctor}</td>
                  <td className="p-3">{t.patient}</td>
                  <td className="p-3">{t.date}</td>
                  <td className="p-3 font-medium flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    {t.amount}
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    {t.type === "Credit" ? (
                      <ArrowDownCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowUpCircle className="w-4 h-4 text-red-600" />
                    )}
                    {t.type}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
                        ${
                          t.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : t.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-slate-500 text-sm"
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
