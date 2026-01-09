// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Doctor imports
import DoctorLayout from "./Layouts/DoctorLayout";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import DoctorProfile from "./pages/Doctor/Profile";
import Billing from "./pages/Doctor/Billing";
import DoctorCalendar from "./pages/Doctor/Calendar";
import DoctorBooking from "./pages/Doctor/Booking";


// Patient imports
import PatientLayout from "./Layouts/PatientLayout";
import PatientDashboard from "./pages/Patient/Dashboard";
import BrowseServices from "./pages/Patient/Browse";
import MyBookings from "./pages/Patient/Booking";
import PatientCalendar from "./pages/Patient/Calender";

// Admin imports
 import AdminLayout from "./Layouts/AdminLayout";
 import AdminDashboard from "./pages/Admin/Dashboard";
 import ManageDoctors from "./pages/Admin/ManageDoctors";
 import ManagePatients from "./pages/Admin/ManagePatients";
 import ManageAppointments from "./pages/Admin/ManageAppointments";
 import Reports from "./pages/Admin/Reports";
 import Settings from "./pages/Admin/Seting";
 import Payments from "./pages/Admin/Payments";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Doctor side */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="calendar" element={<DoctorCalendar />} />
          <Route path="bookings" element={<DoctorBooking />} />
          <Route path="billing" element={<Billing />} />
        </Route>

        {/* Patient side */}
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="browse-services" element={<BrowseServices />} />
          <Route path="appointments" element={<MyBookings />} />
          <Route path="calendar/:id" element={<PatientCalendar />} />
        </Route>

        {/* Admin side */}
         <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="doctors" element={<ManageDoctors />} />
          <Route path="patients" element={<ManagePatients />} />
          <Route path="appointments" element={<ManageAppointments />} />
          <Route path="report" element={<Reports />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
