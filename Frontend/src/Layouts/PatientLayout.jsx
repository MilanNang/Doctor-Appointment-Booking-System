import { Outlet } from "react-router-dom";
import Sidebar from "../pages/Patient/PatientSidebar";
import Header from "../pages/Patient/Header";

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <Header />

        {/* Dynamic content (Dashboard, Bookings, etc.) */}
        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
