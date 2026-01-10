import { useEffect, useState } from "react";
import {
  CalendarDays,
  Stethoscope,
  Users,
  FileBarChart,
} from "lucide-react";
import API from "../util/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    appointmentsToday: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const doctorsRes = await API.get("/admin/doctors");
      const patientsRes = await API.get("/admin/patients");
      const appointmentsRes = await API.get("/appointments/all");

      const doctors = Array.isArray(doctorsRes.data) ? doctorsRes.data.length : 0;
      const patients = Array.isArray(patientsRes.data) ? patientsRes.data.length : 0;
      const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];

      const today = new Date().toISOString().split("T")[0];
      const appointmentsToday = appointments.filter((a) => a.date === today).length;

      const revenue = appointments.reduce((sum, a) => sum + (a.fees || 0), 0);

      setStats({
        totalDoctors: doctors,
        totalPatients: patients,
        appointmentsToday: appointmentsToday,
        monthlyRevenue: revenue,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Stethoscope className="text-blue-600" size={28} />}
          title="Total Doctors"
          value={stats.totalDoctors}
        />
        <StatCard
          icon={<Users className="text-green-600" size={28} />}
          title="Total Patients"
          value={stats.totalPatients}
        />
        <StatCard
          icon={<CalendarDays className="text-purple-600" size={28} />}
          title="Appointments Today"
          value={stats.appointmentsToday}
        />
        <StatCard
          icon={<FileBarChart className="text-orange-600" size={28} />}
          title="Total Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
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
