import { useState } from "react";
import { Search, IndianRupee, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-2">Manage and track all financial transactions</p>
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
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((t) => (
                <tr key={t.id} className="border-b border-gray-200 hover:bg-yellow-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-900">{t.doctor}</td>
                  <td className="px-6 py-4 text-gray-700">{t.patient}</td>
                  <td className="px-6 py-4 text-gray-600">{t.date}</td>
                  <td className="px-6 py-4 font-bold text-yellow-600 flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />₹{t.amount}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {t.type === "Credit" ? (
                      <ArrowDownCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowUpCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-medium">{t.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
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
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No transactions found
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
