import React, { useState, useRef, useEffect } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white shadow-sm relative">
      {/* Left: Page Title */}
      <h1 className="text-lg font-semibold">Welcome back, Sarah Chen!</h1>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            3
          </span>
          <button className="p-2 rounded-full hover:bg-yellow-100">🔔</button>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-yellow-100"
          >
            <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-medium">Sarah Chen</span>
            <span className="text-sm">▼</span>
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-lg border border-slate-200 z-50">
              <ul className="py-2">
                <li>
                  <a href="/my-account" className="block px-4 py-2 text-sm hover:bg-yellow-50">
                    My Account
                  </a>
                </li>
                <li>
                  <a href="/profile" className="block px-4 py-2 text-sm hover:bg-yellow-50">
                    Profile Settings
                  </a>
                </li>
                <li>
                  <a href="/billing" className="block px-4 py-2 text-sm hover:bg-yellow-50">
                    Billing
                  </a>
                </li>
                <li>
                  <a href="/support" className="block px-4 py-2 text-sm hover:bg-yellow-50">
                    Support
                  </a>
                </li>
              </ul>
              <div className="border-t">
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
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
