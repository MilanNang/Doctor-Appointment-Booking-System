
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Reports() {
  const appointmentsData = [
    { month: "Jan", count: 120 },
    { month: "Feb", count: 90 },
    { month: "Mar", count: 150 },
    { month: "Apr", count: 80 },
    { month: "May", count: 170 },
    { month: "Jun", count: 140 },
  ];

  const revenueData = [
    { name: "Consultations", value: 4000 },
    { name: "Follow-ups", value: 2500 },
    { name: "Other", value: 1200 },
  ];

  const COLORS = ["#facc15", "#3b82f6", "#10b981"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Analytics and performance metrics</p>
        </div>

        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-6 text-center border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500 font-medium">Total Doctors</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">120</h2>
          </div>
          <div className="card p-6 text-center border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 font-medium">Total Patients</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">540</h2>
          </div>
          <div className="card p-6 text-center border-l-4 border-green-500">
            <p className="text-sm text-gray-500 font-medium">Appointments</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">1,320</h2>
          </div>
          <div className="card p-6 text-center border-l-4 border-purple-500">
            <p className="text-sm text-gray-500 font-medium">Revenue</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">₹12,450</h2>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appointments Bar Chart */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Appointments
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={appointmentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Pie Chart */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={{ fill: "#374151" }}
                >
                  {revenueData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
