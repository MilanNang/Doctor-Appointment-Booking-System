import { Outlet } from "react-router-dom";
import Sidebar from "../pages/Patient/PatientSidebar";
import UnifiedHeader from "../Componet/UnifiedHeader";

const PatientLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <UnifiedHeader />

        {/* Dynamic content (Dashboard, Bookings, etc.) */}
        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PatientLayout;
