
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
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reports</h1>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-sm text-slate-500">Total Doctors</p>
          <h2 className="text-2xl font-bold text-yellow-600">120</h2>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-sm text-slate-500">Total Patients</p>
          <h2 className="text-2xl font-bold text-blue-600">540</h2>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-sm text-slate-500">Appointments</p>
          <h2 className="text-2xl font-bold text-green-600">1,320</h2>
        </div>
        <div className="bg-white p-5 rounded-xl shadow text-center">
          <p className="text-sm text-slate-500">Revenue</p>
          <h2 className="text-2xl font-bold text-purple-600">$12,450</h2>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            Monthly Appointments
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#facc15" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
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
                label
              >
                {revenueData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
