import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PublicHeader({ sticky = false }) {
  const location = useLocation();

  const navClass = (path) =>
    `hover:text-gray-800 ${location.pathname === path ? "text-gray-900 font-medium" : ""}`;

  return (
    <header className={`bg-white border-b ${sticky ? "sticky top-0 z-50" : ""}`}>
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold">
            H
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Happy Health</h1>
            <p className="text-xs muted">Care that makes you smile</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 muted text-sm">
          <Link to="/how-it-works" className={navClass("/how-it-works")}>How it works</Link>
          <Link to="/browse-doctors" className={navClass("/browse-doctors")}>Browse Doctors</Link>
          <Link to="/doctor-registration/step1" className={navClass("/doctor-registration/step1")}>Become a Doctor</Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900">Sign in</Link>
          <Link to="/signup" className="btn-primary text-sm">Sign up</Link>
        </div>
      </div>
    </header>
  );
}
