import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Calendar, BookOpen, User, Settings, LogOut } from "lucide-react";

export default function PatientSidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { path: "/patient/", label: "Dashboard", icon: <Home size={18} /> },
    { path: "/patient/browse-services", label: "Browse Doctors", icon: <Search size={18} /> },
    { path: "/patient/appointments", label: "My Appointments", icon: <BookOpen size={18} /> },
    { path: "/patient/calendar", label: "Calendar", icon: <Calendar size={18} /> },
  ];

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="w-64 min-h-screen bg-white border-r shadow-sm p-6 flex flex-col justify-between">
      <div>
        {/* Logo / Title */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-yellow-600">MediConnect</h1>
          <p className="text-sm text-slate-500">Patient Portal</p>
        </div>

        {/* Patient Info */}
       

        {/* Navigation */}
        <nav className="space-y-3">
          {navItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                location.pathname === item.path
                  ? "bg-yellow-100 text-yellow-700 font-medium"
                  : "text-slate-700 hover:bg-yellow-50 hover:text-yellow-600"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Account Dropdown */}
      <div className="relative border-t pt-4" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center w-full space-x-3 p-2 rounded-md hover:bg-gray-50"
        >
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">
            JD
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">John Doe</p>
            <p className="text-xs text-gray-500">demo@123</p>
          </div>
          <svg
            className={`w-4 h-4 transform transition ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute bottom-16 left-0 w-full bg-white border rounded-lg shadow-md">
            <div className="px-4 py-2 text-sm font-semibold text-gray-500 border-b">
              My Account
            </div>
            <Link
              to="/patient/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-gray-50"
            >
              <User size={16} /> View Profile
            </Link>
            <Link
              to="/patient/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm w-full hover:bg-gray-50"
            >
              <Settings size={16} /> Account Settings
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 w-full hover:bg-red-50">
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
