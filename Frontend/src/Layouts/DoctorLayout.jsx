// src/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../pages/Doctor/Sidebar";
import UnifiedHeader from "../Componet/UnifiedHeader";

export default function DoctorLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar stays on the left */}
      <Sidebar />

      {/* Right side: Header + main content */}
      <div className="flex-1 flex flex-col">
        {/* Header at the top */}
        <UnifiedHeader />

        {/* Main content area */}
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
