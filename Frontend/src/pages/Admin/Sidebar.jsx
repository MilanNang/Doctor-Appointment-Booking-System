import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  CalendarDays,
  CreditCard,
  Settings,
  FileText
} from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white shadow-md h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <SidebarLink to="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <SidebarLink to="/admin/doctors" icon={<Stethoscope size={20} />} label="Doctors" />
        <SidebarLink to="/admin/patients" icon={<Users size={20} />} label="Patients" />
        <SidebarLink to="/admin/appointments" icon={<CalendarDays size={20} />} label="Appointments" />
        <SidebarLink to="/admin/payments" icon={<CreditCard size={20} />} label="Payments" />
        <SidebarLink to="/admin/report" icon={<FileText size={20} />} label="Reports" />
        <SidebarLink to="/admin/settings" icon={<Settings size={20} />} label="Settings" />
        

      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t text-sm text-gray-500">
        © 2025 MediBook
      </div>
    </aside>
  );
}

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition 
        ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
