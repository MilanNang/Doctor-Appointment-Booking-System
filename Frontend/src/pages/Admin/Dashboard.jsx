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
    return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and statistics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Stethoscope className="text-blue-600" size={28} />}
            title="Total Doctors"
            value={stats.totalDoctors}
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={<Users className="text-green-600" size={28} />}
            title="Total Patients"
            value={stats.totalPatients}
            bgColor="bg-green-50"
          />
          <StatCard
            icon={<CalendarDays className="text-purple-600" size={28} />}
            title="Today's Appointments"
            value={stats.appointmentsToday}
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={<FileBarChart className="text-yellow-600" size={28} />}
            title="Total Revenue"
            value={`₹${stats.monthlyRevenue.toLocaleString()}`}
            bgColor="bg-yellow-50"
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Placeholder Chart */}
          <div className="card p-8 col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Appointment Trends
            </h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400">
              📊 Analytics Chart
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Recent Activity
            </h2>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <span className="text-xl">✅</span>
                <div>New doctor <b>Dr. Smith</b> added</div>
              </li>
              <li className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <span className="text-xl">📅</span>
                <div>Appointment booked by <b>John Doe</b></div>
              </li>
              <li className="flex items-start gap-3 pb-3 border-b border-gray-200">
                <span className="text-xl">🧾</span>
                <div>Invoice #12345 generated</div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">⚙️</span>
                <div>Admin updated system settings</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, bgColor }) {
  return (
    <div className="card p-6 flex items-center gap-4 hover:shadow-md transition">
      <div className={`p-4 rounded-lg ${bgColor}`}>{icon}</div>
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
