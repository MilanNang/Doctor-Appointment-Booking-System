// src/pages/DoctorServices.jsx
import React, { useState } from "react";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function DoctorServices() {
  const [services, setServices] = useState([
    {
      id: 1,
      name: "General Consultation",
      desc: "30-min consultation session for general health checkup and diagnosis.",
      price: 50,
      duration: 30,
      appointments: 45,
      status: "active",
      category: "General",
    },
    {
      id: 2,
      name: "Pediatric Consultation",
      desc: "Specialized consultation for children’s health and growth checkups.",
      price: 70,
      duration: 45,
      appointments: 20,
      status: "paused",
      category: "Pediatrics",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    price: "",
    duration: "",
    category: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (editingService) {
      // Update existing service
      setServices(
        services.map((s) =>
          s.id === editingService.id ? { ...s, ...formData } : s
        )
      );
    } else {
      // Add new service
      setServices([
        ...services,
        {
          id: Date.now(),
          ...formData,
          price: Number(formData.price),
          duration: Number(formData.duration),
          appointments: 0,
          status: "active",
        },
      ]);
    }
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({
      name: "",
      desc: "",
      price: "",
      duration: "",
      category: "",
    });
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData(service);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const toggleStatus = (id) => {
    setServices(
      services.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "paused" : "active" }
          : s
      )
    );
  };

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Services</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600"
        >
          + Add New Service
        </button>
      </div>

      <p className="text-gray-500 mb-6">
        Manage your medical services and consultation offerings
      </p>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-5 rounded-xl shadow">
            <div className="flex justify-between items-start">
              <h2 className="text-lg font-semibold text-gray-800">
                {service.name}
              </h2>
              <div className="flex space-x-2 text-gray-500">
                <EyeIcon className="w-5 h-5 cursor-pointer hover:text-yellow-500" />
                <PencilSquareIcon
                  className="w-5 h-5 cursor-pointer hover:text-yellow-500"
                  onClick={() => handleEdit(service)}
                />
                <TrashIcon
                  className="w-5 h-5 cursor-pointer hover:text-red-500"
                  onClick={() => handleDelete(service.id)}
                />
              </div>
            </div>
            <span
              className={`text-sm px-2 py-1 rounded ${
                service.status === "active"
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {service.status}
            </span>
            <p className="text-gray-600 mt-3">{service.desc}</p>
            <div className="flex items-center space-x-6 mt-4">
              <p className="text-yellow-600 font-semibold">${service.price}</p>
              <p className="text-gray-500">{service.duration} min</p>
              <p className="text-gray-500">{service.appointments} appointments</p>
            </div>
            <div className="flex mt-4 space-x-3">
              <button
                onClick={() => toggleStatus(service.id)}
                className={`px-3 py-1 rounded border ${
                  service.status === "active"
                    ? "border-yellow-500 text-yellow-500 hover:bg-yellow-50"
                    : "border-green-500 text-green-500 hover:bg-green-50"
                }`}
              >
                {service.status === "active" ? "Pause" : "Activate"}
              </button>
              <button
                onClick={() => handleEdit(service)}
                className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600"
              >
                Edit Service
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {services.filter((s) => s.status === "active").length}
          </p>
          <p className="text-gray-500">Active Services</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-2xl font-bold text-purple-600">
            {services.reduce((acc, s) => acc + s.appointments, 0)}
          </p>
          <p className="text-gray-500">Total Appointments</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-2xl font-bold text-gray-800">
            $
            {(
              services.reduce((acc, s) => acc + s.price, 0) / services.length
            ).toFixed(0)}
          </p>
          <p className="text-gray-500">Avg Consultation Fee</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-2xl font-bold text-green-600">4.9</p>
          <p className="text-gray-500">Avg Rating</p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Background blur */}
          <div className="absolute inset-0 backdrop-blur-sm"></div>

          {/* Modal box */}
          <div className="relative bg-white rounded-lg w-full max-w-lg p-6 shadow-lg border border-yellow-300 z-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingService ? "Edit Service" : "Create New Service"}
              </h2>
              <XMarkIcon
                className="w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-700"
                onClick={() => setIsModalOpen(false)}
              />
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Service Title
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., General Consultation"
                  className="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  placeholder="Describe this service..."
                  className="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="30"
                    className="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Pediatrics"
                  className="w-full border border-yellow-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
              >
                {editingService ? "Save Changes" : "Create Service"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
