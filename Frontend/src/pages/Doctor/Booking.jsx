// src/pages/Bookings.jsx
import React, { useState } from "react";
import { Calendar, Clock, Star } from "lucide-react";

const tabs = ["All", "Pending", "Confirmed", "Completed"];

const sampleBookings = [
  {
    id: 1,
    name: "Alex Johnson",
    rating: 4.8,
    title: "Website UI/UX Design",
    desc: "Need a redesign of our e-commerce website with modern aesthetics.",
    date: "Sun, Dec 22, 2024",
    time: "10:00 AM",
    duration: 180,
    price: 1200,
    status: "pending",
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 4.9,
    title: "Logo Design",
    desc: "Professional logo design for clean startup aesthetic.",
    date: "Sun, Dec 15, 2024",
    time: "4:00 PM",
    duration: 60,
    price: 450,
    status: "completed",
  },
  {
    id: 3,
    name: "Emma Davis",
    rating: 5.0,
    title: "Mobile App Design",
    desc: "iOS & Android app for fitness tracking.",
    date: "Sat, Jan 12, 2025",
    time: "2:30 PM",
    duration: 90,
    price: 800,
    status: "confirmed",
  },
];

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("All");

  const filteredBookings =
    activeTab === "All"
      ? sampleBookings
      : sampleBookings.filter((b) => b.status === activeTab.toLowerCase());

  return (
    <div className="p-6 bg-yellow-50 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800">My Bookings</h1>
      <p className="text-gray-600 mb-6">
        Manage your upcoming and past bookings
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-yellow-600 text-xl font-bold">1</p>
          <p className="text-gray-500 text-sm">Pending</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-green-600 text-xl font-bold">2</p>
          <p className="text-gray-500 text-sm">Confirmed</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-blue-600 text-xl font-bold">1</p>
          <p className="text-gray-500 text-sm">Completed</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-purple-600 text-xl font-bold">$4,300</p>
          <p className="text-gray-500 text-sm">Total Value</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
              activeTab === tab
                ? "bg-yellow-400 text-white"
                : "bg-white text-gray-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab} (
            {
              (tab === "All"
                ? sampleBookings
                : sampleBookings.filter(
                    (b) => b.status === tab.toLowerCase()
                  )
              ).length
            }
            )
          </button>
        ))}
      </div>

      {/* Booking List */}
      <div className="space-y-4">
        {filteredBookings.map((b) => (
          <div
            key={b.id}
            className="bg-white shadow rounded-xl p-5 flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                {b.name[0]}
              </div>
              <div>
                <p className="font-semibold">{b.name}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  {b.rating}
                </div>
              </div>
              <span
                className={`ml-auto text-xs px-3 py-1 rounded-full capitalize ${
                  b.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : b.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {b.status}
              </span>
            </div>

            {/* Title & Desc */}
            <div>
              <h2 className="text-lg font-bold text-gray-800">{b.title}</h2>
              <p className="text-sm text-gray-500">{b.desc}</p>
            </div>

            {/* Info */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-yellow-500" />
                {b.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" />
                {b.time} ({b.duration}min)
              </div>
              <div className="ml-auto text-green-600 font-bold">
                ${b.price}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              {b.status === "pending" && (
                <>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    Accept
                  </button>
                  <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200">
                    Decline
                  </button>
                </>
              )}
              <button className="bg-purple-100 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-200">
                Message
              </button>
              <button className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg hover:bg-yellow-200">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
