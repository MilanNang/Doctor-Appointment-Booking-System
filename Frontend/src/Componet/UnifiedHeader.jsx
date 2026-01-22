import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import API from "../pages/util/api";
import { logout } from "../Redux/authSlice";

export default function UnifiedHeader() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  // Close notification dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      if (Array.isArray(res.data)) {
        // show only unread notifications
        const unread = res.data.filter((n) => !n.isRead);
        setNotifications(unread.slice(0, 5)); // Show last 5 unread notifications
      }
    } catch (error) {
      console.log("Notifications not available");
    }
  };

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  const getInitial = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm sticky top-0 z-40">
      {/* Left: Welcome message */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          Welcome back,{" "}
          <span className="text-yellow-600">{user?.name || "User"}!</span>
        </h1>
        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-6">
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={async () => {
              const opening = !isNotificationOpen;
              setIsNotificationOpen(opening);

              // If opening the dropdown, mark currently fetched notifications as read
              if (opening && notifications.length > 0) {
                try {
                  await Promise.all(
                    notifications.map((n) => API.put(`/notifications/${n._id}/read`))
                  );
                } catch (err) {
                  console.error("Failed to mark notifications read", err);
                } finally {
                  // remove them from local list
                  setNotifications([]);
                }
              }
            }}
            className="relative p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Bell size={20} className="text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-yellow-500 rounded-full">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-800">
                  Notifications
                </h3>
                <button
                  onClick={fetchNotifications}
                  className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
                >
                  Refresh
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <p className="text-sm text-gray-800">
                        {notif.message || "New notification"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notif.createdAt
                          ? new Date(notif.createdAt).toLocaleDateString()
                          : "Just now"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-md flex items-center justify-center text-white font-bold text-sm">
            {getInitial(user?.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-full hover:bg-red-50 transition text-red-600"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
