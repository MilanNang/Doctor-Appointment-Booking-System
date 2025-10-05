import React from "react";
import { Link, useNavigate } from "react-router-dom";
import gen from "../assets/General Physicians.jpeg";
import dent from "../assets/Dentiist.jpeg";
import Neurologists from "../assets/Neurologists.jpeg";
import Pediatrics from "../assets/Pediatrics.jpeg";
import den from "../assets/Dermatologists.jpeg";
import Cardiologists from "../assets/Cardiologists.jpeg";

export default function HomePage() {
  const navigate = useNavigate();

  // 🧩 Handle Become a Doctor
  const handleDoctorClick = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "doctor" && user.token) {
      navigate("/doctor");
    } else {
      navigate("/login");
    }
  };

  // 🧩 Handle Patient Booking
  const handleBookClick = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "patient" && user.token) {
      navigate("/patient/browse-services");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="bg-yellow-50 min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-yellow-50 shadow-sm">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <h1 className="text-xl font-bold text-yellow-600">
            Appointment App
          </h1>

          <nav className="flex items-center space-x-6">
            <Link
              to="/how-it-works"
              className="text-gray-700 hover:text-yellow-600"
            >
              How it works
            </Link>
            <Link
              to="/patient/browse-services"
              className="text-gray-700 hover:text-yellow-600"
            >
              Browse Doctors
            </Link>
            <button
              onClick={handleDoctorClick}
              className="text-gray-700 hover:text-yellow-600"
            >
              Become a Doctor
            </button>
          </nav>

          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-700 hover:text-yellow-600">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
            >
              Join Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-20 bg-yellow-50">
        <h2 className="text-4xl font-bold text-gray-800 leading-snug">
          Find the Perfect <span className="text-yellow-600">Doctor</span> <br />
          for Your Appointment
        </h2>
        <p className="mt-4 text-gray-600 max-w-xl">
          Connect with top doctors or offer your expertise to patients
          worldwide. Built for efficiency, trust, and quality healthcare service.
        </p>
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleBookClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Book Appointment
          </button>
          <button
            onClick={handleDoctorClick}
            className="border border-yellow-500 text-yellow-600 hover:bg-yellow-100 px-6 py-3 rounded-lg font-medium"
          >
            Offer Service
          </button>
        </div>
      </section>

      {/* Explore Services Section */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-10">
            Explore Services
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { name: "General Physicians", img: gen },
              { name: "Dentists", img: dent },
              { name: "Dermatologists", img: den },
              { name: "Neurologists", img: Neurologists },
              { name: "Pediatricians", img: Pediatrics },
              { name: "Cardiologists", img: Cardiologists },
            ].map((service, idx) => (
              <div
                key={idx}
                className="bg-yellow-50 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <img
                  src={service.img}
                  alt={service.name}
                  className="h-40 w-full object-cover"
                />
                <h4 className="text-lg font-semibold text-gray-700 py-3">
                  {service.name}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-yellow-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-10">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h4 className="text-xl font-semibold text-yellow-600 mb-2">
                1. Register
              </h4>
              <p className="text-gray-600">
                Sign up as a patient or doctor to start using our appointment
                system.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h4 className="text-xl font-semibold text-yellow-600 mb-2">
                2. Book or Offer Services
              </h4>
              <p className="text-gray-600">
                Patients can book appointments, and doctors can offer their
                medical expertise.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
              <h4 className="text-xl font-semibold text-yellow-600 mb-2">
                3. Attend Appointment
              </h4>
              <p className="text-gray-600">
                Join your scheduled appointment and get the best healthcare
                support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-yellow-600 text-white py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <h4 className="text-lg font-bold">Appointment App</h4>
          <p className="text-sm mt-2 md:mt-0">
            © {new Date().getFullYear()} All rights reserved.
          </p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <Link to="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:underline">
              Terms
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
