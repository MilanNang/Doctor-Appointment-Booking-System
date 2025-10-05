import {
  CalendarDays,
  Stethoscope,
  Users,
  FileBarChart,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Stethoscope className="text-blue-600" size={28} />}
          title="Total Doctors"
          value="120"
        />
        <StatCard
          icon={<Users className="text-green-600" size={28} />}
          title="Total Patients"
          value="2,340"
        />
        <StatCard
          icon={<CalendarDays className="text-purple-600" size={28} />}
          title="Appointments Today"
          value="85"
        />
        <StatCard
          icon={<FileBarChart className="text-orange-600" size={28} />}
          title="Monthly Revenue"
          value="$12,450"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder Chart */}
        <div className="bg-white shadow rounded-lg p-6 col-span-2">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Appointment Trends
          </h2>
          <div className="h-64 flex items-center justify-center text-gray-400">
            📊 Chart Placeholder
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent Activity
          </h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li>
              ✅ New doctor <b>Dr. Smith</b> added
            </li>
            <li>
              📅 Appointment booked by <b>John Doe</b>
            </li>
            <li>
              🧾 Invoice #12345 generated
            </li>
            <li>
              ⚙️ Admin updated system settings
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 flex items-center space-x-4">
      <div className="p-3 rounded-full bg-gray-100">{icon}</div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
