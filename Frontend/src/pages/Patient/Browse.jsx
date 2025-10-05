import React, { useState } from "react";
import { Search, MapPin, Star } from "lucide-react";

export default function BrowseDoctors() {
  const [filters, setFilters] = useState({
    specialty: "All Specialties",
    price: "All Prices",
    rating: "All Ratings",
    availability: "All Availability",
  });

  const doctors = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      specialty: "Cardiologist",
      rating: 4.9,
      reviews: 127,
      location: "San Francisco, CA",
      responseTime: "1 hour",
      fee: 100,
      availability: "Available",
      tags: ["Heart Specialist", "Cardiology", "Preventive Care"],
    },
    {
      id: 2,
      name: "Dr. Marcus Rodriguez",
      specialty: "Dermatologist",
      rating: 4.8,
      reviews: 93,
      location: "Austin, TX",
      responseTime: "2 hours",
      fee: 80,
      availability: "Available",
      tags: ["Skin", "Acne", "Allergy"],
    },
    {
      id: 3,
      name: "Dr. Emma Thompson",
      specialty: "Pediatrician",
      rating: 4.9,
      reviews: 156,
      location: "New York, NY",
      responseTime: "4 hours",
      fee: 65,
      availability: "Busy",
      tags: ["Child Care", "Immunization", "Growth"],
    },
    {
      id: 4,
      name: "Dr. David Kim",
      specialty: "Dentist",
      rating: 4.7,
      reviews: 78,
      location: "Seattle, WA",
      responseTime: "3 hours",
      fee: 75,
      availability: "Available",
      tags: ["Oral Care", "Braces", "Teeth Whitening"],
    },
  ];

  return (
    <div className="p-6 bg-yellow-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Browse Doctors</h1>
      <p className="text-slate-600 mb-6">Find the perfect doctor for your needs</p>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center flex-1 border rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-slate-500 mr-2" />
          <input
            type="text"
            placeholder="Search by doctor name, specialty..."
            className="w-full outline-none"
          />
        </div>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.specialty}
          onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
        >
          <option>All Specialties</option>
          <option>Cardiologist</option>
          <option>Dermatologist</option>
          <option>Pediatrician</option>
          <option>Dentist</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.price}
          onChange={(e) => setFilters({ ...filters, price: e.target.value })}
        >
          <option>All Prices</option>
          <option>Below $50</option>
          <option>$50 - $100</option>
          <option>$100 - $200</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
        >
          <option>All Ratings</option>
          <option>4+ Stars</option>
          <option>4.5+ Stars</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.availability}
          onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
        >
          <option>All Availability</option>
          <option>Available</option>
          <option>Busy</option>
        </select>
      </div>

      {/* Results */}
      <p className="mt-4 text-slate-600">{doctors.length} doctors found</p>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl shadow-md p-6 border hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
            {/* Doctor Info */}
            <h3 className="text-xl font-bold text-slate-800">{doc.name}</h3>
            <p className="text-sm text-slate-600">{doc.specialty}</p>

            <div className="flex items-center text-sm text-slate-500 mt-3 gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                {doc.rating} ({doc.reviews})
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {doc.location}
              </span>
              <span>⏱ {doc.responseTime}</span>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 mt-3">
              Expert {doc.specialty.toLowerCase()} providing patient-focused care
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {doc.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-slate-100 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Price & Buttons */}
            <div className="flex justify-between items-center mt-6">
              <div>
                <div className="text-xl font-bold text-yellow-600">
                  ${doc.fee}
                  <span className="text-sm font-medium text-slate-600 ml-1">
                    /consult
                  </span>
                </div>
                <span
                  className={`text-xs font-medium ${
                    doc.availability === "Available"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {doc.availability}
                </span>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 border rounded-lg text-slate-700 hover:bg-yellow-50 transition">
                  View Profile
                </button>
                <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition">
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center mt-10">
        <button className="px-6 py-2 border-2 border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition">
          Load More Doctors
        </button>
      </div>
    </div>
  );
}
