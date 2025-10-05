import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../util/api";
import { setDoctorProfile } from "../../Redux/doctorSlice";
import { logout } from "../../Redux/authSlice";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { doctorProfile } = useSelector((state) => state.doctor);

  // Fetch doctor data from backend
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await API.get("/doctors/me");
        dispatch(setDoctorProfile(data));
      } catch (err) {
        console.warn("Doctor profile not found yet", err);
      }
    };
    if (user?._id) fetchDoctor();
  }, [user, dispatch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sign Out
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Get initials if no profile image
  const getInitial = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm relative">
      {/* Left: Page Title */}
      <h1 className="text-lg font-semibold">
        Welcome back,{" "}
        <span className="text-yellow-600">
          {doctorProfile?.name || user?.name || "Doctor"}!
        </span>
      </h1>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          {notifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {notifications}
            </span>
          )}
          <button
            className="p-2 rounded-full hover:bg-yellow-100"
            onClick={() => alert("Notifications feature coming soon!")}
          >
            🔔
          </button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-yellow-100"
          >
            {/* Profile Image or Initial */}
            {doctorProfile?.profileImage ? (
              <img
                src={doctorProfile.profileImage}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-yellow-400"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
                {getInitial(doctorProfile?.name || user?.name)}
              </div>
            )}

            <span className="font-medium">
              {doctorProfile?.name || user?.name || "Doctor"}
            </span>
            <span className="text-sm">▼</span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-lg border border-slate-200 z-50">
              <ul className="py-2">
                <li>
                  <button
                    onClick={() => navigate("/doctor/profile")}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-yellow-50"
                  >
                    My Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/doctor/calendar")}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-yellow-50"
                  >
                    Availability
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/billing")}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-yellow-50"
                  >
                    Billing
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/support")}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-yellow-50"
                  >
                    Support
                  </button>
                </li>
              </ul>
              <div className="border-t">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
