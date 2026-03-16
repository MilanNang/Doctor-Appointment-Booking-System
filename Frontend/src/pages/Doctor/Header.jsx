import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch, shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../util/api";
import { setDoctorProfile } from "../../Redux/doctorSlice";
import { logout } from "../../Redux/authSlice";
import {
  appendDismissedNotificationIds,
  buildStatusNotifications,
  getDismissedNotificationIds
} from "../../utils/statusNotifications";
import { getInitials } from "../../utils/initials";

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Use shallowEqual to prevent re-renders if user object reference changes but content is same
  const { user } = useSelector((state) => state.auth, shallowEqual);
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

  // Build notifications dynamically from appointment statuses
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await API.get("/appointments/doctor");
        const allNotifications = buildStatusNotifications({ appointments: data || [], role: "doctor" });
        const dismissedSet = getDismissedNotificationIds({ userId: user?._id, role: "doctor" });
        setNotifications(allNotifications.filter((item) => !dismissedSet.has(item.eventId)));
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    if (user?._id) fetchNotifications();
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sign Out
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleNotificationClick = async (notification) => {
    appendDismissedNotificationIds({
      userId: user?._id,
      role: "doctor",
      ids: [notification.eventId]
    });
    setNotifications((prev) => prev.filter((item) => item.eventId !== notification.eventId));

    // Navigate if there's a link
    if (notification.link) navigate(notification.link);
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
        <div className="relative" ref={notificationRef}>
          {notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {notifications.length}
            </span>
          )}
          <button
            className="p-2 rounded-full hover:bg-yellow-100"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            🔔
          </button>

          {/* Notification Popup */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-slate-200 z-50">
              <div className="p-3 font-semibold border-b">Notifications</div>
              <ul className="py-1 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <li
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      className="px-4 py-3 text-sm cursor-pointer bg-blue-50 font-medium text-gray-800 hover:bg-yellow-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                        <p>{n.message}</p>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="px-4 py-6 text-center text-sm text-gray-500">
                    You have no notifications.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
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
                {getInitials(doctorProfile?.name || user?.name)}
              </div>
            )}

            <span className="font-medium">
              {doctorProfile?.name || user?.name || "Doctor"}
            </span>
            <span className="text-sm">▼</span>
          </button>

          {isProfileOpen && (
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
                    onClick={() => navigate("/doctor/profile")}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-yellow-50"
                  >
                    Settings
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
